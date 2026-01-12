// src/interfaces/IModel/IVehicle.ts

import { Document } from "mongoose";

export interface IVehicle extends Document {
  vehicleId: string;
  name: string;
  description?: string;
  imageUrl?: string;
  isAvailable: boolean;
  maxWeight?: string | number;
  pricePerKm?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
