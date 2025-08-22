import { UserRepository } from '../repositories/UserRepository';
import { UserRole, OTPType, JWTPayload } from '../types';
import { hashPassword, comparePassword, generateOTP } from '../utils/helpers';
import { createError } from '../utils/errorHandler';
import { logger } from '../utils/logger';
import config from '../config';
import { OTPRepository } from '../repositories/OTPRepository';
import jwt, { SignOptions, Secret } from 'jsonwebtoken';
import { injectable, inject } from 'tsyringe';
import { IAuthService } from '../interfaces/IService/IAuthService';
import { IOTPRepository } from '../interfaces/IRepository/IOTPRepository';
import { IUserRepository } from '../interfaces/IRepository/IUserRepository';
import { IUser } from '../interfaces/IModel/IUser';
import { IEmailService } from '../interfaces/IService/IEmailService';

@injectable()
export class AuthService implements IAuthService {

  constructor(
    @inject('UserRepository') private userRepository: IUserRepository,
    @inject('OTPRepository') private otpRepository: IOTPRepository,
    @inject('EmailService') private emailService: IEmailService
  ) {}

  async register(userData: {
    fullName: string;
    email: string;
    phone: string;
    password: string;
    role?: UserRole;
  }): Promise<{ user: IUser; accessToken: string; refreshToken:string }> {
    try {
      // Check if user already exists
      const existingUser = await this.userRepository.findByEmailOrPhone(
        userData.email,
        userData.phone
      );

      if (existingUser) {
        if (existingUser.email === userData.email.toLowerCase()) {
          throw createError('Email already registered', 400);
        }
        if (existingUser.phone === userData.phone) {
          throw createError('Phone number already registered', 400);
        }
      }

      // Hash password
      const hashedPassword = await hashPassword(userData.password);

      // Create user
      const user = await this.userRepository.create({
        ...userData,
        email: userData.email.toLowerCase(),
        password: hashedPassword,
        role: userData.role || UserRole.CUSTOMER,
      });

      // Generate JWT token
      const accessToken = this.generateAccessToken(user);
      const refreshToken = this.generateRefreshToken(user)

      // Generate verification OTPs
      await this.generateVerificationOTPs(user._id.toString(),user.email,);

      logger.info(`User registered successfully: ${user.email}`);

      return { user, accessToken, refreshToken };
    } catch (error) {
      logger.error('Registration failed:', error);
      throw error;
    }
  }

  

  async login(email: string, password: string): Promise<{ user: IUser; accessToken: string; refreshToken: string }> {
    try {
      // Find user by email
      const user = await this.userRepository.findByEmail(email);
      if (!user) {
        throw createError('Invalid credentials', 401);
      }

      // Check if user is active
      if (!user.isActive) {
        throw createError('Account is deactivated', 401);
      }

      // Verify password
      const isPasswordValid = await comparePassword(password, user.password);
      if (!isPasswordValid) {
        throw createError('Invalid credentials', 401);
      }

      // Update last login
      await this.userRepository.updateLastLogin(user._id.toString());

      // Generate JWT token
      const accessToken = this.generateAccessToken(user);
      const refreshToken = this.generateRefreshToken(user);

      logger.info(`User logged in successfully: ${user.email}`);

      return { user, accessToken, refreshToken };
    } catch (error) {
      logger.error('Login failed:', error);
      throw error;
    }
  }

  async requestPasswordReset(email: string): Promise<void> {
    try {
      const user = await this.userRepository.findByEmail(email);
      if (!user) {
        // Don't reveal if email exists or not for security
        return;
      }

      // Generate OTP for password reset
      const otpCode = generateOTP(6);
      await this.otpRepository.createOTP(
        user._id.toString(),
        OTPType.EMAIL_VERIFICATION,
        otpCode,
        undefined,
        30 // 30 minutes expiration
      );

      // TODO: Send email with OTP
      this.emailService.sendOtpEmail(user.email, otpCode);
      logger.info(`Password reset OTP generated for user: ${user.email}`);
    } catch (error) {
      logger.error('Password reset request failed:', error);
      throw error;
    }
  }

