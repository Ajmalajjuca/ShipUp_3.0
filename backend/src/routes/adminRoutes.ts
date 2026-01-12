import { Router } from "express";
import { validate, validateParams } from "../middleware/validation";
import { authLimiter } from "../middleware/rateLimit";
import { container } from "../container/container";

import { loginSchema } from "../validators/auth";
import { UserRole } from "../types";
import { authenticate, authorize } from "../middleware/auth";

import { AdminController } from "../controllers/AdminController";
import { VehiclesController } from "../controllers/VehicleController";
import { singleUpload } from "../middleware/upload";
import { addVehicleSchema } from "../validators/vehicle";
import { idParamSchema } from "../validators/params";

const router = Router();
const adminController = container.resolve(AdminController);
const vehicleController = container.resolve(VehiclesController);

// Public routes
router.post(
  "/login",
  authLimiter,
  validate(loginSchema),
  adminController.adminLogin
);

// // Protected routes
router.use(authenticate);
router.use(authorize([UserRole.ADMIN]));

router.get("/users", adminController.getAllUsers);
router.get("/users/:id", adminController.getUserById);
router.put("/users/:id", adminController.updateUserStatus);

router.get("/partners", adminController.getAllPartners);
router.get("/partners/requests", adminController.getAllPartnersRequest);
router.get("/partners/:id", adminController.getPartnerDetails);

router.get("/vehicles/:id",validateParams(idParamSchema), vehicleController.getVehicleById);
router.get("/vehicles", vehicleController.getVehicles);
router.post("/vehicles", validate(addVehicleSchema),singleUpload, vehicleController.createVehicle);
router.put("/vehicles/:id",validateParams(idParamSchema), vehicleController.updateVehicle);
router.delete("/vehicles/:id",validateParams(idParamSchema), vehicleController.deleteVehicle);
router.patch("/vehicles/:id/toggle-status",validateParams(idParamSchema), vehicleController.toggleVehicleStatus);
 
export default router;
