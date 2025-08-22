import { Router } from 'express';
import { OrderController } from '../controllers/OrderController';
import { validate, validateParams, validateQuery } from '../middleware/validation';
import { authenticate, authorize } from '../middleware/auth';
import { pagination } from '../middleware/pagination';
import { UserRole } from '../types';

import { idParamSchema, orderIdParamSchema, orderNumberParamSchema } from '../validators/params';
import { assignDeliveryPartnerSchema, cancelOrderSchema, createOrderSchema, getOrdersSchema, rateOrderSchema } from '../validators/order';
import { verifyOTPSchema } from '../validators/auth';
import { container } from 'tsyringe';

const router = Router();
const orderController = container.resolve(OrderController)

// All routes require authentication
router.use(authenticate);

// Customer routes
router.post('/', authorize([UserRole.CUSTOMER]), validate(createOrderSchema), orderController.createOrder);
router.get('/my-orders', authorize([UserRole.CUSTOMER]), pagination, orderController.getMyOrders);
router.put('/:orderId/cancel', authorize([UserRole.CUSTOMER]), validateParams(orderIdParamSchema), validate(cancelOrderSchema), orderController.cancelOrder);
router.put('/:orderId/rate', authorize([UserRole.CUSTOMER, UserRole.DELIVERY_PARTNER]), validateParams(orderIdParamSchema), validate(rateOrderSchema), orderController.rateOrder);

// Delivery partner routes
router.get('/available', authorize([UserRole.DELIVERY_PARTNER]), pagination, orderController.getAvailableOrders);
router.get('/my-deliveries', authorize([UserRole.DELIVERY_PARTNER]), pagination, orderController.getDeliveryPartnerOrders);
router.put('/:orderId/accept', authorize([UserRole.DELIVERY_PARTNER]), validateParams(orderIdParamSchema), orderController.acceptOrder);
router.put('/:orderId/status', authorize([UserRole.DELIVERY_PARTNER, UserRole.ADMIN]), validateParams(orderIdParamSchema), orderController.updateOrderStatus);
router.post('/:orderId/verify-pickup', authorize([UserRole.DELIVERY_PARTNER]), validateParams(orderIdParamSchema), validate(verifyOTPSchema), orderController.verifyPickupOTP);
router.post('/:orderId/verify-delivery', authorize([UserRole.DELIVERY_PARTNER]), validateParams(orderIdParamSchema), validate(verifyOTPSchema), orderController.verifyDeliveryOTP);

// Public/shared routes
router.get('/by-number/:orderNumber', validateParams(orderNumberParamSchema), orderController.getOrderByNumber);
router.get('/nearby', pagination, orderController.findOrdersNearLocation);

// Admin routes
router.get('/', authorize([UserRole.ADMIN]), pagination, validateQuery(getOrdersSchema), orderController.getAllOrders);
router.get('/stats', authorize([UserRole.ADMIN]), orderController.getOrderStats);
router.get('/date-range', authorize([UserRole.ADMIN]), pagination, orderController.getOrdersInDateRange);
router.put('/assign', authorize([UserRole.ADMIN]), validate(assignDeliveryPartnerSchema), orderController.assignDeliveryPartner);

// Order details (accessible by customer, assigned delivery partner, and admin)
router.get('/:orderId', validateParams(orderIdParamSchema), orderController.getOrderById);

export default router;