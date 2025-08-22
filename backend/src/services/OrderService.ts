import { 
  OrderStatus, 
  PaymentStatus, 
  DeliveryType, 
  OTPType, 
  PaginationOptions, 
  PaginatedResult,
  OrderItem,
  Address,
  Pricing,
  PaymentMethod
} from '../types';
import { createError } from '../utils/errorHandler';
import { logger } from '../utils/logger';
import { generateOTP, calculateDistance } from '../utils/helpers';
import { inject,injectable } from 'tsyringe';
import { IUserRepository } from '../interfaces/IRepository/IUserRepository';
import { IOrderRepository } from '../interfaces/IRepository/IOrderRepository';
import { IOTPRepository } from '../interfaces/IRepository/IOTPRepository';
import { IOrderService } from '@/interfaces/IService/IOrderService';
import { IOrder } from '../interfaces/IModel/IOrder';

@injectable()
export class OrderService implements IOrderService {
  

  constructor(
    @inject('OrderRepository') private orderRepository: IOrderRepository,
    @inject('OTPRepository') private otpRepository: IOTPRepository,
    @inject('UserRepository') private userRepository: IUserRepository
  ) { }

  async createOrder(orderData: {
    customerId: string;
    items: OrderItem[];
    pickupAddress: Address;
    deliveryAddress: Address;
    deliveryType?: DeliveryType;
    scheduledPickupTime?: Date;
    scheduledDeliveryTime?: Date;
    paymentMethod: PaymentMethod;
    specialInstructions?: string;
    customerNotes?: string;
  }): Promise<IOrder> {
    try {
      // Verify customer exists
      const customer = await this.userRepository.findById(orderData.customerId);
      if (!customer) {
        throw createError('Customer not found', 404);
      }

      // Calculate pricing
      const pricing = await this.calculatePricing(
        orderData.items,
        orderData.pickupAddress,
        orderData.deliveryAddress,
        orderData.deliveryType || DeliveryType.STANDARD
      );

      // Calculate distance
      const distance = calculateDistance(
        orderData.pickupAddress.coordinates!.latitude,
        orderData.pickupAddress.coordinates!.longitude,
        orderData.deliveryAddress.coordinates!.latitude,
        orderData.deliveryAddress.coordinates!.longitude
      );

      // Generate OTPs for pickup and delivery
      const pickupOTP = generateOTP(6);
      const deliveryOTP = generateOTP(6);

      // Calculate estimated delivery time
      const estimatedDeliveryTime = this.calculateEstimatedDeliveryTime(
        orderData.deliveryType || DeliveryType.STANDARD,
        distance
      );

      // Create order
      const order = await this.orderRepository.create({
        userId: new (require('mongoose').Types.ObjectId)(orderData.customerId),
        pickupAddress: orderData.pickupAddress,
        deliveryAddress: orderData.deliveryAddress,
        deliveryType: orderData.deliveryType || DeliveryType.STANDARD,
        scheduledPickupTime: orderData.scheduledPickupTime,
        scheduledDeliveryTime: orderData.scheduledDeliveryTime,
        estimatedDeliveryTime,
        pricing: pricing.totalAmount,
        paymentMethod: orderData.paymentMethod,
        paymentStatus: PaymentStatus.PENDING,
        distanceKm: distance,
        status: OrderStatus.PENDING,
      });

      // Create OTP records
      await this.otpRepository.createOTP(
        orderData.customerId,
        OTPType.PICKUP,
        pickupOTP,
        order._id.toString()
      );

      await this.otpRepository.createOTP(
        orderData.customerId,
        OTPType.DELIVERY,
        deliveryOTP,
        order._id.toString()
      );

      logger.info(`Order created successfully: ${order.id}`);
      return order;
    } catch (error) {
      logger.error('Create order failed:', error);
      throw error;
    }
  }

  async getOrderById(orderId: string): Promise<IOrder> {
    try {
      const order = await this.orderRepository.findById(orderId);
      if (!order) {
        throw createError('Order not found', 404);
      }

      return order;
    } catch (error) {
      logger.error('Get order by ID failed:', error);
      throw error;
    }
  }

