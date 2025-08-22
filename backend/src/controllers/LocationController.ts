import { Request, Response, NextFunction } from 'express';
import { LocationService } from '../services/LocationService';
import { asyncHandler } from '../utils/errorHandler';
import { sendError, sendSuccess } from '../utils/response';
import { inject, injectable } from 'tsyringe';
import { ILocationService } from '../interfaces/IService/ILocationService';

@injectable()
export class LocationController {

  constructor(
    @inject('LocationService') private locationService: ILocationService
  ) { }

  updateLocation = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.userId;
    const { coordinates, ...additionalData } = req.body;
    
    // Validate location update
    const validation = await this.locationService.validateLocationUpdate(userId, coordinates);
    if (!validation.isValid) {
      return sendError(res, validation.reason || 'Invalid location update', 400);
    }
    
    const location = await this.locationService.updateUserLocation(
      userId,
      coordinates,
      additionalData
    );
    
    sendSuccess(res, 'Location updated successfully', { location });
  });

  getLatestLocation = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;
    const targetUserId = userId || req.user!.userId;
    
    const location = await this.locationService.getLatestLocation(targetUserId);
    
    if (!location) {
      return sendError(res, 'No location found', 404);
    }
    
    sendSuccess(res, 'Latest location retrieved successfully', { location });
  });

  getLocationHistory = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;
    const { startDate, endDate } = req.query;
    const pagination = req.pagination;
    
    const targetUserId = userId || req.user!.userId;
    
    const result = await this.locationService.getLocationHistory(
      targetUserId,
      startDate ? new Date(startDate as string) : undefined,
      endDate ? new Date(endDate as string) : undefined,
      pagination
    );
    
    sendSuccess(res, 'Location history retrieved successfully', { result });
  });

  findNearbyDeliveryPartners = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { latitude, longitude, radius } = req.query;
    
    if (!latitude || !longitude) {
      return sendError(res, 'Latitude and longitude are required', 400);
    }
    
    const deliveryPartners = await this.locationService.findNearbyDeliveryPartners(
      parseFloat(latitude as string),
      parseFloat(longitude as string),
      radius ? parseFloat(radius as string) : 10
    );
    
    sendSuccess(res, 'Nearby delivery partners found', { deliveryPartners });
  });

  trackOrder = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { orderId } = req.params;
    
    const tracking = await this.locationService.trackOrderLocation(orderId);
    
    sendSuccess(res, 'Order tracking retrieved successfully', tracking);
  });

  updateOnlineStatus = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.userId;
    const { isOnline } = req.body;
    
    await this.locationService.updateDeliveryPartnerOnlineStatus(userId, isOnline);
    
    sendSuccess(res, 'Online status updated successfully');
  });

  getActiveDeliveryPartners = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const activePartners = await this.locationService.getActiveDeliveryPartners();
    
    sendSuccess(res, 'Active delivery partners retrieved successfully', { activePartners });
  });

  getMovementStats = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return sendError(res, 'Start date and end date are required', 400);
    }
    
    const targetUserId = userId || req.user!.userId;
    
    const stats = await this.locationService.getDeliveryPartnerMovementStats(
      targetUserId,
      new Date(startDate as string),
      new Date(endDate as string)
    );
    
    sendSuccess(res, 'Movement statistics retrieved successfully', { stats });
  });

  getLocationAnalytics = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { userId, startDate, endDate } = req.query;
    
    const analytics = await this.locationService.getLocationAnalytics(
      userId as string,
      startDate ? new Date(startDate as string) : undefined,
      endDate ? new Date(endDate as string) : undefined
    );
    
    sendSuccess(res, 'Location analytics retrieved successfully', { analytics });
  });

  getDeliveryHeatmap = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { northEastLat, northEastLng, southWestLat, southWestLng, startDate, endDate } = req.query;
    
    if (!northEastLat || !northEastLng || !southWestLat || !southWestLng) {
      return sendError(res, 'Bounds coordinates are required', 400);
    }
    
    const bounds = {
      northEast: {
        latitude: parseFloat(northEastLat as string),
        longitude: parseFloat(northEastLng as string)
      },
      southWest: {
        latitude: parseFloat(southWestLat as string),
        longitude: parseFloat(southWestLng as string)
      }
    };
    
    const heatmapData = await this.locationService.getDeliveryHeatmap(
      bounds,
      startDate ? new Date(startDate as string) : undefined,
      endDate ? new Date(endDate as string) : undefined
    );
    
    sendSuccess(res, 'Delivery heatmap data retrieved successfully', { heatmapData });
  });

  cleanupOldLocations = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { daysOld } = req.body;
    
    const deletedCount = await this.locationService.cleanupOldLocations(daysOld || 30);
    
    sendSuccess(res, 'Old locations cleaned up successfully', { deletedCount });
  });
}