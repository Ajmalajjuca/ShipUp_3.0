// src/services/PartnerService.ts
import { injectable, inject } from 'tsyringe';
import { IPartnerRepository } from '../interfaces/IRepository/IPartnerRepository';
import { IOTPRepository } from '../interfaces/IRepository/IOTPRepository';
import { createError } from '../utils/errorHandler';
import { logger } from '../utils/logger';
import { generateOTP } from '../utils/helpers';
import { DocumentStatus, JWTPayload, OTPType, PartnerRegistrationData, UserRole } from '../types';
import config from '../config';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { IPartner } from '../interfaces/IModel/IPartner';



@injectable()
export class PartnerService {
  constructor(
    @inject('PartnerRepository') private partnerRepository: IPartnerRepository,
    @inject('OTPRepository') private otpRepository: IOTPRepository
  ) {}

  async register(
    registrationData: PartnerRegistrationData, 
    fileUrls: { [key: string]: string }
  ): Promise<{ partner: IPartner; message: string; accessToken: string; refreshToken: string }> {
    try {
      // Check if partner already exists
      const existingPartner = await this.partnerRepository.findByEmailOrMobile(
        registrationData.email,
        registrationData.phone
      );

      if (existingPartner) {
        if (existingPartner.email === registrationData.email.toLowerCase()) {
          throw createError('Email already registered', 400);
        }
        if (existingPartner.phone === registrationData.phone) {
          throw createError('Mobile number already registered', 400);
        }
      }

      // Generate unique partner ID
      const partnerId = await this.generatePartnerId();

      // Create partner
      console.log('fileUrls', fileUrls);
      console.log('registrationData', registrationData);
      
      
      const partner = await this.partnerRepository.create({
      ...registrationData,
      partnerId,
      dateOfBirth: new Date(registrationData.dateOfBirth),
      
      // Add document URLs directly to the partner record
      
        profilePicture: fileUrls.profilePicture || '',
        personalDocuments: {
          aadharFront: fileUrls.aadharFront || '',
          aadharBack: fileUrls.aadharBack || '',
          panFront: fileUrls.panFront || '',
          panBack: fileUrls.panBack || '',
          licenseFront: fileUrls.licenseFront || '',
          licenseBack: fileUrls.licenseBack || '',
        },
        vehicalDocuments: {
          insuranceDocument: fileUrls.insuranceDocument || '',
          pollutionDocument: fileUrls.pollutionDocument || '',
          registrationNumber: registrationData.vehicalDocuments.registrationNumber,
          vehicleType: registrationData.vehicalDocuments.vehicleType

        }
          });

          const accessToken = this.generateAccessToken(partner);
      const refreshToken = this.generateRefreshToken(partner);

      // Process and save documents

      logger.info(`Partner registered successfully: ${partner.email}`);

      return {
        partner,
        message: 'Registration successful! Your application is under review.',
        accessToken,
        refreshToken

      };

    } catch (error) {
      logger.error('Partner registration failed:', error);
      throw error;
    }
  }

  async requestLoginOtp(email: string): Promise<{ message: string }> {
    try {
      const partner = await this.partnerRepository.findByEmail(email);
      if (!partner) {
        throw createError('Email not found. This email is not registered as a delivery partner.', 404);
      }

      if (!partner.isActive) {
        throw createError('Account is deactivated', 401);
      }

      // Generate OTP for login
      const otpCode = generateOTP(6);
      await this.otpRepository.createOTP(
        partner._id.toString(),
        OTPType.EMAIL_VERIFICATION,
        otpCode,
        undefined,
        15 // 15 minutes expiration
      );

      // TODO: Send email with OTP
      // await this.emailService.sendLoginOTP(partner.email, otpCode);

      logger.info(`Login OTP generated for partner: ${partner.email}`);
      console.log(`Login OTP for ${email}: ${otpCode}`); // For development

      return { message: 'OTP sent successfully to your email' };

    } catch (error) {
      logger.error('Login OTP request failed:', error);
      throw error;
    }
  }

  async verifyLoginOtp(email: string, otp: string): Promise<{
    user: any;
    accessToken: string;
    refreshToken: string;
  }> {
    try {
      const partner = await this.partnerRepository.findByEmail(email);
      if (!partner) {
        throw createError('Invalid request', 400);
      }

      if (!partner.isActive) {
        throw createError('Account is deactivated', 401);
      }

      // Verify OTP
      const otpVerification = await this.otpRepository.verifyOTP(
        partner._id.toString(),
        OTPType.EMAIL_VERIFICATION,
        otp
      );

      if (!otpVerification.success) {
        throw createError(otpVerification.message, 400);
      }

      // Update last login
      await this.partnerRepository.updateLastLogin(partner._id.toString());

      // Generate tokens
      const accessToken = this.generateAccessToken(partner);
      const refreshToken = this.generateRefreshToken(partner);

      // Get verification status
      const verificationStatus = await this.getVerificationStatus(partner._id.toString());

      logger.info(`Partner logged in successfully: ${partner.email}`);

      return {
        user: {
          id: partner._id.toString(),
          email: partner.email,
          fullName: partner.fullName,
          partnerId: partner.partnerId,
          role: 'partner',
          isVerified: partner.isVerified,
          verificationStatus: verificationStatus.verificationStatus
        },
        accessToken,
        refreshToken
      };

    } catch (error) {
      logger.error('Login OTP verification failed:', error);
      throw error;
    }
  }

async getVerificationStatus(partnerId: string): Promise<{
  isVerified: boolean;
  verificationStatus: {
    personalInformation: boolean;
    personalDocuments: boolean;
    vehicalDocuments: boolean;
    bankingDetails: boolean;
  };
}> {
  try {
    const partner = await this.partnerRepository.getDocumentsByPartnerId(partnerId);
    if (!partner) {
      throw createError('Partner not found', 404);
    }

    
    const verificationStatus = {
      // Personal information is true if basic fields exist (no admin approval needed)
      personalInformation: !!(
        partner.fullName && 
        partner.email && 
        partner.phone && 
        partner.dateOfBirth && 
        partner.profilePicture
      ),
      
      // Personal documents - only true if ALL documents are APPROVED by admin
      personalDocuments: (
        partner.personalDocuments?.aadharStatus === 'approved' &&
        partner.personalDocuments?.panStatus === 'approved' &&
        partner.personalDocuments?.licenseStatus === 'approved'
      ),
      
      // Vehicle documents - only true if ALL vehicle docs are APPROVED by admin
      vehicalDocuments: (
        partner.vehicalDocuments?.insuranceStatus === 'approved' &&
        partner.vehicalDocuments?.pollutionStatus === 'approved'
      ),
      
      // Banking details - only true if APPROVED by admin
      bankingDetails: (
        partner.bankingDetails?.bankingStatus === 'approved'
      )
    };

    // Partner is fully verified only if ALL sections are true
    const isVerified = Object.values(verificationStatus).every(status => status === true);

    // Update partner's overall verification status if needed
    if (isVerified !== partner.isVerified) {
      await this.partnerRepository.updateVerificationStatus(partnerId, isVerified);
    }

    return {
      isVerified,
      verificationStatus
    };

  } catch (error) {
    logger.error('Failed to get verification status:', error);
    throw error;
  }
}

  async getCurrentPartner(partnerId: string): Promise<IPartner> {
    try {
      const partner = await this.partnerRepository.findById(partnerId);
      if (!partner) {
        throw createError('Partner not found', 404);
      }

      if (!partner.isActive) {
        throw createError('Account is deactivated', 401);
      }

      return partner;

    } catch (error) {
      logger.error('Failed to get current partner:', error);
      throw error;
    }
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      const decoded = jwt.verify(refreshToken, config.jwtSecret) as JWTPayload;
      
      const partner = await this.partnerRepository.findById(decoded.userId);
      if (!partner || !partner.isActive) {
        throw createError('Invalid token', 401);
      }

      const newAccessToken = this.generateAccessToken(partner);

      return { accessToken: newAccessToken };

    } catch (error) {
      logger.error('Partner token refresh failed:', error);
      throw createError('Invalid token', 401);
    }
  }

  

  private async generatePartnerId(): Promise<string> {
    const prefix = 'PRT';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}${timestamp}${random}`;
  }

  private hasApprovedDocument(documents: any[], requiredTypes: string[]): boolean {
    return requiredTypes.every(type => 
      documents.some((doc: any) => doc.type === type && doc.status === DocumentStatus.APPROVED)
    );
  }

  private generateAccessToken(partner: IPartner): string {
    const payload: JWTPayload = {
      userId: partner._id.toString(),
      email: partner.email,
      role: UserRole.DELIVERY_PARTNER,
      

    };

    
    const secret: Secret = config.jwtSecret;
        const options: SignOptions = {
          expiresIn: config.jwtRefreshExpiration as `${number}${"ms" | "s" | "m" | "h" | "d" | "w" | "y"}` | number,
        };

    return jwt.sign(payload, secret, options);
  }

  private generateRefreshToken(partner: IPartner): string {
    const payload: JWTPayload = {
      userId: partner._id.toString(),
      email: partner.email,
      role: UserRole.DELIVERY_PARTNER
    };

    const secret: Secret = config.jwtSecret;
        const options: SignOptions = {
          expiresIn: config.jwtRefreshExpiration as `${number}${"ms" | "s" | "m" | "h" | "d" | "w" | "y"}` | number,
        };

    return jwt.sign(payload, secret, options);
  }

  // Service method for admin to approve/reject documents
async updateDocumentStatus(
  partnerId: string, 
  documentType: 'aadhar' | 'pan' | 'license' | 'insurance' | 'pollution' | 'banking',
  status: 'approved' | 'rejected' | 'pending',
  rejectionReason?: string
): Promise<void> {
  try {
    const updateData: any = {
      updatedAt: new Date()
    };

    // Map document types to database paths
    switch (documentType) {
      case 'aadhar':
        updateData['personalDocuments.aadharStatus'] = status;
        if (rejectionReason) {
          updateData['personalDocuments.aadharRejectionReason'] = rejectionReason;
        }
        break;
      case 'pan':
        updateData['personalDocuments.panStatus'] = status;
        if (rejectionReason) {
          updateData['personalDocuments.panRejectionReason'] = rejectionReason;
        }
        break;
      case 'license':
        updateData['personalDocuments.licenseStatus'] = status;
        if (rejectionReason) {
          updateData['personalDocuments.licenseRejectionReason'] = rejectionReason;
        }
        break;
      case 'insurance':
        updateData['vehicalDocuments.insuranceStatus'] = status;
        if (rejectionReason) {
          updateData['vehicalDocuments.insuranceRejectionReason'] = rejectionReason;
        }
        break;
      case 'pollution':
        updateData['vehicalDocuments.pollutionStatus'] = status;
        if (rejectionReason) {
          updateData['vehicalDocuments.pollutionRejectionReason'] = rejectionReason;
        }
        break;
      case 'banking':
        updateData['bankingDetails.status'] = status;
        if (rejectionReason) {
          updateData['bankingDetails.rejectionReason'] = rejectionReason;
        }
        break;
      default:
        throw createError(`Invalid document type: ${documentType}`, 400);
    }

    // await this.partnerRepository.updatePartner(partnerId, updateData);

    // Check if partner is now fully verified
    const verificationStatus = await this.getVerificationStatus(partnerId);
    
    logger.info(`Admin updated ${documentType} status to ${status} for partner ${partnerId}`);
    
    // Send notification to partner about status change
    // await this.notificationService.sendDocumentStatusUpdate(partnerId, documentType, status, rejectionReason);
    
  } catch (error) {
    logger.error('Failed to update document status:', error);
    throw error;
  }
}

// Get all partners pending document verification (for admin dashboard)
async getPendingVerifications(): Promise<any[]> {
  try {
    const partners = await this.partnerRepository.getDocumentsByPartnerId('123');
    if (!partners) {
      throw createError('Partners not found', 404);
    }
    const pendingList = [];
    if(Array.isArray(partners)) {
      
      for (const partner of partners) {
        const verificationStatus = await this.getDetailedVerificationStatus(partner._id.toString());
        
        // Only include partners who have uploaded documents but are not fully approved
        const hasPendingDocs = (
          verificationStatus.sections.personalDocuments.status === 'pending' ||
          verificationStatus.sections.vehicalDocuments.status === 'pending' ||
          verificationStatus.sections.bankingDetails.status === 'pending'
        );
        
        if (hasPendingDocs) {
          pendingList.push({
            partnerId: partner._id,
            partnerCode: partner.partnerId,
            fullName: partner.fullName,
            email: partner.email,
            phone: partner.phone,
            registrationDate: partner.createdAt,
            verificationStatus
          });
        }
      }
      
      return pendingList;
    }
    // If partners is not an array, return an empty array
    return [];
  } catch (error) {
    logger.error('Failed to get pending verifications:', error);
    throw error;
  }
}

async getDetailedVerificationStatus(partnerId: string): Promise<{
  isVerified: boolean;
  overallStatus: string;
  sections: {
    personalInformation: {
      status: 'completed' | 'incomplete';
      isApproved: boolean;
    };
    personalDocuments: {
      status: 'approved' | 'pending' | 'rejected' | 'incomplete';
      isApproved: boolean;
      documents: {
        aadhar: { 
          status: string; 
          isApproved: boolean;
          hasFile: boolean;
          frontUrl?: string; 
          backUrl?: string; 
        };
        pan: { 
          status: string; 
          isApproved: boolean;
          hasFile: boolean;
          frontUrl?: string; 
          backUrl?: string; 
        };
        license: { 
          status: string; 
          isApproved: boolean;
          hasFile: boolean;
          frontUrl?: string; 
          backUrl?: string; 
        };
      };
    };
    vehicalDocuments: {
      status: 'approved' | 'pending' | 'rejected' | 'incomplete';
      isApproved: boolean;
      documents: {
        insurance: { 
          status: string; 
          isApproved: boolean;
          hasFile: boolean;
          url?: string; 
        };
        pollution: { 
          status: string; 
          isApproved: boolean;
          hasFile: boolean;
          url?: string; 
        };
      };
    };
    bankingDetails: {
      status: 'approved' | 'pending' | 'rejected' | 'incomplete';
      isApproved: boolean;
    };
  };
}> {
  try {
    const partner = await this.partnerRepository.getDocumentsByPartnerId(partnerId);
    if (!partner) {
      throw createError('Partner not found', 404);
    }

    // Personal Information (no admin approval needed)
    const personalInfoComplete = !!(
      partner.fullName && 
      partner.email && 
      partner.phone && 
      partner.dateOfBirth && 
      partner.profilePicture
    );

    // Personal Documents
    const aadharStatus = partner.personalDocuments?.aadharStatus || 'incomplete';
    const panStatus = partner.personalDocuments?.panStatus || 'incomplete';
    const licenseStatus = partner.personalDocuments?.licenseStatus || 'incomplete';
    
    const aadharApproved = aadharStatus === 'approved';
    const panApproved = panStatus === 'approved';
    const licenseApproved = licenseStatus === 'approved';
    const personalDocsApproved = aadharApproved && panApproved && licenseApproved;

    // Vehicle Documents
    const insuranceStatus = partner.vehicalDocuments?.insuranceStatus || 'incomplete';
    const pollutionStatus = partner.vehicalDocuments?.pollutionStatus || 'incomplete';
    
    const insuranceApproved = insuranceStatus === 'approved';
    const pollutionApproved = pollutionStatus === 'approved';
    const vehicleDocsApproved = insuranceApproved && pollutionApproved;

    // Banking Details
    const bankingStatus = partner.bankingDetails?.bankingStatus || 'incomplete';
    const bankingApproved = bankingStatus === 'approved';

    const sections = {
      personalInformation: {
        status: personalInfoComplete ? 'completed' : 'incomplete' as 'completed' | 'incomplete',
        isApproved: personalInfoComplete // Auto-approved when complete
      },
      personalDocuments: {
        status: personalDocsApproved ? 'approved' : 
                (aadharStatus === 'pending' || panStatus === 'pending' || licenseStatus === 'pending') ? 'pending' :
                (aadharStatus === 'rejected' || panStatus === 'rejected' || licenseStatus === 'rejected') ? 'rejected' : 
                'incomplete' as 'approved' | 'pending' | 'rejected' | 'incomplete',
        isApproved: personalDocsApproved,
        documents: {
          aadhar: {
            status: aadharStatus,
            isApproved: aadharApproved,
            hasFile: !!(partner.personalDocuments?.aadharFront && partner.personalDocuments?.aadharBack),
            frontUrl: partner.personalDocuments?.aadharFront,
            backUrl: partner.personalDocuments?.aadharBack
          },
          pan: {
            status: panStatus,
            isApproved: panApproved,
            hasFile: !!(partner.personalDocuments?.panFront && partner.personalDocuments?.panBack),
            frontUrl: partner.personalDocuments?.panFront,
            backUrl: partner.personalDocuments?.panBack
          },
          license: {
            status: licenseStatus,
            isApproved: licenseApproved,
            hasFile: !!(partner.personalDocuments?.licenseFront && partner.personalDocuments?.licenseBack),
            frontUrl: partner.personalDocuments?.licenseFront,
            backUrl: partner.personalDocuments?.licenseBack
          }
        }
      },
      vehicalDocuments: {
        status: vehicleDocsApproved ? 'approved' : 
                (insuranceStatus === 'pending' || pollutionStatus === 'pending') ? 'pending' :
                (insuranceStatus === 'rejected' || pollutionStatus === 'rejected') ? 'rejected' : 
                'incomplete' as 'approved' | 'pending' | 'rejected' | 'incomplete',
        isApproved: vehicleDocsApproved,
        documents: {
          insurance: {
            status: insuranceStatus,
            isApproved: insuranceApproved,
            hasFile: !!partner.vehicalDocuments?.insuranceDocument,
            url: partner.vehicalDocuments?.insuranceDocument
          },
          pollution: {
            status: pollutionStatus,
            isApproved: pollutionApproved,
            hasFile: !!partner.vehicalDocuments?.pollutionDocument,
            url: partner.vehicalDocuments?.pollutionDocument
          }
        }
      },
      bankingDetails: {
        status: bankingStatus === 'approved'? 'approved' : 'pending' as 'approved' | 'pending',
        isApproved: bankingApproved,
        hasCompleteInfo: !!(
          partner.bankingDetails?.accountNumber && 
          partner.bankingDetails?.ifscCode && 
          partner.bankingDetails?.accountHolderName
        )
      }
    };

    const isVerified = personalInfoComplete && personalDocsApproved && vehicleDocsApproved && bankingApproved;

    return {
      isVerified,
      overallStatus: isVerified ? 'approved' : 'pending',
      sections
    };

  } catch (error) {
    logger.error('Failed to get detailed verification status:', error);
    throw error;
  }
}

}