  async resetPassword(email: string, otpCode: string, newPassword: string): Promise<void> {
    try {
      const user = await this.userRepository.findByEmail(email);
      if (!user) {
        throw createError('Invalid request', 400);
      }

      // Verify OTP
      const otpVerification = await this.otpRepository.verifyOTP(
        user._id.toString(),
        OTPType.EMAIL_VERIFICATION,
        otpCode
      );

      if (!otpVerification.success) {
        throw createError(otpVerification.message, 400);
      }

      // Hash new password
      const hashedPassword = await hashPassword(newPassword);

      // Update password
      await this.userRepository.update(user._id.toString(), {
        password: hashedPassword,
      });

      logger.info(`Password reset successfully for user: ${user.email}`);
    } catch (error) {
      logger.error('Password reset failed:', error);
      throw error;
    }
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    try {
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw createError('User not found', 404);
      }

      // Get user with password field
      const userWithPassword = await this.userRepository.findByEmail(user.email);
      if (!userWithPassword) {
        throw createError('User not found', 404);
      }

      // Verify current password
      const isCurrentPasswordValid = await comparePassword(
        currentPassword,
        userWithPassword.password
      );
      if (!isCurrentPasswordValid) {
        throw createError('Current password is incorrect', 400);
      }

      // Hash new password
      const hashedPassword = await hashPassword(newPassword);

      // Update password
      await this.userRepository.update(userId, {
        password: hashedPassword,
      });

      logger.info(`Password changed successfully for user: ${user.email}`);
    } catch (error) {
      logger.error('Password change failed:', error);
      throw error;
    }
  }

  async requestOTPVerification(userId: string, type: OTPType): Promise<void> {
    try {
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw createError('User not found', 404);
      }

      // Generate OTP
      const otpCode = generateOTP(6);
      await this.otpRepository.createOTP(
        userId,
        type,
        otpCode,
        undefined,
        config.otp.expirationMinutes
      );

      // TODO: Send OTP via SMS or email based on type
      if (type === OTPType.PHONE_VERIFICATION) {
        // await this.smsService.sendOTP(user.phone, otpCode);
      } else if (type === OTPType.EMAIL_VERIFICATION) {
        await this.emailService.sendOtpEmail(user.email, otpCode);
      }

      logger.info(`OTP requested for user: ${user.email}, type: ${type}`);
    } catch (error) {
      logger.error('OTP request failed:', error);
      throw error;
    }
  }

  async verifyOTP(userId: string, type: OTPType, otpCode: string): Promise<void> {
    try {
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw createError('User not found', 404);
      }

      // Verify OTP
      const otpVerification = await this.otpRepository.verifyOTP(userId, type, otpCode);

      if (!otpVerification.success) {
        throw createError(otpVerification.message, 400);
      }

      // Update user verification status
      if (type === OTPType.EMAIL_VERIFICATION) {
        await this.userRepository.verifyEmail(userId);
      } else if (type === OTPType.PHONE_VERIFICATION) {
        await this.userRepository.verifyPhone(userId);
      }

      logger.info(`OTP verified successfully for user: ${user.email}, type: ${type}`);
    } catch (error) {
      logger.error('OTP verification failed:', error);
      throw error;
    }
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      const decoded = jwt.verify(refreshToken, config.jwtSecret) as JWTPayload;
      
      const user = await this.userRepository.findById(decoded.userId);
      if (!user || !user.isActive) {
        throw createError('Invalid token', 401);
      }

      const newAccessToken = this.generateAccessToken(user);

      return { accessToken: newAccessToken };
    } catch (error) {
      logger.error('Token refresh failed:', error);
      throw createError('Invalid token', 401);
    }
  }

  async logout(userId: string): Promise<void> {
    try {
      // In a more sophisticated implementation, you might want to:
      // 1. Add token to a blacklist
      // 2. Update user's last logout time
      // 3. Clear any active sessions

      logger.info(`User logged out: ${userId}`);
    } catch (error) {
      logger.error('Logout failed:', error);
      throw error;
    }
  }

  private generateAccessToken(user: IUser): string {
    const payload: Omit<JWTPayload, 'iat' | 'exp'> = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const secret: Secret = config.jwtSecret;
  const options: SignOptions = {
    expiresIn: config.jwtExpiration as `${number}${"ms" | "s" | "m" | "h" | "d" | "w" | "y"}` | number,
  };
    
    return jwt.sign(payload, secret, options);
  }

  private generateRefreshToken(user: IUser): string {
    const payload: Omit<JWTPayload, 'iat' | 'exp'> = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const secret: Secret = config.jwtSecret;
    const options: SignOptions = {
      expiresIn: config.jwtRefreshExpiration as `${number}${"ms" | "s" | "m" | "h" | "d" | "w" | "y"}` | number,
    };
    
    return jwt.sign(payload, secret, options);
  }

  private async generateVerificationOTPs(userId: string,email: string): Promise<void> {
    try {
      // Generate email verification OTP
      const emailOTP = generateOTP(6);
      await this.otpRepository.createOTP(
        userId,
        OTPType.EMAIL_VERIFICATION,
        emailOTP,
        undefined,
        config.otp.expirationMinutes
      );

      // Generate phone verification OTP
      const phoneOTP = generateOTP(6);
      await this.otpRepository.createOTP(
        userId,
        OTPType.PHONE_VERIFICATION,
        phoneOTP,
        undefined,
        config.otp.expirationMinutes
      );
      console.log('emailOTP===>',emailOTP);
      console.log('phoneOTP===>',phoneOTP);

      
      // TODO: Send OTPs via email and SMS
      await this.emailService.sendOtpEmail(email, emailOTP);
      // await this.smsService.sendVerificationOTP(user.phone, phoneOTP);
    } catch (error) {
      logger.error('Failed to generate verification OTPs:', error);
      // Don't throw error as this is not critical for registration
    }
  }

  async validateToken(token: string): Promise<JWTPayload> {
    try {
      const decoded = jwt.verify(token, config.jwtSecret) as JWTPayload;
      
      const user = await this.userRepository.findById(decoded.userId);
      if (!user || !user.isActive) {
        throw createError('Invalid token', 401);
      }

      return decoded;
    } catch (error) {
      throw createError('Invalid token', 401);
    }
  }

  async getUserFromToken(token: string): Promise<IUser> {
    try {
      const decoded = await this.validateToken(token);
      const user = await this.userRepository.findById(decoded.userId);
      
      if (!user) {
        throw createError('User not found', 404);
      }

      return user;
    } catch (error) {
      throw error;
    }
  }
}