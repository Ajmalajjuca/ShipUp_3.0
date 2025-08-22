import { Request, Response, NextFunction } from 'express';
import { OrderService } from '../services/OrderService';
import { sendSuccess, sendError } from '../utils/response';
import { asyncHandler } from '../utils/errorHandler';
import { OrderStatus } from '../types';
import { inject, injectable } from 'tsyringe';
import { IOrderService } from '../interfaces/IService/IOrderService';

@injectable()
export class OrderController {

  constructor(
    @inject('OrderService') private orderService: IOrderService
  ) {  }

  createOrder = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const customerId = req.user!.userId;
    const orderData = {
      ...req.body,
      customerId,
    };
    
    const order = await this.orderService.createOrder(orderData);
    
    sendSuccess(res, 'Order created successfully', { order }, 201);
  });

  getOrderById = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const order = await this.orderService.getOrderById(id);
    
    sendSuccess(res, 'Order retrieved successfully', { order });
  });

  getOrderByNumber = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { orderNumber } = req.params;
    const order = await this.orderService.getOrderByNumber(orderNumber);
    
    sendSuccess(res, 'Order retrieved successfully', { order });
  });

  getMyOrders = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const customerId = req.user!.userId;
    const pagination = req.pagination!;
    
    const result = await this.orderService.getCustomerOrders(customerId, pagination);
    
    sendSuccess(res, 'Orders retrieved successfully', result);
  });

  getDeliveryPartnerOrders = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const deliveryPartnerId = req.user!.userId;
    const pagination = req.pagination!;
    
    const result = await this.orderService.getDeliveryPartnerOrders(deliveryPartnerId, pagination);
    
    sendSuccess(res, 'Orders retrieved successfully', result);
  });

  getAllOrders = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const pagination = req.pagination!;
    const { status } = req.query;
    
    let result;
    if (status) {
      result = await this.orderService.getOrdersByStatus(status as OrderStatus, pagination);
    } else {
      // Get all orders with pagination - you might want to create a method for this
      result = await this.orderService.getOrdersByStatus(OrderStatus.PENDING, pagination);
    }
    
    sendSuccess(res, 'Orders retrieved successfully', result);
  });

  getAvailableOrders = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const pagination = req.pagination!;
    const result = await this.orderService.getAvailableOrders(pagination);
    
    sendSuccess(res, 'Available orders retrieved successfully', result);
  });

  assignDeliveryPartner = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { orderId, deliveryPartnerId } = req.body;
    const order = await this.orderService.assignDeliveryPartner(orderId, deliveryPartnerId);
    
    sendSuccess(res, 'Delivery partner assigned successfully', { order });
  });

  acceptOrder = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { orderId } = req.params;
    const deliveryPartnerId = req.user!.userId;
    
    const order = await this.orderService.assignDeliveryPartner(orderId, deliveryPartnerId);
    
    sendSuccess(res, 'Order accepted successfully', { order });
  });

  updateOrderStatus = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { orderId } = req.params;
    const { status, notes } = req.body;
    const userId = req.user!.userId;
    
    const order = await this.orderService.updateOrderStatus(orderId, status, notes, userId);
    
    sendSuccess(res, 'Order status updated successfully', { order });
  });

  cancelOrder = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { orderId } = req.params;
    const { reason } = req.body;
    const cancelledBy = req.user!.userId;
    
    const order = await this.orderService.cancelOrder(orderId, reason, cancelledBy);
    
    sendSuccess(res, 'Order cancelled successfully', { order });
  });

  verifyPickupOTP = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { orderId } = req.params;
    const { code } = req.body;
    const deliveryPartnerId = req.user!.userId;
    
    const order = await this.orderService.verifyPickupOTP(orderId, code, deliveryPartnerId);
    
    sendSuccess(res, 'Pickup OTP verified successfully', { order });
  });

  verifyDeliveryOTP = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { orderId } = req.params;
    const { code } = req.body;
    const deliveryPartnerId = req.user!.userId;
    
    const order = await this.orderService.verifyDeliveryOTP(orderId, code, deliveryPartnerId);
    
    sendSuccess(res, 'Delivery OTP verified successfully', { order });
  });

  rateOrder = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { orderId } = req.params;
    const { rating, comment, ratingType } = req.body;
    
    const order = await this.orderService.rateOrder(orderId, rating, comment, ratingType);
    
    sendSuccess(res, 'Order rated successfully', { order });
  });

  getOrderStats = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { deliveryPartnerId } = req.query;
    const stats = await this.orderService.getOrderStats(deliveryPartnerId as string);
    
    sendSuccess(res, 'Order statistics retrieved successfully', { stats });
  });

  getOrdersInDateRange = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { startDate, endDate } = req.query;
    const pagination = req.pagination!;
    
    if (!startDate || !endDate) {
      return sendError(res, 'Start date and end date are required', 400);
    }
    
    const result = await this.orderService.getOrdersInDateRange(
      new Date(startDate as string),
      new Date(endDate as string),
      pagination
    );
    
    sendSuccess(res, 'Orders retrieved successfully', result);
  });

  findOrdersNearLocation = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { latitude, longitude, radius } = req.query;
    const pagination = req.pagination!;
    
    if (!latitude || !longitude) {
      return sendError(res, 'Latitude and longitude are required', 400);
    }
    
    const result = await this.orderService.findOrdersNearLocation(
      parseFloat(latitude as string),
      parseFloat(longitude as string),
      radius ? parseFloat(radius as string) : 10,
      pagination
    );
    
    sendSuccess(res, 'Orders near location found', result);
  });
}