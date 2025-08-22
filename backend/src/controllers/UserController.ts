import { Request, Response, NextFunction } from "express";
import { UserService } from "../services/UserService";
import { sendSuccess, sendError } from "../utils/response";
import { asyncHandler } from "../utils/errorHandler";
import { UserRole } from "../types";
import { injectable, inject } from "tsyringe";
import { IUserService } from "../interfaces/IService/IUserService";

@injectable()
export class UserController {
  constructor(@inject("UserService") private userService: IUserService) {}

  getProfile = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const userId = req.user!.userId;
      const user = await this.userService.getUserProfile(userId);

      sendSuccess(res, "Profile retrieved successfully", { user });
    }
  );

  updateProfile = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const userId = req.user!.userId;
      const files = req.files as
        | Express.Multer.File[]
        | { [fieldname: string]: Express.Multer.File[] }
        | undefined;

      let profilePicture: string | undefined;

      if (Array.isArray(files)) {
        // Multer.array()
        const file = files[0] as Express.MulterS3.File;
        profilePicture = file?.location; // ✅ S3 URL
      } else if (files && "profileImage" in files) {
        // Multer.fields()
        const fileArr = files["profileImage"] as Express.MulterS3.File[];
        profilePicture = fileArr?.[0]?.location; // ✅ S3 URL
      }
      const updateData = {
        ...req.body,
        profilePicture,
      };

      const user = await this.userService.updateProfile(userId, updateData);

      sendSuccess(res, "Profile updated successfully", { user });
    }
  );

  getAllUsers = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const pagination = req.pagination!;
      const filters = {
        role: req.query.role as UserRole,
        isActive: req.query.isActive
          ? req.query.isActive === "true"
          : undefined,
        isVerified: req.query.isVerified
          ? req.query.isVerified === "true"
          : undefined,
        search: req.query.search as string,
      };

      const result = await this.userService.getAllUsers(pagination, filters);

      sendSuccess(res, "Users retrieved successfully", result);
    }
  );

  getUserById = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params;
      const user = await this.userService.getUserById(id);

      sendSuccess(res, "User retrieved successfully", { user });
    }
  );

  deactivateUser = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params;
      const user = await this.userService.deactivateUser(id);

      sendSuccess(res, "User deactivated successfully", { user });
    }
  );

  activateUser = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params;
      const user = await this.userService.activateUser(id);

      sendSuccess(res, "User activated successfully", { user });
    }
  );

  // Address Management
  addAddress = asyncHandler(
    
    async (req: Request, res: Response, next: NextFunction) => {
      console.log("Adding address for user:", req.body);
      
      const userId = req.user!.userId;
      const user = await this.userService.addAddress(userId, req.body);

      sendSuccess(res, "Address added successfully", { user });
    }
  );

  updateAddress = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const userId = req.user!.userId;
      const { id } = req.params;
      const user = await this.userService.updateAddress(
        userId,
        id,
        req.body
      );

      sendSuccess(res, "Address updated successfully", { user });
    }
  );

  removeAddress = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const userId = req.user!.userId;
      const { id } = req.params;
      const isDeleted = await this.userService.removeAddress(userId, id);

      sendSuccess(res, "Address removed successfully", { isDeleted });
    }
  );

  setDefaultAddress = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const userId = req.user!.userId;
      const { id } = req.params;
      const user = await this.userService.setDefaultAddress(userId, id);

      sendSuccess(res, "Default address set successfully", { user });
    }
  );

  getAddresses = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const userId = req.user!.userId;
      const addresses = await this.userService.getUserAddresses(userId);

      sendSuccess(res, "Addresses retrieved successfully", { addresses });
    }
  );

  getAddressById = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const userId = req.user!.userId;
      const { id } = req.params;
      const address = await this.userService.getUserAddressById(
        userId,
        id
      );

      sendSuccess(res, "Address retrieved successfully", { address });
    }
  );

  // Delivery Partner Management
  getDeliveryPartners = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const pagination = req.pagination!;
      const filters = {
        isOnline: req.query.isOnline
          ? req.query.isOnline === "true"
          : undefined,
        rating: req.query.rating
          ? parseFloat(req.query.rating as string)
          : undefined,
        documentsVerified: req.query.documentsVerified
          ? req.query.documentsVerified === "true"
          : undefined,
      };

      const result = await this.userService.getDeliveryPartners(
        pagination,
        filters
      );

      sendSuccess(res, "Delivery partners retrieved successfully", result);
    }
  );

  updateDeliveryPartnerInfo = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const userId = req.user!.userId;
      const user = await this.userService.updateDeliveryPartnerInfo(
        userId,
        req.body
      );

      sendSuccess(res, "Delivery partner info updated successfully", { user });
    }
  );

  updateOnlineStatus = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const userId = req.user!.userId;
      const { isOnline } = req.body;
      const user = await this.userService.updateDeliveryPartnerOnlineStatus(
        userId,
        isOnline
      );

      sendSuccess(res, "Online status updated successfully", { user });
    }
  );

  findNearbyDeliveryPartners = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { latitude, longitude, radius } = req.query;

      const deliveryPartners =
        await this.userService.findNearbyDeliveryPartners(
          parseFloat(latitude as string),
          parseFloat(longitude as string),
          radius ? parseFloat(radius as string) : 10
        );

      sendSuccess(res, "Nearby delivery partners found", { deliveryPartners });
    }
  );

  verifyDeliveryPartnerDocuments = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params;
      const user = await this.userService.verifyDeliveryPartnerDocuments(id);

      sendSuccess(res, "Documents verified successfully", { user });
    }
  );

  searchUsers = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { search } = req.query;
      const pagination = req.pagination!;

      if (!search) {
        return sendError(res, "Search term is required", 400);
      }

      const result = await this.userService.searchUsers(
        search as string,
        pagination
      );

      sendSuccess(res, "Users found", result);
    }
  );

  getUserStats = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const stats = await this.userService.getUserStats();

      sendSuccess(res, "User statistics retrieved successfully", { stats });
    }
  );
}
