import { Router } from 'express';
import { LocationController } from '../controllers/LocationController';
import { validate, validateParams, validateQuery } from '../middleware/validation';
import { authenticate, authorize } from '../middleware/auth';
import { pagination } from '../middleware/pagination';
import { UserRole } from '../types';
import {
  updateLocationSchema,
  getNearbyDeliveryPartnersSchema,
  getLocationHistorySchema,
} from '../validators/location';
import { idParamSchema, orderIdParamSchema } from '../validators/params';
import { container } from 'tsyringe';

const router = Router();
const locationController = container.resolve(LocationController);

// All routes require authentication
router.use(authenticate);

// Location update routes
router.post('/update', authorize([UserRole.DELIVERY_PARTNER]), validate(updateLocationSchema), locationController.updateLocation);
router.put('/online-status', authorize([UserRole.DELIVERY_PARTNER]), locationController.updateOnlineStatus);

// Location retrieval routes
router.get('/latest/:userId?', validateParams(idParamSchema), locationController.getLatestLocation);
router.get('/history/:userId?', pagination, validateParams(idParamSchema), validateQuery(getLocationHistorySchema), locationController.getLocationHistory);

// Delivery partner specific routes
router.get('/delivery-partners/nearby', validateQuery(getNearbyDeliveryPartnersSchema), locationController.findNearbyDeliveryPartners);
router.get('/delivery-partners/active', authorize([UserRole.ADMIN, UserRole.DELIVERY_PARTNER]), locationController.getActiveDeliveryPartners);
router.get('/movement-stats/:userId?', validateParams(idParamSchema), locationController.getMovementStats);

// Order tracking routes
router.get('/track/:orderId', validateParams(orderIdParamSchema), locationController.trackOrder);

// Analytics routes (Admin only)
router.get('/analytics', authorize([UserRole.ADMIN]), locationController.getLocationAnalytics);
router.get('/heatmap', authorize([UserRole.ADMIN]), locationController.getDeliveryHeatmap);

// Cleanup routes (Admin only)
router.delete('/cleanup', authorize([UserRole.ADMIN]), locationController.cleanupOldLocations);

export default router;