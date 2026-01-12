import { FilterQuery, QueryOptions } from "mongoose";
import { IVehicle, } from "../IModel/IVehicle";

export interface IVehicleRepository {
  create(vehicle: IVehicle): Promise<IVehicle>;
  findById(id: string): Promise<IVehicle | null>;
  find(filter?: FilterQuery<IVehicle>, options?: QueryOptions): Promise<IVehicle[]>;
  update(id: string, vehicle: Partial<IVehicle>): Promise<IVehicle | null>;
  delete(id: string): Promise<IVehicle | null>;
  count(filter?: FilterQuery<IVehicle>): Promise<number>;
  toggleVehicleStatus(vehicleId: string): Promise<IVehicle | null>;
} 