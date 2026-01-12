import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { X, Save, Upload, AlertCircle, Truck } from "lucide-react";
import type {
  CreateVehicleInput,
  VehicleType,
} from "../../../../types/vehicle.types";
import { vehicleService } from "../../../../services/vehicle.service";

interface VehicleFormProps {
  vehicle?: VehicleType | null;
  onClose: () => void;
  onSubmit: () => void;
}

const VehicleForm: React.FC<VehicleFormProps> = ({
  vehicle,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<CreateVehicleInput>({
    name: "",
    description: "",
    maxWeight: 0,
    pricePerKm: 0,
    imageUrl: "", // ← we won't use this for sending anymore
  });

  const [file, setFile] = useState<File | null>(null);           // ← new!
  const [preview, setPreview] = useState<string | null>(null);   // nice to have
  const [isActive, setIsActive] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (vehicle) {
      setFormData({
        name: vehicle.name,
        description: vehicle.description,
        maxWeight: vehicle.maxWeight ?? 0,
        pricePerKm: vehicle.pricePerKm ?? 0,
        imageUrl: "", // we don't send this anymore
      });
      setPreview(vehicle.imageUrl || null);
      setIsActive(vehicle.isActive ?? true);
    }
  }, [vehicle]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "maxWeight" || name === "pricePerKm" ? parseFloat(value) || 0 : value,
    }));

    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Optional: size/type validation
    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error("File size should be less than 10MB");
      return;
    }

    setFile(selectedFile);

    // Show preview
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreview(objectUrl);

    // Cleanup
    return () => URL.revokeObjectURL(objectUrl);
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Vehicle name is required";
    if (!formData.description?.trim()) newErrors.description = "Description is required";

    if (formData.maxWeight <= 0) newErrors.maxWeight = "Max weight must be > 0";
    if (formData.pricePerKm <= 0) newErrors.pricePerKm = "Price per km must be > 0";

    // Optional: you can make image required for new vehicles
    // if (!vehicle && !file) newErrors.image = "Image is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const payload = new FormData();

      // Text fields
      payload.append("name", formData.name);
      payload.append("description", formData.description || "");
      payload.append("maxWeight", String(formData.maxWeight));
      payload.append("pricePerKm", String(formData.pricePerKm));

      if (vehicle) {
        payload.append("isActive", String(isActive));
      }

      // File (only if user selected new one)
      if (file) {
        payload.append("image", file); // ← backend should expect field name "image"
      }

      let response;

      if (vehicle) {
        // UPDATE - you might need to send vehicle id in url or as _id field
        response = await vehicleService.updateVehicle(vehicle._id, payload);
      } else {
        // CREATE
        response = await vehicleService.createVehicle(payload);
      }

      if (response.success) {
        toast.success(vehicle ? "Vehicle updated!" : "Vehicle created!");
        onSubmit();
        onClose(); // optional
      } else {
        toast.error(response.message || "Operation failed");
      }
    } catch (err) {
      console.error("Save vehicle error:", err);
      toast.error("Something went wrong while saving vehicle");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
      <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-700">
          {vehicle ? "Edit Vehicle" : "Add New Vehicle"}
        </h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-500 focus:outline-none"
          title="Close form"
        >
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Vehicle Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md shadow-sm py-2 px-3 border ${
                errors.name
                  ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                  : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              } sm:text-sm`}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle size={14} className="mr-1" />
                {errors.name}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Vehicle Image {vehicle ? "(optional - keep current)" : ""}
            </label>

            <div className="flex items-center space-x-4">
              <div className="h-20 w-20 bg-gray-100 rounded-md flex items-center justify-center overflow-hidden border">
                {preview ? (
                  <img src={preview} alt="Preview" className="h-full w-full object-cover" />
                ) : (
                  <Truck size={32} className="text-gray-400" />
                )}
              </div>

              <div className="flex-1">
                <label className="cursor-pointer inline-flex items-center bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">
                  <Upload size={16} className="mr-2" />
                  {file ? "Change Image" : "Select Image"}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  PNG, JPG, max 10MB
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2 md:col-span-2">
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700"
            >
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md shadow-sm py-2 px-3 border ${
                errors.description
                  ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                  : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              } sm:text-sm`}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle size={14} className="mr-1" />
                {errors.description}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="maxWeight"
              className="block text-sm font-medium text-gray-700"
            >
              Max Weight (kg) *
            </label>
            <input
              type="number"
              id="maxWeight"
              name="maxWeight"
              value={formData.maxWeight}
              onChange={handleChange}
              min="0"
              step="0.1"
              className={`mt-1 block w-full rounded-md shadow-sm py-2 px-3 border ${
                errors.maxWeight
                  ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                  : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              } sm:text-sm`}
            />
            {errors.maxWeight && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle size={14} className="mr-1" />
                {errors.maxWeight}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="pricePerKm"
              className="block text-sm font-medium text-gray-700"
            >
              Price per KM (₹) *
            </label>
            <input
              type="number"
              id="pricePerKm"
              name="pricePerKm"
              value={formData.pricePerKm}
              onChange={handleChange}
              min="0"
              step="0.5"
              className={`mt-1 block w-full rounded-md shadow-sm py-2 px-3 border ${
                errors.pricePerKm
                  ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                  : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              } sm:text-sm`}
            />
            {errors.pricePerKm && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle size={14} className="mr-1" />
                {errors.pricePerKm}
              </p>
            )}
          </div>

          {vehicle && (
            <div className="space-y-2">
              <span className="block text-sm font-medium text-gray-700">
                Status
              </span>
              <div className="flex items-center space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="status"
                    checked={isActive}
                    onChange={() => setIsActive(true)}
                    className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Active</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="status"
                    checked={!isActive}
                    onChange={() => setIsActive(false)}
                    className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Inactive</span>
                </label>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-900 hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processing...
              </>
            ) : (
              <>
                <Save size={18} className="mr-2" />
                {vehicle ? "Update Vehicle" : "Save Vehicle"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default VehicleForm;
