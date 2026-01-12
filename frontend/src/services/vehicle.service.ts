import type {
  CreateVehicleInput,
  UpdateVehicleInput,
  VehicleResponse,
  VehiclesResponse,
} from "../types/vehicle.types";
import api from "./api";

interface ImageUploadResponse {
  success: boolean;
  message?: string;
  imageUrl?: string;
}

export const vehicleService = {
  getVehicleById: async (id: string): Promise<VehicleResponse> => {
    try {
      const response = await api.get(`/admin/vehicles/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching vehicle:", error);
      return {
        success: false,
        message: "Failed to fetch vehicle",
      };
    }
  },

  uploadVehicleImage: async (
    formData: FormData
  ): Promise<ImageUploadResponse> => {
    try {
      const response = await api.post("/admin/vehicles/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error uploading image:", error);
      return {
        success: false,
        message: "Failed to upload image",
      };
    }
  },

  getVehicles: async (): Promise<VehiclesResponse> => {
    try {
      const response = await api.get("/admin/vehicles");
      return response.data;
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      return {
        success: false,
        message: "Failed to fetch vehicles",
        vehicles: [],
        total: 0,
      };
    }
  },

  createVehicle: async (data: FormData): Promise<VehicleResponse> => {
    try {
      const response = await api.post("/admin/vehicles", data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
        }}
      );
      return response.data;
    } catch (error) {
      console.error("Error creating vehicle:", error);
      return {
        success: false,
        message: "Failed to create vehicle",
      };
    }
  },

  updateVehicle: async (
    id: string,
    data: FormData
  ): Promise<VehicleResponse> => {
    try {
      const response = await api.put(`/admin/vehicles/${id}`, data);
      return response.data;
    } catch (error) {
      console.error("Error updating vehicle:", error);
      return {
        success: false,
        message: "Failed to update vehicle",
      };
    }
  },

  deleteVehicle: async (id: string): Promise<VehicleResponse> => {
    try {
      const response = await api.delete(`/admin/vehicles/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting vehicle:", error);
      return {
        success: false,
        message: "Failed to delete vehicle",
      };
    }
  },

  toggleVehicleStatus: async (id: string): Promise<VehicleResponse> => {
    try {
      const response = await api.patch(`/admin/vehicles/${id}/toggle-status`);
      return response.data;
    } catch (error) {
      console.error("Error toggling vehicle status:", error);
      return {
        success: false,
        message: "Failed to toggle vehicle status",
      };
    }
  },
};
