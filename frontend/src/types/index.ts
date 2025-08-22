export const UserRole = {
  CUSTOMER: 'customer',
  DELIVERY_PARTNER: 'delivery_partner',
  ADMIN: 'admin',
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];

export interface ErrorResponse {
  response: {
    data: {
      message: string;
      errors?: string[];
      statusCode?: number;
    };
  };
}

export interface User {
  id: string;
  email: string;
  phone?: string;
  fullName: string;
  role: UserRole;
  permissions: string[];
  isEmailVerified: boolean;
  profilePicture?: string;
  createdAt: Date;
  lastLogin?: Date;
  loyaltyPoints?: number;
  walletBalance?: number;
}
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export type SignInFormErrors = {
  email?: string;
  password?: string;
}

export interface RegisterCredentials {
  fullName: string;
  email: string;
  phone?: string;
  password: string;
  confirmPassword?: string;
}
export type SignUpFormErrors = {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  phone?: string;
};

export interface PasswordResetCredentials {
  email: string;
  newPassword: string;
  confirmPassword: string;
}

export interface PasswordResetFormErrors {
  email?: string;
  newPassword?: string;
  confirmPassword?: string;
}
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  date: string;
}

export interface DriverRegistrationData {
  fullName?: string;
  dateOfBirth?: string;
  phone?: string;
  email?: string;
  profilePicture?: File;
  vehicleType?: string;
  registrationNumber?: string;
  accountHolderName?: string;
  accountNumber?: string;
  ifscCode?: string;
  upiId?: string;
  // Document files
  aadharFront?: File;
  aadharBack?: File;
  panFront?: File;
  panBack?: File;
  licenseFront?: File;
  licenseBack?: File;
  insuranceDocument?: File;
  pollutionDocument?: File;
}
  
  export interface DocumentItem {
    id: string;
    title: string;
    isCompleted: boolean;
    formComponent: React.FC<unknown>;
  }

  export interface PartnerUser {
  id: string;
  email: string;
  fullName: string;
  partnerId: string;
  role: string;
  isVerified: boolean;
  verificationStatus?: {
    personal: boolean;
    aadhar: boolean;
    pan: boolean;
    license: boolean;
    vehicle: boolean;
    bank: boolean;
  };
}

export interface OrderDetails {
  pickupAddress: {
    addressId: string;
    street: string;
    latitude?: number;
    longitude?: number;
  } | null;
  dropoffAddress: {
    addressId: string;
    street: string;
    latitude?: number;
    longitude?: number;
  } | null;
  vehicleId: string | null;
  deliveryType: "normal" | "express" | null;
  paymentMethod: PaymentMethod | null;
  distance: number;
  price: number;
  basePrice: number;
  deliveryPrice: number;
  commission: number;
  gstAmount: number;
  estimatedTime: string;
  effectiveDistance: number;
}

export interface DriverTracking {
  driverId: string;
  driverName: string;
  profileImage?: string;
  vehicle: string;
  location: { latitude: number; longitude: number };
  estimatedArrival: string;
  distance: number;
  phone?: string;
}

export interface OtpStatus {
  pickupOtp: string | null;
  dropoffOtp: string | null;
  pickupVerified: boolean;
  dropoffVerified: boolean;
}

export interface vehicle {
  id: string;
  name: string;
  pricePerKm: number;
  maxWeight: number;
  imageUrl?: string;
  isAvailable: boolean;
}

export type OrderStatus= 
  | "created"
  | "finding_driver"
  | "driver_assigned"
  | "driver_arrived"
  | "picked_up"
  | "completed"
  | null

export interface PricingConfig {
  deliveryMultipliers: {
    normal: number;
    express: number;
  };
  taxRates: {
    gst: number;
    commission: number;
  };
  minimumDistance: number;
}

export type PaymentMethod = 'stripe' | 'wallet' | 'cash' | 'upi';

export interface EditProfileFormData {
  fullName: string;
  phone: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  profileImage?: string;
}

export interface Address {
  _id?: string;
  type: 'home' | 'work' | 'other';
  street: string;
  isDefault: boolean;
  streetNumber?: string;
  buildingNumber?: string;
  floorNumber?: string;
  contactName?: string;
  contactPhone?: string;
  latitude?: number;
  longitude?: number;
}

export interface AddressResponse {
  addresses: Address[];
}

