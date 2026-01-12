import { Router } from 'express';
import { validate } from '../middleware/validation';
import { authLimiter } from '../middleware/rateLimit';
import { container } from '../container/container';

import { AdminController } from '../controllers/Admincontroller';
import { loginSchema } from '../validators/auth';
import { authenticateAdmin } from '../middleware/authenticateAdmin';

const router = Router();
const adminController = container.resolve(AdminController);

// Public routes
router.post('/login', authLimiter, validate(loginSchema), adminController.adminLogin);

// // Protected routes
router.use(authenticateAdmin);
router.get('/users', adminController.getAllUsers);
router.get('/users/:id', adminController.getUserById);
router.put('/users/:id', adminController.updateUserStatus);

router.get('/partners',adminController.getAllPartners);
router.get('/partners/requests',adminController.getAllPartnersRequest);
router.get('/partners/:id',adminController.getPartnerDetails);
router.put('/partners/')
// router.get('/profile', adminController.getProfile);
// router.post('/change-password', validate(adminLoginSchema), adminController.changePassword);



//admin routes
// router.post('/admin/refresh-token', authController.adminRefreshToken);
// router.post('/admin/validate-token', authController.adminValidateToken);
export default router;