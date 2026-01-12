import { IVehicleService } from "../interfaces/IService/IVehicleService";
import { asyncHandler } from "../utils/errorHandler";
import { sendSuccess } from "../utils/response";
import { NextFunction, Response, Request } from "express";
import { inject, injectable } from "tsyringe";

@injectable()
export class VehiclesController {
  constructor(
    @inject("VehicleService") private vehicleService: IVehicleService
  ) {}

  toggleVehicleStatus = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const vehicleId = req.params.id;
      const updatedVehicle = await this.vehicleService.toggleVehicleStatus(
        vehicleId
      );
      sendSuccess(res, "Vehicle status toggled successfully", {
        vehicle: updatedVehicle,
      });
    }
  );

  getVehicleById = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const vehicleId = req.params.id;
      const vehicle = await this.vehicleService.getVehicleById(vehicleId);
      sendSuccess(res, "Vehicle retrieved successfully", { vehicle });
    }
  );

  getVehicles = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const filter: any = {};
      if (req.query.status) filter.status = req.query.status;

      const { vehicles, total } = await this.vehicleService.getVehicles(
        { page, limit },
        filter
      );
      
      sendSuccess(res, "Vehicles retrieved successfully", { vehicles,
      total,
      page,
      limit });
    }
  );

  createVehicle = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {

      const file = req.file as Express.MulterS3.File;
      const imageUrl = file?.location; // S3 URL of the uploaded image
      
      const vehicleData = req.body;
      const newVehicle = await this.vehicleService.createVehicle({...vehicleData, imageUrl});
      sendSuccess(res, "Vehicle created successfully", { vehicle: newVehicle });
    }
  );

  updateVehicle = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const vehicleId = req.params.id;
      const updateData = req.body;
      const updatedVehicle = await this.vehicleService.updateVehicle(
        vehicleId,
        updateData
      );
      sendSuccess(res, "Vehicle updated successfully", {
        vehicle: updatedVehicle,
      });
    }
  );

  deleteVehicle = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const vehicleId = req.params.id;
      await this.vehicleService.deleteVehicle(vehicleId);
      sendSuccess(res, "Vehicle deleted successfully");
    }
  );
}
