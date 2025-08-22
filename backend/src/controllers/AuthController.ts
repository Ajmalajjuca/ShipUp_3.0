import { Request, Response, NextFunction } from 'express';
import { OTPType } from '../types';
import { AuthService } from '../services/AuthService';
import { asyncHandler } from '../utils/errorHandler';
import { sendError, sendSuccess } from '../utils/response';
import { injectable, inject } from 'tsyringe';
import { IAuthService } from '../interfaces/IService/IAuthService';

@injectable()
export class AuthController {

  constructor(
    @inject('AuthService') private authService: IAuthService
  ) {}

  register = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    console.log('Request body:', req.body);
    
    const { user, accessToken, refreshToken } = await this.authService.register(req.body);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'lax' : 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    sendSuccess(res, 'User registered successfully', {
      user,
      accessToken,
      refreshToken
    }, 201);
  });

  

  login = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    
    const { email, password } = req.body;
    const { user, accessToken, refreshToken  } = await this.authService.login(email, password);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'lax' : 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });
    
    sendSuccess(res, 'Login successful', {
      user,
      accessToken,
      refreshToken
    });
  });

  requestPasswordReset = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;
    await this.authService.requestPasswordReset(email);
    
    sendSuccess(res, 'Password reset OTP sent to your email');
  });

  resetPassword = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { email, otpCode, newPassword } = req.body;
    await this.authService.resetPassword(email, otpCode, newPassword);
    
    sendSuccess(res, 'Password reset successfully');
  });

  changePassword = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user!.userId;
    
    await this.authService.changePassword(userId, currentPassword, newPassword);
    
    sendSuccess(res, 'Password changed successfully');
  });

  requestOTP = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { type } = req.body;
    const userId = req.user!.userId;
    
    await this.authService.requestOTPVerification(userId, type as OTPType);
    
    sendSuccess(res, `${type} OTP sent successfully`);
  });

  verifyOTP = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { code, type } = req.body;
    console.log('req.user>>', req.user);
    
    const userId = req.user!.userId;
    
    await this.authService.verifyOTP(userId, type as OTPType, code);
    
    sendSuccess(res, `${type} verified successfully`);
  });

  refreshToken = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return sendError(res, 'Refresh token required', 400);
    }
    
    const { accessToken: newAccessToken } = await this.authService.refreshToken(refreshToken);
    
    sendSuccess(res, 'Token refreshed successfully', { accessToken: newAccessToken });
  });

  logout = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.userId;
    console.log('logout userId>>', userId);
    
    await this.authService.logout(userId);
    res.clearCookie('refreshToken', {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'lax' : 'strict',
  path: '/', // or same path used when setting
});
    
    sendSuccess(res, 'Logout successful');
  });

  getProfile = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return sendError(res, 'Token required', 400);
    }
    
    const user = await this.authService.getUserFromToken(token);
    
    sendSuccess(res, 'Profile retrieved successfully', { user });
  });

  validateToken = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { token } = req.body;
    
    const payload = await this.authService.validateToken(token);
    
    sendSuccess(res, 'Token is valid', { payload });
  });
}

