import { UserRepository } from '../repositories/UserRepository';
import { UserRole, PaginationOptions, PaginatedResult, Address } from '../types';
import { createError } from '../utils/errorHandler';
import { logger } from '../utils/logger';
import { injectable, inject } from 'tsyringe';
import { IUserService } from '../interfaces/IService/IUserService';
import { IUserRepository } from '../interfaces/IRepository/IUserRepository';
import { IUser } from '../interfaces/IModel/IUser';
import { comparePassword, hashPassword } from '../utils/helpers';
import { IAddressRepository } from '../interfaces/IRepository/IAddressRepository';
import { IAddress } from '../interfaces/IModel/IAddress';


@injectable()
export class UserService implements IUserService {

  constructor(
    @inject('UserRepository') private userRepository: IUserRepository,
    @inject('addressRepository') private addressRepository: IAddressRepository
  ) {}

  async getUserProfile(userId: string): Promise<IUser> {
    try {
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw createError('User not found', 404);
      }

      return user;
    } catch (error) {
      logger.error('Get user profile failed:', error);
      throw error;
    }
  }

 async updateProfile(
  userId: string,
  updateData: {
    fullName?: string;
    phone?: string;
    profilePicture?: string;
    currentPassword?: string;
    newPassword?: string;
    password?: string;
    
  }
): Promise<IUser> {

  try {
    const user = await this.userRepository.findById(userId)
    
    if (!user) {
      throw createError('User not found', 404);
    }

    // Check if phone number is being updated and if it's already taken
    if (updateData.phone && updateData.phone !== user.phone) {
      const existingUser = await this.userRepository.findByPhone(updateData.phone);
      if (existingUser && existingUser._id.toString() !== userId) {
        throw createError('Phone number already registered', 400);
      }
    }

    // Handle password change
    if (updateData.currentPassword || updateData.newPassword) {
  if (!updateData.currentPassword || !updateData.newPassword) {
    throw createError('Both current and new password are required', 400);
  }

  if (!user.password) {
    throw createError('This account does not have a password set', 400);
  }

  const isPasswordValid = await comparePassword(updateData.currentPassword, user.password);
  if (!isPasswordValid) {
    throw createError('Current password is incorrect', 400);
  }

  // Hash and set new password
  updateData.password = await hashPassword(updateData.newPassword);
}

    // Remove sensitive/non-db fields before update
    delete updateData.currentPassword;
    delete updateData.newPassword;

    const updatedUser = await this.userRepository.update(userId, updateData);
    if (!updatedUser) {
      throw createError('Failed to update profile', 500);
    }

    logger.info(`Profile updated for user: ${userId}`);
    return updatedUser;
  } catch (error) {
    logger.error('Update profile failed:', error);
    throw error;
  }
}


  async getAllUsers(
    pagination: PaginationOptions,
    filters?: {
      role?: UserRole;
      isActive?: boolean;
      isVerified?: boolean;
      search?: string;
    }
  ): Promise<PaginatedResult<IUser>> {
    try {
      if (filters?.search) {
        return this.userRepository.searchUsers(filters.search, pagination);
      }

      let result: PaginatedResult<IUser>;

      if (filters?.role) {
        result = await this.userRepository.findByRole(filters.role, pagination);
      } else {
        result = await this.userRepository.findActiveUsers(pagination);
      }

      // Apply additional filters if needed
      if (filters?.isActive !== undefined || filters?.isVerified !== undefined) {
        // This could be optimized by adding these filters to the repository methods
        result.data = result.data.filter(user => {
          if (filters.isActive !== undefined && user.isActive !== filters.isActive) {
            return false;
          }
          if (filters.isVerified !== undefined && user.isVerified !== filters.isVerified) {
            return false;
          }
          return true;
        });
      }

      return result;
    } catch (error) {
      logger.error('Get all users failed:', error);
      throw error;
    }
  }

  async getUserById(userId: string): Promise<IUser> {
    try {
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw createError('User not found', 404);
      }

      return user;
    } catch (error) {
      logger.error('Get user by ID failed:', error);
      throw error;
    }
  }

  async deactivateUser(userId: string): Promise<IUser> {
    try {
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw createError('User not found', 404);
      }

      const updatedUser = await this.userRepository.update(userId, { isActive: false });
      if (!updatedUser) {
        throw createError('Failed to deactivate user', 500);
      }

      logger.info(`User deactivated: ${userId}`);
      return updatedUser;
    } catch (error) {
      logger.error('Deactivate user failed:', error);
      throw error;
    }
  }

  async activateUser(userId: string): Promise<IUser> {
    try {
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw createError('User not found', 404);
      }

      const updatedUser = await this.userRepository.update(userId, { isActive: true });
      if (!updatedUser) {
        throw createError('Failed to activate user', 500);
      }

      logger.info(`User activated: ${userId}`);
      return updatedUser;
    } catch (error) {
      logger.error('Activate user failed:', error);
      throw error;
    }
  }

  // Address Management
  async addAddress(userId: string, address: Address): Promise<IAddress> {
    try {
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw createError('User not found', 404);
      }

      const addedaddress = await this.addressRepository.createAddress({
        ...address,
        owner: user._id,
        ownerModel: 'User',
      });

      logger.info(`Address added for user: ${userId}`);
      return addedaddress;
    } catch (error) {
      logger.error('Add address failed:', error);
      throw error;
    }
  }

  async getUserAddressById(userId: string, addressId: string): Promise<IAddress> {
    try {
      const address = await this.addressRepository.findById(addressId);
      if (!address) {
        throw createError('Address not found', 404);
      }
      if(address.owner?.toString() !== userId){
        throw createError('Address not found', 404);
      }
      return address;
    } catch (error) {
      logger.error('Get address by ID failed:', error);
      throw error;
    }
  }

  async updateAddress(userId: string, addressId: string, newAddress: Address): Promise<IAddress> {
    try {
      const address = await this.addressRepository.findById(addressId);
      if (!address) {
        throw createError('Address not found', 404);
      }
      if(address.owner?.toString() !== userId){
        throw createError('Address not found', 404);
      }
      const updatedUser = await this.addressRepository.updateAddress(userId, addressId, newAddress);
      if (!updatedUser) {
        throw createError('Failed to update address', 500);
      }

      logger.info(`Address updated for user: ${userId}`);
      return updatedUser;
    } catch (error) {
      logger.error('Update address failed:', error);
      throw error;
    }
  }

  async removeAddress(userId: string, addressId: string): Promise<Boolean> {
    try {
      const Address = await this.addressRepository.findById(addressId);
      if (!Address) {
        throw createError('User not found', 404);
      }

      if(Address.owner?.toString() !== userId){
        throw createError('Address not found', 404);
      }

      const isDeleted = await this.addressRepository.deleteAddress(addressId, userId);
      if (!isDeleted) {
        throw createError('Failed to remove address', 500);
      }

      logger.info(`Address removed for user: ${userId}`);
      return isDeleted;
    } catch (error) {
      logger.error('Remove address failed:', error);
      throw error;
    }
  }

  async setDefaultAddress(userId:string, addressId:string): Promise<IAddress | null>{
    try {
      const Address = await this.addressRepository.findById(addressId);
      if (!Address) {
        throw createError('User not found', 404);
      }

      if(Address.owner?.toString() !== userId){
        throw createError('Address not found', 404);
      }

      
      const isSetDefault = await this.addressRepository.setDefaultAddress(userId, addressId, !Address.isDefault);
      if (!isSetDefault) {
        throw createError('Failed to set default address', 500);
      }

      logger.info(`Address set default for user: ${userId}`);
      return isSetDefault;
    } catch (error) {
      logger.error('Set default address failed:', error);
      throw error;
    }
  }

  async getUserAddresses(userId: string): Promise<IAddress[]> {
    try {
      const addresses = await this.addressRepository.findByUserId(userId);
      if (!addresses) {
        throw createError('Addresses not found', 404);
      }

      return addresses;
    } catch (error) {
      logger.error('Get user addresses failed:', error);
      throw error;
    }
  }

  // Delivery Partner specific methods
  async getDeliveryPartners(
    pagination: PaginationOptions,
    filters?: {
      isOnline?: boolean;
      rating?: number;
      documentsVerified?: boolean;
    }
  ): Promise<PaginatedResult<IUser>> {
    try {
      const result = await this.userRepository.findDeliveryPartners(
        filters?.isOnline,
        pagination
      );

      // Ensure result is always PaginatedResult<IUser>
      let paginatedResult: PaginatedResult<IUser>;
      if (Array.isArray(result)) {
        paginatedResult = {
          data: result,
          pagination: {
            total: result.length,
            page: pagination.page,
            limit: pagination.limit,
            pages: 1,
            hasNext: false,
            hasPrev: false,
          },
        };
      } else {
        paginatedResult = result;
      }

      // Apply additional filters
      if (
        (filters?.rating !== undefined || filters?.documentsVerified !== undefined) &&
        paginatedResult.data
      ) {
        paginatedResult.data = paginatedResult.data.filter(user => {
          if (!user) return false;
          
          if (filters.rating !== undefined && 3 < filters.rating) {
            return false;
          }
          
          
          
          return true;
        });
      }

      return paginatedResult;
    } catch (error) {
      logger.error('Get delivery partners failed:', error);
      throw error;
    }
  }

  async updateDeliveryPartnerInfo(
    userId: string,
    updateData: {
      vehicleType?: string;
      vehicleNumber?: string;
      licenseNumber?: string;
      licenseExpiry?: Date;
      isOnline?: boolean;
    }
  ): Promise<IUser> {
    try {
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw createError('User not found', 404);
      }

      if (user.role !== UserRole.DELIVERY_PARTNER) {
        throw createError('User is not a delivery partner', 400);
      }

      const updateFields: any = {};
      Object.keys(updateData).forEach(key => {
        updateFields[`deliveryPartnerInfo.${key}`] = updateData[key as keyof typeof updateData];
      });

      const updatedUser = await this.userRepository.update(userId, updateFields);
      if (!updatedUser) {
        throw createError('Failed to update delivery partner info', 500);
      }

      logger.info(`Delivery partner info updated for user: ${userId}`);
      return updatedUser;
    } catch (error) {
      logger.error('Update delivery partner info failed:', error);
      throw error;
    }
  }

  async updateDeliveryPartnerOnlineStatus(userId: string, isOnline: boolean): Promise<IUser> {
    try {
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw createError('User not found', 404);
      }

      if (user.role !== UserRole.DELIVERY_PARTNER) {
        throw createError('User is not a delivery partner', 400);
      }

      const updatedUser = await this.userRepository.updateDeliveryPartnerOnlineStatus(userId, isOnline);
      if (!updatedUser) {
        throw createError('Failed to update online status', 500);
      }

      logger.info(`Delivery partner online status updated: ${userId} - ${isOnline}`);
      return updatedUser;
    } catch (error) {
      logger.error('Update delivery partner online status failed:', error);
      throw error;
    }
  }

  async findNearbyDeliveryPartners(
    latitude: number,
    longitude: number,
    radiusKm: number = 10
  ): Promise<IUser[]> {
    try {
      const deliveryPartners = await this.userRepository.findDeliveryPartnersNearby(
        latitude,
        longitude,
        radiusKm
      );

      return deliveryPartners;
    } catch (error) {
      logger.error('Find nearby delivery partners failed:', error);
      throw error;
    }
  }

  async verifyDeliveryPartnerDocuments(userId: string): Promise<IUser> {
    try {
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw createError('User not found', 404);
      }

      if (user.role !== UserRole.DELIVERY_PARTNER) {
        throw createError('User is not a delivery partner', 400);
      }

      const updatedUser = await this.userRepository.update(userId, {
        'deliveryPartnerInfo.documentsVerified': true,
      });

      if (!updatedUser) {
        throw createError('Failed to verify documents', 500);
      }

      logger.info(`Delivery partner documents verified: ${userId}`);
      return updatedUser;
    } catch (error) {
      logger.error('Verify delivery partner documents failed:', error);
      throw error;
    }
  }

  async updateDeliveryPartnerRating(userId: string, newRating: number): Promise<IUser> {
    try {
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw createError('User not found', 404);
      }

      if (user.role !== UserRole.DELIVERY_PARTNER) {
        throw createError('User is not a delivery partner', 400);
      }

      const updatedUser = await this.userRepository.updateDeliveryPartnerRating(userId, newRating);
      if (!updatedUser) {
        throw createError('Failed to update rating', 500);
      }

      logger.info(`Delivery partner rating updated: ${userId} - ${newRating}`);
      return updatedUser;
    } catch (error) {
      logger.error('Update delivery partner rating failed:', error);
      throw error;
    }
  }

  async searchUsers(searchTerm: string, pagination: PaginationOptions): Promise<PaginatedResult<IUser>> {
    try {
      if (!searchTerm || searchTerm.trim().length < 2) {
        throw createError('Search term must be at least 2 characters', 400);
      }

      const result = await this.userRepository.searchUsers(searchTerm.trim(), pagination);
      return result;
    } catch (error) {
      logger.error('Search users failed:', error);
      throw error;
    }
  }

  async getUserStats(): Promise<any> {
    try {
      const totalUsers = await this.userRepository.count();
      const activeUsers = await this.userRepository.count({ isActive: true });
      const verifiedUsers = await this.userRepository.count({ isVerified: true });
      const customerCount = await this.userRepository.count({ role: UserRole.CUSTOMER });
      const deliveryPartnerCount = await this.userRepository.count({ role: UserRole.DELIVERY_PARTNER });
      const adminCount = await this.userRepository.count({ role: UserRole.ADMIN });
      const onlineDeliveryPartners = await this.userRepository.count({
        role: UserRole.DELIVERY_PARTNER,
        'deliveryPartnerInfo.isOnline': true,
      });

      return {
        totalUsers,
        activeUsers,
        verifiedUsers,
        usersByRole: {
          customers: customerCount,
          deliveryPartners: deliveryPartnerCount,
          admins: adminCount,
        },
        onlineDeliveryPartners,
        verificationRate: totalUsers > 0 ? (verifiedUsers / totalUsers) * 100 : 0,
        activationRate: totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0,
      };
    } catch (error) {
      logger.error('Get user stats failed:', error);
      throw error;
    }
  }
}