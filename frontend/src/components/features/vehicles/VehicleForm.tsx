import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { X, Save, Upload, Truck } from "lucide-react";
import type {
  CreateVehicleInput,
  VehicleType,
} from "../../..//types/vehicle.types";
import { vehicleService } from "../../..//services/vehicle.service";
import Button from "../../../components/common/Button/Button";
import Input from "../../../components/common/Input/Input";

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
    imageUrl: "", // we won't use this for sending anymore
  });

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (vehicle) {
      setFormData({
        name: vehicle.name,
        description: vehicle.description,
        maxWeight: Number(vehicle.maxWeight ?? 0),
        pricePerKm: vehicle.pricePerKm ?? 0,
        imageUrl: "",
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

    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error("File size should be less than 10MB");
      return;
    }

    setFile(selectedFile);
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Vehicle name is required";
    if (!formData.description?.trim()) newErrors.description = "Description is required";

    if (formData.maxWeight <= 0) newErrors.maxWeight = "Max weight must be > 0";
    if (formData.pricePerKm <= 0) newErrors.pricePerKm = "Price per km must be > 0";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const payload = new FormData();

      payload.append("name", formData.name);
      payload.append("description", formData.description || "");
      payload.append("maxWeight", String(formData.maxWeight));
      payload.append("pricePerKm", String(formData.pricePerKm));

      if (vehicle) {
        payload.append("isActive", String(isActive));
      }

      if (file) {
        payload.append("image", file);
      }

      let response;

      if (vehicle) {
        response = await vehicleService.updateVehicle(vehicle._id!, payload);
      } else {
        response = await vehicleService.createVehicle(payload);
      }

      if (response.success) {
        toast.success(vehicle ? "Vehicle updated!" : "Vehicle created!");
        onSubmit();
        onClose();
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
          <Input
            label="Vehicle Name *"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            fullWidth
          />

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
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              className={`block w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 transition-all duration-200 ${
                errors.description
                  ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                  : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              }`}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                {errors.description}
              </p>
            )}
          </div>

          <Input
            label="Max Weight (kg) *"
            type="number"
            id="maxWeight"
            name="maxWeight"
            value={formData.maxWeight}
            onChange={handleChange}
            min="0"
            step="0.1"
            error={errors.maxWeight}
            fullWidth
          />

          <Input
             label="Price per KM (₹) *"
             type="number"
             id="pricePerKm"
             name="pricePerKm"
             value={formData.pricePerKm}
             onChange={handleChange}
             min="0"
             step="0.5"
             error={errors.pricePerKm}
             fullWidth
          />

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
            <Button variant="secondary" onClick={onClose} type="button">
                Cancel
            </Button>
            <Button
                variant="primary"
                type="submit"
                isLoading={isSubmitting}
                leftIcon={<Save size={18} />}
            >
                {vehicle ? "Update Vehicle" : "Save Vehicle"}
            </Button>
        </div>
      </form>
    </div>
  );
};

export default VehicleForm;
