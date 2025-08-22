import { Router } from 'express';
import { PartnerController } from '../controllers/PartnerController';
import { validate } from '../middleware/validation';
import { authLimiter, otpLimiter } from '../middleware/rateLimit';
import { container } from '../container/container';
import { partnerLoginOtpSchema, partnerRegistrationSchema, partnerVerifyOtpSchema } from '../validators/partner';
import { authenticatePartner } from '../middleware/partnerAuth';
import { handleUploadError, partnerUpload } from '../middleware/upload';


const router = Router();
const partnerController = container.resolve(PartnerController);

// Public routes
router.post('/register', authLimiter, partnerUpload, handleUploadError, validate(partnerRegistrationSchema), partnerController.register);
router.post('/request-login-otp', authLimiter, validate(partnerLoginOtpSchema), partnerController.requestLoginOtp);
router.post('/verify-login-otp', authLimiter, validate(partnerVerifyOtpSchema), partnerController.verifyLoginOtp);
router.post('/refresh-token', partnerController.refreshToken);

// Protected routes
router.use(authenticatePartner);
router.get('/profile', partnerController.getProfile);
router.get('/verification-status', partnerController.getVerificationStatus);
router.post('/logout', partnerController.logout);

export default router;