  async getOrderByNumber(orderNumber: string): Promise<IOrder> {
    try {
      const order = await this.orderRepository.findByOrderNumber(orderNumber);
      if (!order) {
        throw createError('Order not found', 404);
      }

      return order;
    } catch (error) {
      logger.error('Get order by number failed:', error);
      throw error;
    }
  }

  async getCustomerOrders(
    customerId: string,
    pagination: PaginationOptions
  ): Promise<PaginatedResult<IOrder>> {
    try {
      return this.orderRepository.findByCustomer(customerId, pagination);
    } catch (error) {
      logger.error('Get customer orders failed:', error);
      throw error;
    }
  }

  async getDeliveryPartnerOrders(
    deliveryPartnerId: string,
    pagination: PaginationOptions
  ): Promise<PaginatedResult<IOrder>> {
    try {
      return this.orderRepository.findByDeliveryPartner(deliveryPartnerId, pagination);
    } catch (error) {
      logger.error('Get delivery partner orders failed:', error);
      throw error;
    }
  }

  async getOrdersByStatus(
    status: OrderStatus,
    pagination: PaginationOptions
  ): Promise<PaginatedResult<IOrder>> {
    try {
      return this.orderRepository.findByStatus(status, pagination);
    } catch (error) {
      logger.error('Get orders by status failed:', error);
      throw error;
    }
  }

  async getAvailableOrders(pagination: PaginationOptions): Promise<PaginatedResult<IOrder>> {
    try {
      return this.orderRepository.findAvailableOrders(pagination);
    } catch (error) {
      logger.error('Get available orders failed:', error);
      throw error;
    }
  }

  async assignDeliveryPartner(orderId: string, deliveryPartnerId: string): Promise<IOrder> {
    try {
      const order = await this.orderRepository.findById(orderId);
      if (!order) {
        throw createError('Order not found', 404);
      }

      if (order.deliveryPartnerId) {
        throw createError('Order already assigned to a delivery partner', 400);
      }

      if (order.status !== OrderStatus.PENDING) {
        throw createError('Order cannot be assigned in current status', 400);
      }

      // Verify delivery partner exists and is active
      const deliveryPartner = await this.userRepository.findById(deliveryPartnerId);
      if (!deliveryPartner) {
        throw createError('Delivery partner not found', 404);
      }

      if (!deliveryPartner.isActive ) {
        throw createError('Delivery partner is not eligible', 400);
      }

      const updatedOrder = await this.orderRepository.assignDeliveryPartner(orderId, deliveryPartnerId);
      if (!updatedOrder) {
        throw createError('Failed to assign delivery partner', 500);
      }

      logger.info(`Delivery partner assigned to order: ${order.id} -> ${deliveryPartnerId}`);
      return updatedOrder;
    } catch (error) {
      logger.error('Assign delivery partner failed:', error);
      throw error;
    }
  }

  async updateOrderStatus(
    orderId: string,
    newStatus: OrderStatus,
    notes?: string,
    userId?: string
  ): Promise<IOrder> {
    try {
      const order = await this.orderRepository.findById(orderId);
      if (!order) {
        throw createError('Order not found', 404);
      }

      // Validate status transition
      if (!this.isValidStatusTransition(order.status, newStatus)) {
        throw createError(`Invalid status transition from ${order.status} to ${newStatus}`, 400);
      }

      // Handle specific status updates
      const updateData: any = { status: newStatus };

      switch (newStatus) {
        case OrderStatus.PICKED_UP:
          updateData.actualPickupTime = new Date();
          break;
        case OrderStatus.DELIVERED:
          updateData.actualDeliveryTime = new Date();
          updateData.paymentStatus = PaymentStatus.COMPLETED;
          break;
      }

      const updatedOrder = await this.orderRepository.updateStatus(orderId, newStatus, notes);
      if (!updatedOrder) {
        throw createError('Failed to update order status', 500);
      }

      // Update delivery partner rating if order is completed
      if (newStatus === OrderStatus.DELIVERED && order.deliveryPartnerId) {
        // This will be handled when customer rates the delivery
      }

      logger.info(`Order status updated: ${order.id} -> ${newStatus}`);
      return updatedOrder;
    } catch (error) {
      logger.error('Update order status failed:', error);
      throw error;
    }
  }

