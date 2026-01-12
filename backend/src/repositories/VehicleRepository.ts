import { IVehicle } from "../interfaces/IModel/IVehicle";
import { BaseRepository } from "./BaseRepository";
import { Vehicle, VehicleDocument } from "../models/Vehicle";
import { IVehicleRepository } from "../interfaces/IRepository/IVehicleRepository";
import { injectable } from "tsyringe";

@injectable()
export class VehicleRepository extends BaseRepository<IVehicle> implements IVehicleRepository {
  constructor() {
    super(Vehicle);
  }
  
  async toggleVehicleStatus(vehicleId: string): Promise<IVehicle | null> {
    const vehicle = await this.model.findById(vehicleId);
    if (!vehicle) {
      return null;
    }
    vehicle.isActive =
      vehicle.isActive === true
        ? false
        : true;
    return vehicle.save();
  }
}   