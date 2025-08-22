import mongoose, { Schema } from 'mongoose';
import { IPartner } from '../interfaces/IModel/IPartner';

export enum PartnerStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
  SUSPENDED = 'suspended'
}

export enum VehicleType {
  MOTORCYCLE = 'motorcycle',
  CAR = 'car',
  VAN = 'van',
  TRUCK = 'truck'
}

const deliveryPartnerSchema = new Schema<IPartner>({
  // 1. Identity & Basic Info
  partnerId: { type: String, unique: true, required: true },
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  phone: { type: String, required: true }, // Made required for registration
  dateOfBirth: { type: String, required: true }, // Keep as string to match your frontend
  profilePicture: String,

  // 2. References (keeping your existing structure)
  addressId: { type: Schema.Types.ObjectId, ref: 'Address' },
  vehicleId: { type: Schema.Types.ObjectId, ref: 'Vehicle' },
  ratingId: { type: Schema.Types.ObjectId, ref: 'Rating' },
  preferenceId: { type: Schema.Types.ObjectId, ref: 'Preference' },
  walletId: { type: Schema.Types.ObjectId, ref: 'Wallet' },

  // 3. Personal Documents
  personalDocuments: {
    
      aadharFront: String,
      aadharBack: String,
      aadharStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
      aadharRejectionReason: String,
    
    
      panFront: String,
      panBack: String,
      panStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
      panRejectionReason: String,
    
    
      licenseFront: String,
      licenseBack: String,
      licenseStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
      licenseRejectionReason: String
    
  },

  // 4. Vehicle Details (Updated to match registration form)
  
  
  
  
  // 5. Vehicle Documents (Updated field name from vehicalDocuments)
  vehicalDocuments: {
    vehicleType: { type: String, required: true},
    registrationNumber: { type: String, required: true },
    insuranceDocument: String,
    pollutionDocument: String,
    insuranceStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    pollutionStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    insuranceRejectionReason: String,
    pollutionRejectionReason: String
  },

  // 6. Bank Details
  bankingDetails: {
    accountHolderName: { type: String, required: true },
    accountNumber: { type: String, required: true },
    ifscCode: { type: String, required: true },
    upiId: String,
    bankingStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'approved' }, // Bank details usually auto-approved
    rejectionReason: String
  },

  // 7. Status & Activity (keeping your existing structure)
  isAvailable: { type: Boolean, default: false, index: true },
  isActive: { type: Boolean, default: true, index: true },
  isVerified: { type: Boolean, default: false },
  status: { 
    type: String, 
    enum: Object.values(PartnerStatus), 
    default: PartnerStatus.PENDING 
  },
  hasPendingRequest: { type: Boolean, default: false },
  lastSeen: Date,
  lastRequestTime: Date,
  lastLocationUpdate: Date,
  lastOnline: Date,
  lastLoginAt: Date, // Added for auth tracking
  currentOrderId: String,

  // 8. Completion Status (keeping your existing structure)
  bankDetailsCompleted: { type: Boolean, default: false },
  personalDocumentsCompleted: { type: Boolean, default: false },
  vehicleDetailsCompleted: { type: Boolean, default: false },

  // 9. Order Stats (keeping your existing structure)
  totalOrders: { type: Number, default: 0 },
  ongoingOrders: { type: Number, default: 0 },
  completedOrders: { type: Number, default: 0 },
  canceledOrders: { type: Number, default: 0 },

  // 10. Location (if you need geolocation)
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: [0, 0]
    }
  }

}, {
  timestamps: true
});

// Indexes (keeping your existing ones)
deliveryPartnerSchema.index({ location: '2dsphere' });
deliveryPartnerSchema.index({ isAvailable: 1, isActive: 1, isVerified: 1 });
deliveryPartnerSchema.index({ email: 1 });
deliveryPartnerSchema.index({ partnerId: 1 });
deliveryPartnerSchema.index({ phone: 1 });

// Pre-save middleware to generate partnerId
deliveryPartnerSchema.pre('save', async function(next) {
  if (this.isNew && !this.partnerId) {
    const prefix = 'PRT';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.partnerId = `${prefix}${timestamp}${random}`;
  }
  next();
});

// Method to check if all documents are approved
deliveryPartnerSchema.methods.isFullyVerified = function() {
  const docs = this.personalDocuments;
  const vehicleDocs = this.vehicleDocuments;
  
  return (
    docs.aadhar.status === 'approved' &&
    docs.pan.status === 'approved' &&
    docs.license.status === 'approved' &&
    vehicleDocs.insuranceStatus === 'approved' &&
    vehicleDocs.pollutionStatus === 'approved' &&
    this.bankingDetails.status === 'approved'
  );
};

// Method to get verification status
deliveryPartnerSchema.methods.getVerificationStatus = function() {
  return {
    personal: true, // Always true after registration
    aadhar: this.personalDocuments.aadhar.status === 'approved',
    pan: this.personalDocuments.pan.status === 'approved',
    license: this.personalDocuments.license.status === 'approved',
    vehicle: (
      this.vehicleDocuments.insuranceStatus === 'approved' && 
      this.vehicleDocuments.pollutionStatus === 'approved'
    ),
    bank: this.bankingDetails.status === 'approved'
  };
};

export const Partner = mongoose.model<IPartner>('DeliveryPartner', deliveryPartnerSchema);
