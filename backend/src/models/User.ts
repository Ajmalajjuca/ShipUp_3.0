import mongoose, { Schema } from 'mongoose';
import { UserRole } from '../types';
import { IUser, IUserModel } from '../interfaces/IModel/IUser';

const userSchema = new Schema<IUser>(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: [1, 'Full name must be at least 1 character'],
      maxlength: [100, 'Full name must not exceed 100 characters'],
      match: [/^[a-zA-Z\s]+$/, 'Full name should contain only letters and spaces'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      unique: true,
      trim: true,
      match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.CUSTOMER,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    emailVerifiedAt: {
      type: Date,
    },
    phoneVerifiedAt: {
      type: Date,
    },
    profilePicture: {
      type: String,
    },
    lastLoginAt: {
      type: Date,
    },
    addressId: { type: Schema.Types.ObjectId, ref: 'Address' },
preferenceId: { type: Schema.Types.ObjectId, ref: 'Preference' },
ratingId: { type: Schema.Types.ObjectId, ref: 'Rating' },
walletId: { type: Schema.Types.ObjectId, ref: 'Wallet' },

  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.password;
        return ret;
      },
    },
  }
);

// Indexes for performance
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ phone: 1 }, { unique: true });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ createdAt: -1 });

export const User = mongoose.model<IUser, IUserModel>('User', userSchema);
