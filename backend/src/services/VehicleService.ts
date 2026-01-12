import { IVehicle } from "../interfaces/IModel/IVehicle";
import { IVehicleRepository } from "../interfaces/IRepository/IVehicleRepository";
import { createError } from "../utils/errorHandler";
import { logger } from "../utils/logger";
import { inject, injectable } from "tsyringe";

@injectable()
export class VehicleService {
  constructor(
    @inject("VehicleRepository") private vehicleRepository: IVehicleRepository
  ) {}

  getVehicleById(id: string) {
    try {
      const vehicle = this.vehicleRepository.findById(id);
      if (!vehicle) {
        throw createError("Vehicle not found", 404);
      }
      return vehicle;
    } catch (error) {
      logger.error("Get vehicle by ID failed:", error);
      throw error;
    }
  }

  async getVehicles({ page, limit, status, search, sort }: any, filter?: any): Promise<{ vehicles: IVehicle[]; total: number }>{
    try {
      const vehicles = await this.vehicleRepository.find(filter, {
        skip: (page - 1) * limit,
        limit: limit,
        sort: sort || { createdAt: -1 },
      });
      const total = await this.vehicleRepository.count(filter);
      return { vehicles, total };
    } catch (error) {
      logger.error("Get vehicles failed:", error);
      throw error;
    }
  }

  createVehicle(data: any) {
    try {
      const newVehicle = this.vehicleRepository.create(data);
      return newVehicle;
    } catch (error) {
      logger.error("Create vehicle failed:", error);
      throw error;
    }
  }

  updateVehicle(id: string, data: any) {
    try {
      const updatedVehicle = this.vehicleRepository.update(id, data);
      if (!updatedVehicle) {
        throw createError("Vehicle not found", 404);
      }
      return updatedVehicle;
    } catch (error) {
      logger.error("Update vehicle failed:", error);
      throw error;
    }
  }

  deleteVehicle(id: string) {
    try {
      const deleted = this.vehicleRepository.delete(id);
      if (!deleted) {
        throw createError("Vehicle not found", 404);
      }
      return deleted;
    } catch (error) {
      logger.error("Delete vehicle failed:", error);
      throw error;
    }
  }

  async toggleVehicleStatus(id: string) {
    try {
      const vehicle = await this.vehicleRepository.findById(id);
      if (!vehicle) {
        throw createError("Vehicle not found", 404);
      }
       const updatedVehicle = await this.vehicleRepository.toggleVehicleStatus(id);
      return updatedVehicle;
    } catch (error) {
      logger.error("Toggle vehicle status failed:", error);
      throw error;
    }
  }
}
