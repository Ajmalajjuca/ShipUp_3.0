import { OrderStatus, PaginationOptions, PaginatedResult } from '../../types';
import { IOrder } from '../IModel/IOrder';

export interface IOrderRepository {
  findById(id: string): Promise<IOrder | null>;
  findByOrderNumber(orderNumber: string): Promise<IOrder | null>;
  findByCustomer(customerId: string, pagination: PaginationOptions): Promise<PaginatedResult<IOrder>>;
  findByDeliveryPartner(deliveryPartnerId: string, pagination: PaginationOptions): Promise<PaginatedResult<IOrder>>;
  findByStatus(status: OrderStatus, pagination: PaginationOptions): Promise<PaginatedResult<IOrder>>;
  findActiveOrders(pagination: PaginationOptions): Promise<PaginatedResult<IOrder>>;
  findAvailableOrders(pagination: PaginationOptions): Promise<PaginatedResult<IOrder>>;
  assignDeliveryPartner(orderId: string, deliveryPartnerId: string): Promise<IOrder | null>;
  updateStatus(orderId: string, status: OrderStatus, notes?: string): Promise<IOrder | null>;
  create(orderData: Partial<IOrder>): Promise<IOrder>;
  update(id: string, data: any): Promise<IOrder | null>;
  cancelOrder(orderId: string, reason: string, cancelledBy: string): Promise<IOrder | null>;
  rateOrder(orderId: string, rating: number, comment: string, ratingType: 'customer' | 'delivery_partner'): Promise<IOrder | null>;
  getOrderStats(deliveryPartnerId?: string): Promise<any>;
  getOrdersInDateRange(startDate: Date, endDate: Date, pagination: PaginationOptions): Promise<PaginatedResult<IOrder>>;
  findOrdersInRadius(latitude: number, longitude: number, radiusKm: number, pagination: PaginationOptions): Promise<PaginatedResult<IOrder>>;
}