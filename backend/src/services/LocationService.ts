import { UserRepository } from '../repositories/UserRepository';
import { 
  LocationCoordinates, 
  PaginationOptions, 
  PaginatedResult, 
  UserRole 
} from '../types';
import { createError } from '../utils/errorHandler';
import { logger } from '../utils/logger';
import { LocationRepository } from '../repositories/LocationRepository';
import { injectable,inject } from 'tsyringe';
import { ILocationService } from '../interfaces/IService/ILocationService';
import mongoose from 'mongoose';
import { ILocationRepository } from '../interfaces/IRepository/ILocationRepository';
import { IUserRepository } from '../interfaces/IRepository/IUserRepository';
import { ILocation } from '../interfaces/IModel/ILocation';

@injectable()
export class LocationService implements ILocationService {
 

  constructor(
     @inject('LocationRepository') private locationRepository: ILocationRepository,
    @inject('UserRepository') private userRepository: IUserRepository
  ) {
    
  }

  async updateUserLocation(
    userId: string,
    coordinates: LocationCoordinates,
    additionalData?: {
      heading?: number;
      speed?: number;
      address?: string;
      isOnline?: boolean;
      batteryLevel?: number;
      networkType?: string;
      orderId?: string | undefined;
    }
  ): Promise<ILocation> {
    try {
      // Verify user exists
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw createError('User not found', 404);
      }

      // Create location record
      const location = await this.locationRepository.updateUserLocation(
        userId,
        coordinates,
        additionalData
    ? {
        ...additionalData,
        orderId: additionalData.orderId
          ? new mongoose.Types.ObjectId(additionalData.orderId)
          : undefined,
      }
    : undefined
      );

      // Update user's delivery partner info if applicable
      if (user.role === UserRole.DELIVERY_PARTNER) {
        await this.userRepository.update(userId, {
          'deliveryPartnerInfo.lastLocationUpdate': new Date(),
        });

        // Update online status if provided
        if (additionalData?.isOnline !== undefined) {
          await this.userRepository.updateDeliveryPartnerOnlineStatus(
            userId,
            additionalData.isOnline
          );
        }
      }

      logger.info(`Location updated for user: ${userId}`);
      return location;
    } catch (error) {
      logger.error('Update user location failed:', error);
      throw error;
    }
  }

  async getLatestLocation(userId: string): Promise<ILocation | null> {
    try {
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw createError('User not found', 404);
      }

      return this.locationRepository.getLatestLocation(userId);
    } catch (error) {
      logger.error('Get latest location failed:', error);
      throw error;
    }
  }

  async getLocationHistory(
    userId: string,
    startDate?: Date,
    endDate?: Date,
    pagination?: PaginationOptions
  ): Promise<PaginatedResult<ILocation> | ILocation[]> {
    try {
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw createError('User not found', 404);
      }

      return this.locationRepository.getLocationHistory(userId, startDate, endDate, pagination);
    } catch (error) {
      logger.error('Get location history failed:', error);
      throw error;
    }
  }

  async findNearbyDeliveryPartners(
    latitude: number,
    longitude: number,
    radiusKm: number = 10
  ): Promise<any[]> {
    try {
      // Validate coordinates
      if (latitude < -90 || latitude > 90) {
        throw createError('Invalid latitude', 400);
      }
      if (longitude < -180 || longitude > 180) {
        throw createError('Invalid longitude', 400);
      }
      if (radiusKm <= 0 || radiusKm > 100) {
        throw createError('Radius must be between 1 and 100 km', 400);
      }

      const nearbyPartners = await this.locationRepository.findNearbyDeliveryPartners(
        latitude,
        longitude,
        radiusKm
      );

      return nearbyPartners;
    } catch (error) {
      logger.error('Find nearby delivery partners failed:', error);
      throw error;
    }
  }

  async getOrderTrackingLocations(orderId: string): Promise<ILocation[]> {
    try {
      return this.locationRepository.getOrderTrackingLocations(orderId);
    } catch (error) {
      logger.error('Get order tracking locations failed:', error);
      throw error;
    }
  }

  async updateDeliveryPartnerOnlineStatus(userId: string, isOnline: boolean): Promise<void> {
    try {
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw createError('User not found', 404);
      }

      if (user.role !== UserRole.DELIVERY_PARTNER) {
        throw createError('User is not a delivery partner', 400);
      }

      // Update user's online status
      await this.userRepository.updateDeliveryPartnerOnlineStatus(userId, isOnline);

      // Update location records
      await this.locationRepository.updateDeliveryPartnerStatus(userId, isOnline);

      logger.info(`Delivery partner online status updated: ${userId} - ${isOnline}`);
    } catch (error) {
      logger.error('Update delivery partner online status failed:', error);
      throw error;
    }
  }

  async getActiveDeliveryPartners(): Promise<ILocation[]> {
    try {
      return this.locationRepository.getActiveDeliveryPartners();
    } catch (error) {
      logger.error('Get active delivery partners failed:', error);
      throw error;
    }
  }

  async getDeliveryPartnerMovementStats(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<any> {
    try {
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw createError('User not found', 404);
      }

      if (user.role !== UserRole.DELIVERY_PARTNER) {
        throw createError('User is not a delivery partner', 400);
      }

      const stats = await this.locationRepository.getDeliveryPartnerMovementStats(
        userId,
        startDate,
        endDate
      );

      return stats[0] || {
        totalLocations: 0,
        averageSpeed: 0,
        maxSpeed: 0,
        totalDistance: 0,
        firstLocation: null,
        lastLocation: null,
      };
    } catch (error) {
      logger.error('Get delivery partner movement stats failed:', error);
      throw error;
    }
  }

  async trackOrderLocation(orderId: string): Promise<{
    deliveryPartnerLocation: ILocation | null;
    locationHistory: ILocation[];
  }> {
    try {
      // Get order tracking locations
      const locationHistory = await this.locationRepository.getOrderTrackingLocations(orderId);
      
      // Get latest location of delivery partner for this order
      let deliveryPartnerLocation: ILocation | null = null;
      if (locationHistory.length > 0) {
        const latestLocation = locationHistory[locationHistory.length - 1];
        deliveryPartnerLocation = await this.locationRepository.getLatestLocation(
          latestLocation.userId.toString()
        );
      }

      return {
        deliveryPartnerLocation,
        locationHistory,
      };
    } catch (error) {
      logger.error('Track order location failed:', error);
      throw error;
    }
  }

  async getLocationAnalytics(
    userId?: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<any> {
    try {
      const filter: any = {};
      
      if (userId) {
        const user = await this.userRepository.findById(userId);
        if (!user) {
          throw createError('User not found', 404);
        }
        filter.userId = userId;
      }

      if (startDate || endDate) {
        filter.createdAt = {};
        if (startDate) filter.createdAt.$gte = startDate;
        if (endDate) filter.createdAt.$lte = endDate;
      }

      const analytics = await this.locationRepository.aggregate([
        { $match: filter },
        {
          $group: {
            _id: null,
            totalUpdates: { $sum: 1 },
            uniqueUsers: { $addToSet: '$userId' },
            averageAccuracy: { $avg: '$coordinates.accuracy' },
            onlineTime: {
              $sum: {
                $cond: [{ $eq: ['$isOnline', true] }, 1, 0]
              }
            },
            averageBatteryLevel: { $avg: '$batteryLevel' },
            networkTypeDistribution: {
              $push: '$networkType'
            }
          }
        },
        {
          $project: {
            totalUpdates: 1,
            uniqueUsers: { $size: '$uniqueUsers' },
            averageAccuracy: { $round: ['$averageAccuracy', 2] },
            onlinePercentage: {
              $round: [
                { $multiply: [{ $divide: ['$onlineTime', '$totalUpdates'] }, 100] },
                2
              ]
            },
            averageBatteryLevel: { $round: ['$averageBatteryLevel', 2] },
            networkTypeDistribution: 1
          }
        }
      ]);

      return analytics[0] || {
        totalUpdates: 0,
        uniqueUsers: 0,
        averageAccuracy: 0,
        onlinePercentage: 0,
        averageBatteryLevel: 0,
        networkTypeDistribution: []
      };
    } catch (error) {
      logger.error('Get location analytics failed:', error);
      throw error;
    }
  }

  async getDeliveryHeatmap(
    bounds: {
      northEast: { latitude: number; longitude: number };
      southWest: { latitude: number; longitude: number };
    },
    startDate?: Date,
    endDate?: Date
  ): Promise<any[]> {
    try {
      const filter: any = {
        'coordinates.latitude': {
          $gte: bounds.southWest.latitude,
          $lte: bounds.northEast.latitude
        },
        'coordinates.longitude': {
          $gte: bounds.southWest.longitude,
          $lte: bounds.northEast.longitude
        }
      };

      if (startDate || endDate) {
        filter.createdAt = {};
        if (startDate) filter.createdAt.$gte = startDate;
        if (endDate) filter.createdAt.$lte = endDate;
      }

      // Join with users to get only delivery partners
      const heatmapData = await this.locationRepository.aggregate([
        { $match: filter },
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'user'
          }
        },
        {
          $match: {
            'user.role': 'delivery_partner'
          }
        },
        {
          $group: {
            _id: {
              lat: { $round: ['$coordinates.latitude', 3] },
              lng: { $round: ['$coordinates.longitude', 3] }
            },
            count: { $sum: 1 },
            uniquePartners: { $addToSet: '$userId' }
          }
        },
        {
          $project: {
            latitude: '$_id.lat',
            longitude: '$_id.lng',
            intensity: '$count',
            uniquePartners: { $size: '$uniquePartners' }
          }
        },
        { $sort: { intensity: -1 } }
      ]);

      return heatmapData;
    } catch (error) {
      logger.error('Get delivery heatmap failed:', error);
      throw error;
    }
  }

  async cleanupOldLocations(daysOld: number = 30): Promise<number> {
    try {
      if (daysOld < 7) {
        throw createError('Cannot delete locations newer than 7 days', 400);
      }

      const deletedCount = await this.locationRepository.cleanupOldLocations(daysOld);
      
      logger.info(`Cleaned up ${deletedCount} old location records older than ${daysOld} days`);
      return deletedCount;
    } catch (error) {
      logger.error('Cleanup old locations failed:', error);
      throw error;
    }
  }

  async validateLocationUpdate(
    userId: string,
    coordinates: LocationCoordinates
  ): Promise<{ isValid: boolean; reason?: string }> {
    try {
      // Get user's last location
      const lastLocation = await this.locationRepository.getLatestLocation(userId);
      
      if (!lastLocation) {
        return { isValid: true };
      }

      // Check time difference (shouldn't be too frequent)
      const timeDiff = Date.now() - lastLocation.createdAt.getTime();
      if (timeDiff < 5000) { // 5 seconds minimum
        return { 
          isValid: false, 
          reason: 'Location updates too frequent' 
        };
      }

      // Check distance (shouldn't be impossible)
      const distance = this.calculateDistance(
        lastLocation.coordinates.latitude,
        lastLocation.coordinates.longitude,
        coordinates.latitude,
        coordinates.longitude
      );

      const maxSpeedKmh = 120; // Maximum realistic speed
      const maxDistanceKm = (maxSpeedKmh * timeDiff) / (1000 * 60 * 60); // Convert to km

      if (distance > maxDistanceKm) {
        return { 
          isValid: false, 
          reason: 'Location change exceeds maximum possible speed' 
        };
      }

      return { isValid: true };
    } catch (error) {
      logger.error('Validate location update failed:', error);
      return { isValid: false, reason: 'Validation error' };
    }
  }

  async getLocationStats(userId?: string): Promise<any> {
    try {
      const filter: any = {};
      if (userId) {
        const user = await this.userRepository.findById(userId);
        if (!user) {
          throw createError('User not found', 404);
        }
        filter.userId = userId;
      }

      const stats = await this.locationRepository.aggregate([
        { $match: filter },
        {
          $group: {
            _id: '$userId',
            totalUpdates: { $sum: 1 },
            firstUpdate: { $min: '$createdAt' },
            lastUpdate: { $max: '$createdAt' },
            averageAccuracy: { $avg: '$coordinates.accuracy' },
            averageSpeed: { $avg: '$speed' },
            maxSpeed: { $max: '$speed' },
            averageBatteryLevel: { $avg: '$batteryLevel' },
            onlineTime: {
              $sum: {
                $cond: [{ $eq: ['$isOnline', true] }, 1, 0]
              }
            }
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'user'
          }
        },
        {
          $project: {
            userId: '$_id',
            userInfo: { $arrayElemAt: ['$user', 0] },
            totalUpdates: 1,
            firstUpdate: 1,
            lastUpdate: 1,
            averageAccuracy: { $round: ['$averageAccuracy', 2] },
            averageSpeed: { $round: ['$averageSpeed', 2] },
            maxSpeed: 1,
            averageBatteryLevel: { $round: ['$averageBatteryLevel', 2] },
            onlinePercentage: {
              $round: [
                { $multiply: [{ $divide: ['$onlineTime', '$totalUpdates'] }, 100] },
                2
              ]
            }
          }
        }
      ]);

      return stats;
    } catch (error) {
      logger.error('Get location stats failed:', error);
      throw error;
    }
  }

  async findOptimalDeliveryPartner(
    pickupLatitude: number,
    pickupLongitude: number,
    deliveryLatitude: number,
    deliveryLongitude: number,
    radiusKm: number = 10
  ): Promise<any> {
    try {
      // Find nearby delivery partners
      const nearbyPartners = await this.locationRepository.findNearbyDeliveryPartners(
        pickupLatitude,
        pickupLongitude,
        radiusKm
      );

      if (nearbyPartners.length === 0) {
        return null;
      }

      // Calculate score for each delivery partner based on:
      // 1. Distance from pickup location
      // 2. Distance from delivery location
      // 3. Delivery partner rating
      // 4. Current workload (number of active orders)
      const scoredPartners = await Promise.all(
        nearbyPartners.map(async (partner) => {
          const pickupDistance = this.calculateDistance(
            pickupLatitude,
            pickupLongitude,
            partner.coordinates.latitude,
            partner.coordinates.longitude
          );

          const deliveryDistance = this.calculateDistance(
            partner.coordinates.latitude,
            partner.coordinates.longitude,
            deliveryLatitude,
            deliveryLongitude
          );

          // Get user info for rating
          const user = await this.userRepository.findById(partner.userId);
          const rating =  0;
          const totalDeliveries =  0;

          // Calculate score (lower is better)
          // Factors: distance weight (70%), rating weight (20%), experience weight (10%)
          const distanceScore = (pickupDistance + deliveryDistance) * 0.7;
          const ratingScore = (5 - rating) * 0.2; // Invert rating so higher rating = lower score
          const experienceScore = Math.max(0, (100 - totalDeliveries)) * 0.001; // Experience bonus

          const totalScore = distanceScore + ratingScore + experienceScore;

          return {
            ...partner,
            user,
            pickupDistance,
            deliveryDistance,
            rating,
            totalDeliveries,
            score: totalScore
          };
        })
      );

      // Sort by score (ascending - lower score is better)
      scoredPartners.sort((a, b) => a.score - b.score);

      return scoredPartners[0]; // Return the best match
    } catch (error) {
      logger.error('Find optimal delivery partner failed:', error);
      throw error;
    }
  }

  async getLocationCoverage(radiusKm: number = 10): Promise<any> {
    try {
      const coverage = await this.locationRepository.aggregate([
        {
          $match: {
            isOnline: true,
            createdAt: { $gte: new Date(Date.now() - 15 * 60 * 1000) } // Last 15 minutes
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'user'
          }
        },
        {
          $match: {
            'user.role': 'delivery_partner',
            'user.isActive': true,
            'user.deliveryPartnerInfo.isOnline': true
          }
        },
        {
          $group: {
            _id: {
              lat: { $round: [{ $divide: ['$coordinates.latitude', radiusKm/111] }] }, // Roughly convert km to degrees
              lng: { $round: [{ $divide: ['$coordinates.longitude', radiusKm/111] }] }
            },
            count: { $sum: 1 },
            avgLatitude: { $avg: '$coordinates.latitude' },
            avgLongitude: { $avg: '$coordinates.longitude' },
            partners: { $push: '$userId' }
          }
        },
        {
          $project: {
            centerLatitude: '$avgLatitude',
            centerLongitude: '$avgLongitude',
            partnerCount: '$count',
            coverageRadius: radiusKm,
            partners: 1
          }
        }
      ]);

      return coverage;
    } catch (error) {
      logger.error('Get location coverage failed:', error);
      throw error;
    }
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(value: number): number {
    return (value * Math.PI) / 180;
  }
}