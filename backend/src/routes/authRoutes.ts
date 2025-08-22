import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { validate, validateParams } from '../middleware/validation';
import { authenticate} from '../middleware/auth';
import { authLimiter, otpLimiter } from '../middleware/rateLimit';
import { container } from '../container/container';

import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  verifyOTPSchema,
  requestOTPSchema,
} from '../validators/auth';

const router = Router();
const authController = container.resolve(AuthController);

// Public routes
router.post('/register', authLimiter, validate(registerSchema), authController.register);
router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), authController.requestPasswordReset);
router.post('/reset-password', authLimiter, validate(resetPasswordSchema), authController.resetPassword);
router.post('/refresh-token', authController.refreshToken);
router.post('/validate-token', authController.validateToken);

// Protected routes
router.use(authenticate);
router.get('/profile', authController.getProfile);
router.post('/change-password', validate(changePasswordSchema), authController.changePassword);
router.post('/request-otp', otpLimiter, validate(requestOTPSchema), authController.requestOTP);
router.post('/verify-otp', validate(verifyOTPSchema), authController.verifyOTP);
router.post('/logout', authController.logout);

export default router;