  async cancelOrder(orderId: string, reason: string, cancelledBy: string): Promise<IOrder> {
    try {
      const order = await this.orderRepository.findById(orderId);
      if (!order) {
        throw createError('Order not found', 404);
      }

      

      const cancelledOrder = await this.orderRepository.cancelOrder(orderId, reason, cancelledBy);
      if (!cancelledOrder) {
        throw createError('Failed to cancel order', 500);
      }

      // Handle refund if payment was completed
      if (order.paymentStatus === PaymentStatus.COMPLETED) {
        // TODO: Initiate refund process
        await this.orderRepository.update(orderId, {
          paymentStatus: PaymentStatus.REFUNDED,
        });
      }

      logger.info(`Order cancelled: ${order.id} by ${cancelledBy}`);
      return cancelledOrder;
    } catch (error) {
      logger.error('Cancel order failed:', error);
      throw error;
    }
  }

  async verifyPickupOTP(orderId: string, otpCode: string, deliveryPartnerId: string): Promise<IOrder> {
    try {
      const order = await this.orderRepository.findById(orderId);
      if (!order) {
        throw createError('Order not found', 404);
      }

      if (order.deliveryPartnerId?.toString() !== deliveryPartnerId) {
        throw createError('Unauthorized to verify pickup OTP', 403);
      }

      if (order.status !== OrderStatus.CONFIRMED) {
        throw createError('Order is not ready for pickup', 400);
      }

      // Verify OTP
      const otpVerification = await this.otpRepository.verifyOTP(
        order.userId.toString(),
        OTPType.PICKUP,
        otpCode
      );

      if (!otpVerification.success) {
        throw createError(otpVerification.message, 400);
      }

      // Update order status to picked up
      const updatedOrder = await this.updateOrderStatus(
        orderId,
        OrderStatus.PICKED_UP,
        'Package picked up with OTP verification'
      );

      logger.info(`Pickup OTP verified for order: ${order.id}`);
      return updatedOrder;
    } catch (error) {
      logger.error('Verify pickup OTP failed:', error);
      throw error;
    }
  }

  async verifyDeliveryOTP(orderId: string, otpCode: string, deliveryPartnerId: string): Promise<IOrder> {
    try {
      const order = await this.orderRepository.findById(orderId);
      if (!order) {
        throw createError('Order not found', 404);
      }

      if (order.deliveryPartnerId?.toString() !== deliveryPartnerId) {
        throw createError('Unauthorized to verify delivery OTP', 403);
      }

      if (order.status !== OrderStatus.OUT_FOR_DELIVERY) {
        throw createError('Order is not out for delivery', 400);
      }

      // Verify OTP
      const otpVerification = await this.otpRepository.verifyOTP(
        order.userId.toString(),
        OTPType.DELIVERY,
        otpCode
      );

      if (!otpVerification.success) {
        throw createError(otpVerification.message, 400);
      }

      // Update order status to delivered
      const updatedOrder = await this.updateOrderStatus(
        orderId,
        OrderStatus.DELIVERED,
        'Package delivered with OTP verification'
      );

      logger.info(`Delivery OTP verified for order: ${order.id}`);
      return updatedOrder;
    } catch (error) {
      logger.error('Verify delivery OTP failed:', error);
      throw error;
    }
  }

  async rateOrder(
    orderId: string,
    rating: number,
    comment: string,
    ratingType: 'customer' | 'delivery_partner'
  ): Promise<IOrder> {
    try {
      const order = await this.orderRepository.findById(orderId);
      if (!order) {
        throw createError('Order not found', 404);
      }

      if (order.status !== OrderStatus.DELIVERED) {
        throw createError('Order must be delivered to rate', 400);
      }

      const ratedOrder = await this.orderRepository.rateOrder(orderId, rating, comment, ratingType);
      if (!ratedOrder) {
        throw createError('Failed to rate order', 500);
      }

      // Update delivery partner rating if customer rated
      if (ratingType === 'customer' && order.deliveryPartnerId) {
        await this.userRepository.updateDeliveryPartnerRating(
          order.deliveryPartnerId.toString(),
          rating
        );
      }

      logger.info(`Order rated: ${order.id} - ${rating} stars by ${ratingType}`);
      return ratedOrder;
    } catch (error) {
      logger.error('Rate order failed:', error);
      throw error;
    }
  }

