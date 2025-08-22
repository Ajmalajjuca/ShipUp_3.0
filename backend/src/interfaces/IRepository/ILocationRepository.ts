import { PaginatedResult, PaginationOptions } from "../../types";
import { ILocation } from "../IModel/ILocation";

export interface ILocationRepository {
  getLatestLocation(userId: string): Promise<ILocation | null>;
  updateUserLocation(userId: string, coordinates: any, additionalData?: Partial<ILocation>): Promise<ILocation>;
  getLocationHistory(userId: string, startDate?: Date, endDate?: Date, pagination?: PaginationOptions): Promise<PaginatedResult<ILocation> | ILocation[]>;
  findNearbyDeliveryPartners(latitude: number, longitude: number, radiusKm?: number): Promise<any[]>;
  getOrderTrackingLocations(orderId: string): Promise<ILocation[]>;
  updateDeliveryPartnerStatus(userId: string, isOnline: boolean): Promise<void>;
  getActiveDeliveryPartners(): Promise<ILocation[]>;
  getDeliveryPartnerMovementStats(userId: string, startDate: Date, endDate: Date): Promise<any>;
  cleanupOldLocations(daysOld?: number): Promise<number>;
  aggregate(pipeline: any[]): Promise<any[]>;
}