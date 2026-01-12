import { IUserService } from "../interfaces/IService/IUserService";
import { IAuthService } from "../interfaces/IService/IAuthService";
import { asyncHandler } from "../utils/errorHandler";
import { sendSuccess } from "../utils/response";
import { Request, Response, NextFunction } from "express";
import { inject, injectable } from "tsyringe";
import { IPartnerService } from "../interfaces/IService/IPartnerService";

@injectable()
export class AdminController {
  constructor(
    @inject("AuthService") private authService: IAuthService,
    @inject("UserService") private userService: IUserService,
    @inject("PartnerService") private partnerService: IPartnerService
  ) {}
  adminLogin = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { email, password } = req.body;
      const { user, accessToken, refreshToken } =
        await this.authService.adminLogin(email, password);

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "lax" : "lax",
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });

      sendSuccess(res, "Admin login successful", {
        user,
        accessToken,
        refreshToken,
      });
    }
  );

  getAllUsers = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const filter: any = {};
      if (req.query.role) filter.role = req.query.role;

      const users = await this.userService.getAllUsers({ page, limit }, filter);
      sendSuccess(res, "Fetched all users", { users });
    }
  );

  getUserById = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const userId = req.params.id;
      const user = await this.userService.getUserById(userId);
      sendSuccess(res, "Fetched user details", { user });
    }
  );

  updateUserStatus = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const userId = req.params.id;
      const updateData = req.body;
      const updatedUser = await this.userService.updateUserStatus(
        userId,
        updateData
      );
      sendSuccess(res, "User updated successfully", { user: updatedUser });
    }
  );

  getAllPartners = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const filter: any = {};
      if (req.query.isOnline !== undefined) {
        filter["deliveryPartnerInfo.isOnline"] = req.query.isOnline === "true";
      }

      const partners = await this.partnerService.getAllPartners(
        { page, limit },
        filter
      );
      sendSuccess(res, "Fetched all delivery partners", { partners });
    }
  );

  getAllPartnersRequest = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const filter: any = {};

      const partners = await this.partnerService.getAllPartners(
        { page, limit },
        filter
      );
      sendSuccess(res, "Fetched all delivery partner requests", { partners });
    }
  );

  getDetailedVerificationStatus = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const partnerId = req.params.id;
      const status = await this.partnerService.getDetailedVerificationStatus(
        partnerId
      );
      sendSuccess(res, "Fetched detailed verification status", { status });
    }
  );

  updatePartnerDocumentStatus = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const partnerId = req.params.id;
      const { documentType, status, rejectionReason } = req.body;
      await this.partnerService.updateDocumentStatus(
        partnerId,
        documentType,
        status,
        rejectionReason
      );
      sendSuccess(res, "Partner document status updated successfully");
    }
  );

  // getPendingVerifications = asyncHandler(
  //   async (req: Request, res: Response, next: NextFunction) => {
  //     const verifications = await this.partnerService.getPendingVerifications();
  //     sendSuccess(res, "Fetched pending verifications", { verifications });
  //   }
  // );

  getPartnerDetails = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const partnerId = req.params.id;
      const partner = await this.partnerService.getCurrentPartner(partnerId);
      sendSuccess(res, "Fetched partner details", { partner });
    }
  );
}