  async getOrderStats(deliveryPartnerId?: string): Promise<any> {
    try {
      const stats = await this.orderRepository.getOrderStats(deliveryPartnerId);
      return stats[0] || {
        totalOrders: 0,
        totalRevenue: 0,
        statusBreakdown: [],
      };
    } catch (error) {
      logger.error('Get order stats failed:', error);
      throw error;
    }
  }

  async getOrdersInDateRange(
    startDate: Date,
    endDate: Date,
    pagination: PaginationOptions
  ): Promise<PaginatedResult<IOrder>> {
    try {
      return this.orderRepository.getOrdersInDateRange(startDate, endDate, pagination);
    } catch (error) {
      logger.error('Get orders in date range failed:', error);
      throw error;
    }
  }

  async findOrdersNearLocation(
    latitude: number,
    longitude: number,
    radiusKm: number,
    pagination: PaginationOptions
  ): Promise<PaginatedResult<IOrder>> {
    try {
      return this.orderRepository.findOrdersInRadius(latitude, longitude, radiusKm, pagination);
    } catch (error) {
      logger.error('Find orders near location failed:', error);
      throw error;
    }
  }

  private async calculatePricing(
    items: OrderItem[],
    pickupAddress: Address,
    deliveryAddress: Address,
    deliveryType: DeliveryType
  ): Promise<Pricing> {
    // Calculate distance
    const distance = calculateDistance(
      pickupAddress.coordinates!.latitude,
      pickupAddress.coordinates!.longitude,
      deliveryAddress.coordinates!.latitude,
      deliveryAddress.coordinates!.longitude
    );

    // Calculate total weight and value
    const totalWeight = items.reduce((sum, item) => sum + (item.weight || 0), 0);
    const totalValue = items.reduce((sum, item) => sum + item.value, 0);

    // Base pricing logic (can be customized)
    const basePrice = 50; // Base price in currency units
    const distanceCharge = distance * 10; // 10 units per km
    const weightCharge = totalWeight * 5; // 5 units per kg
    
    let deliveryCharge = 0;
    switch (deliveryType) {
      case DeliveryType.EXPRESS:
        deliveryCharge = 100;
        break;
      case DeliveryType.SAME_DAY:
        deliveryCharge = 200;
        break;
      case DeliveryType.SCHEDULED:
        deliveryCharge = 50;
        break;
      default:
        deliveryCharge = 25;
    }

    const subtotal = basePrice + distanceCharge + weightCharge + deliveryCharge;
    const taxRate = 0.18; // 18% tax
    const taxAmount = subtotal * taxRate;
    const totalAmount = subtotal + taxAmount;

    return {
      basePrice,
      distanceCharge,
      weightCharge,
      deliveryCharge,
      taxAmount,
      discount: 0,
      totalAmount,
    };
  }

  private calculateEstimatedDeliveryTime(deliveryType: DeliveryType, distance: number): Date {
    const now = new Date();
    let hours = 0;

    switch (deliveryType) {
      case DeliveryType.EXPRESS:
        hours = Math.max(2, distance * 0.5); // Minimum 2 hours
        break;
      case DeliveryType.SAME_DAY:
        hours = 8;
        break;
      case DeliveryType.SCHEDULED:
        hours = 24;
        break;
      default:
        hours = Math.max(4, distance * 1); // Minimum 4 hours
    }

    return new Date(now.getTime() + hours * 60 * 60 * 1000);
  }

  private isValidStatusTransition(currentStatus: OrderStatus, newStatus: OrderStatus): boolean {
    const validTransitions: { [key in OrderStatus]: OrderStatus[] } = {
      [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
      [OrderStatus.CONFIRMED]: [OrderStatus.PICKED_UP, OrderStatus.CANCELLED],
      [OrderStatus.PICKED_UP]: [OrderStatus.IN_TRANSIT, OrderStatus.RETURNED],
      [OrderStatus.IN_TRANSIT]: [OrderStatus.OUT_FOR_DELIVERY, OrderStatus.RETURNED],
      [OrderStatus.OUT_FOR_DELIVERY]: [OrderStatus.DELIVERED, OrderStatus.RETURNED],
      [OrderStatus.DELIVERED]: [],
      [OrderStatus.CANCELLED]: [],
      [OrderStatus.RETURNED]: [],
    };

    return validTransitions[currentStatus].includes(newStatus);
  }
}