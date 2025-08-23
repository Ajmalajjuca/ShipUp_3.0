// AddAddressForm.tsx - Updated with better error handling and UX
import React, { useState, useCallback } from "react";
import {
  ArrowLeft,
  Home,
  Briefcase,
  MapPin,
  AlertCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { userService } from "../../../../services/user";
import type { Address, ErrorResponse } from "../../../../types";
import { useGoogleMaps } from "../../../../hooks/useGoogleMaps";
import GoogleMapComponent from "../../../../components/user/common/GoogleMapComponent";

const AddAddressForm: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<Address>({
    type: "home",
    street: "",
    isDefault: false,
    latitude: undefined,
    longitude: undefined,
    streetNumber: "",
    buildingNumber: "",
    floorNumber: "",
    contactName: "",
    contactPhone: "",
  });

  const [errors, setErrors] = useState<Partial<Address>>({});
  const [loading, setLoading] = useState(false);
  const [addressFromMap, setAddressFromMap] = useState<string>("");

  // Memoize the location select callback to prevent unnecessary re-renders
  const handleLocationSelect = useCallback(
    (lat: number, lng: number, address: string) => {
      setFormData((prev) => ({
        ...prev,
        latitude: lat,
        longitude: lng,
      }));
      setAddressFromMap(address);

      // Auto-fill the street address if it's empty
      if (!formData.street.trim() && address) {
        setFormData((prev) => ({
          ...prev,
          street: address,
          latitude: lat,
          longitude: lng,
        }));
      }
    },
    [formData.street]
  );

  // Google Maps integration
  const {
    mapRef,
    isLoaded,
    error: mapError,
    isGettingLocation,
    getCurrentLocation,
    clearMap,
  } = useGoogleMaps({
    onLocationSelect: handleLocationSelect,
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when field is being edited
    if (errors[name as keyof Address]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleTypeSelect = (type: "home" | "work" | "other") => {
    setFormData((prev) => ({ ...prev, type }));
  };

  const handleGetCurrentLocation = () => {
    if (!isLoaded) {
      toast.error("Map is still loading. Please wait a moment.");
      return;
    }
    
    if (isGettingLocation) {
      toast.error("Already getting your location. Please wait.");
      return;
    }

    getCurrentLocation();
  };

  const handleClearMap = () => {
    if (!isLoaded) {
      toast.error("Map is still loading. Please wait a moment.");
      return;
    }

    clearMap();
    setAddressFromMap("");
    setFormData((prev) => ({
      ...prev,
      latitude: undefined,
      longitude: undefined,
    }));
    toast.success("Map cleared successfully");
  };

  const validate = (): boolean => {
    const newErrors: Partial<Address> = {};

    if (!formData.street.trim()) {
      newErrors.street = "Address is required";
    }

    if (!formData.contactName?.trim()) {
      newErrors.contactName = "Contact person name is required";
    }

    if (!formData.contactPhone?.trim()) {
      newErrors.contactPhone = "Contact phone number is required";
    } else if (!/^[6-9]\d{9}$/.test(formData.contactPhone)) {
      newErrors.contactPhone =
        "Please enter a valid 10-digit Indian phone number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!validate()) {
      const firstError = Object.values(errors)[0];
      if (firstError) {
        toast.error(firstError.toString());
      }
      return;
    }
  
    // Optional: Check if location is selected
    if (!formData.latitude || !formData.longitude) {
      const proceed = window.confirm(
        "No location pin selected on the map. Do you want to proceed without precise location coordinates?"
      );
      if (!proceed) {
        return;
      }
    }
  
    try {
      setLoading(true);
      const response = await userService.addAddress({
        ...formData,
        latitude: formData.latitude || undefined,
        longitude: formData.longitude || undefined,
        streetNumber: formData.streetNumber || undefined,
        buildingNumber: formData.buildingNumber || undefined,
        floorNumber: formData.floorNumber || undefined,
        contactName: formData.contactName || undefined,
        contactPhone: formData.contactPhone || undefined,
      });
  
      console.log("Address added:", response);
      toast.success("Address added successfully!");
      navigate("/address");
    } catch (error) {
      const errorMessage = (error as ErrorResponse)?.response?.data?.message || 
                          "Failed to add address. Please try again.";
      toast.error(errorMessage);
      console.error("Error adding address:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate("/address")}
            className="p-2 mr-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Go back"
            title="Go back to address book"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-semibold">Add New Address</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Address Type Selection */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-3">
              Select Address Type
            </label>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                className={`flex items-center px-4 py-3 rounded-lg border transition-all ${
                  formData.type === "home"
                    ? "border-red-500 bg-red-50 text-red-600 shadow-sm"
                    : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                }`}
                onClick={() => handleTypeSelect("home")}
              >
                <Home size={18} className="mr-2" />
                <span>Home</span>
              </button>

              <button
                type="button"
                className={`flex items-center px-4 py-3 rounded-lg border transition-all ${
                  formData.type === "work"
                    ? "border-red-500 bg-red-50 text-red-600 shadow-sm"
                    : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                }`}
                onClick={() => handleTypeSelect("work")}
              >
                <Briefcase size={18} className="mr-2" />
                <span>Work</span>
              </button>

              <button
                type="button"
                className={`flex items-center px-4 py-3 rounded-lg border transition-all ${
                  formData.type === "other"
                    ? "border-red-500 bg-red-50 text-red-600 shadow-sm"
                    : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                }`}
                onClick={() => handleTypeSelect("other")}
              >
                <MapPin size={18} className="mr-2" />
                <span>Other</span>
              </button>
            </div>
          </div>

          {/* Contact Person Info */}
          <div>
            <h2 className="text-base font-semibold mb-4 text-gray-700">
              Contact Person Info
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="contactName"
                  className="block text-gray-700 text-sm font-medium mb-2"
                >
                  Contact Person Name *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-gray-400"
                      >
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                    </div>
                  </div>
                  <input
                    type="text"
                    id="contactName"
                    name="contactName"
                    value={formData.contactName}
                    onChange={handleChange}
                    className={`w-full pl-12 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors ${
                      errors.contactName ? "border-red-500 bg-red-50" : "border-gray-300"
                    }`}
                    placeholder="Enter contact person name"
                    required
                  />
                </div>
                {errors.contactName && (
                  <p className="mt-1 text-sm text-red-500 flex items-center">
                    <AlertCircle size={14} className="mr-1" />
                    {errors.contactName}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="contactPhone"
                  className="block text-gray-700 text-sm font-medium mb-2"
                >
                  Contact Phone Number *
                </label>
                <div className="flex">
                  <div className="w-20 mr-2">
                    <div className="flex items-center border rounded-lg px-3 py-2 bg-gray-50 border-gray-300">
                      <img
                        src="https://purecatamphetamine.github.io/country-flag-icons/3x2/IN.svg"
                        className="w-5 h-3 mr-1"
                        alt="India flag"
                      />
                      <span className="text-gray-700 text-sm">+91</span>
                    </div>
                  </div>
                  <input
                    type="tel"
                    id="contactPhone"
                    name="contactPhone"
                    value={formData.contactPhone}
                    onChange={handleChange}
                    className={`flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors ${
                      errors.contactPhone ? "border-red-500 bg-red-50" : "border-gray-300"
                    }`}
                    placeholder="Enter phone number"
                    maxLength={10}
                    required
                  />
                </div>
                {errors.contactPhone && (
                  <p className="mt-1 text-sm text-red-500 flex items-center">
                    <AlertCircle size={14} className="mr-1" />
                    {errors.contactPhone}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Delivery Address Section */}
          <div>
            <h2 className="text-base font-semibold mb-4 text-gray-700">
              Delivery Address
            </h2>

            {/* Street Address */}
            <div className="mb-4">
              <label
                htmlFor="street"
                className="block text-gray-700 text-sm font-medium mb-2"
              >
                Complete Address *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin size={18} className="text-gray-400" />
                </div>
                <input
                  id="street"
                  name="street"
                  value={formData.street}
                  onChange={handleChange}
                  type="text"
                  required
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors ${
                    errors.street ? "border-red-500 bg-red-50" : "border-gray-300"
                  }`}
                  placeholder="Enter your complete address"
                />
              </div>
              {errors.street && (
                <p className="mt-1 text-sm text-red-500 flex items-center">
                  <AlertCircle size={14} className="mr-1" />
                  {errors.street}
                </p>
              )}
            </div>

            {/* Additional Address Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label
                  htmlFor="streetNumber"
                  className="block text-gray-700 text-sm font-medium mb-2"
                >
                  Street Number
                </label>
                <input
                  type="text"
                  id="streetNumber"
                  name="streetNumber"
                  value={formData.streetNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 border-gray-300"
                  placeholder="Street number"
                />
              </div>
              
              <div>
                <label
                  htmlFor="buildingNumber"
                  className="block text-gray-700 text-sm font-medium mb-2"
                >
                  House Number
                </label>
                <input
                  type="text"
                  id="buildingNumber"
                  name="buildingNumber"
                  value={formData.buildingNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 border-gray-300"
                  placeholder="House no."
                />
              </div>
              
              <div>
                <label
                  htmlFor="floorNumber"
                  className="block text-gray-700 text-sm font-medium mb-2"
                >
                  Floor Number
                </label>
                <input
                  type="text"
                  id="floorNumber"
                  name="floorNumber"
                  value={formData.floorNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 border-gray-300"
                  placeholder="Floor no."
                />
              </div>
            </div>
          </div>

          {/* Google Map Component */}
          <GoogleMapComponent
            mapRef={mapRef}
            isLoaded={isLoaded}
            error={mapError}
            addressFromMap={addressFromMap}
            latitude={formData.latitude}
            longitude={formData.longitude}
            isGettingLocation={isGettingLocation}
            onGetCurrentLocation={handleGetCurrentLocation}
            onClearMap={handleClearMap}
            height="h-80"
          />

          {/* Set as default checkbox */}
          <div>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="isDefault"
                checked={formData.isDefault}
                onChange={handleCheckboxChange}
                className="h-5 w-5 text-red-500 border-gray-300 rounded focus:ring-red-500"
              />
              <span className="ml-2 text-gray-700">Set as default address</span>
            </label>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed shadow-sm"
            >
              {loading ? (
                <div className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
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
                  Saving...
                </div>
              ) : (
                "Save Address"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAddressForm;