// src/controllers/PartnerController.ts
import { injectable, inject } from 'tsyringe';
import { Request, Response, NextFunction } from 'express';
import { PartnerService } from '../services/PartnerService';
import { asyncHandler } from '../utils/errorHandler';
import { sendError, sendSuccess } from '../utils/response';
import { getS3FileUrl, processPartnerFiles } from '../middleware/upload';

@injectable()
export class PartnerController {
  constructor(
    @inject('PartnerService') private partnerService: PartnerService
  ) {}

  register = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  

  // Process uploaded files
  const uploadedFiles = processPartnerFiles(req.files as { [fieldname: string]: Express.Multer.File[] });
    
    // Create file URLs and organize by field name
    const fileUrls: { [key: string]: string } = {};
    
    uploadedFiles.forEach(file => {
      fileUrls[file.fieldname] = (file as any).location || getS3FileUrl((file as any).key);
    });

    

  const { partner, message, accessToken, refreshToken } = await this.partnerService.register(req.body,fileUrls);

  sendSuccess(res, message, {
    user: {
      id: partner._id.toString(),
      email: partner.email,
      fullName: partner.fullName,
      partnerId: partner.partnerId,
      role: 'partner',
      isVerified: partner.isVerified
    },
    message,
    accessToken,
    refreshToken
  }, 201);
});

  requestLoginOtp = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;
    const result = await this.partnerService.requestLoginOtp(email);
    
    sendSuccess(res, result.message, result);
  });

  verifyLoginOtp = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { email, otp } = req.body;
    const { user, accessToken, refreshToken } = await this.partnerService.verifyLoginOtp(email, otp);

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

  getProfile = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const partnerId = req.user!.userId;
    const partner = await this.partnerService.getCurrentPartner(partnerId);
    
    sendSuccess(res, 'Profile retrieved successfully', { partner });
  });

  getVerificationStatus = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const partnerId = req.user!.userId;
    const status = await this.partnerService.getVerificationStatus(partnerId);

    sendSuccess(res, 'Verification status retrieved successfully', status);
  });

  refreshToken = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return sendError(res, 'Refresh token required', 400);
    }
    
    const { accessToken: newAccessToken } = await this.partnerService.refreshToken(refreshToken);
    
    sendSuccess(res, 'Token refreshed successfully', { accessToken: newAccessToken });
  });

  logout = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'lax' : 'strict',
      path: '/',
    });
    
    sendSuccess(res, 'Logout successful');
  });
}