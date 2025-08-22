import { Document, Types } from "mongoose";

export interface IPreference extends Document {
    ownerId: Types.ObjectId;
    ownerModel: 'User' | 'DeliveryPartner';
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  language: string;
  timezone: string;
  createdAt: Date;
  updatedAt: Date;
}
