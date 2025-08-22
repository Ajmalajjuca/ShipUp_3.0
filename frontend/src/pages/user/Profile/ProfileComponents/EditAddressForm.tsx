// EditAddressForm.tsx - Updated to use reusable components
import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Home, Briefcase, MapPin } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import type { Address } from '../../../../types';
import { userService } from '../../../../services/user';
import { useGoogleMaps } from '../../../../hooks/useGoogleMaps';
import GoogleMapComponent from '../../../../components/user/common/GoogleMapComponent';

const EditAddressForm: React.FC = () => {
  const navigate = useNavigate();
  const { addressId } = useParams<{ addressId: string }>();
  console.log("addressId", addressId);
  

  
  const [formData, setFormData] = useState<Address>({
    type: 'home',
    street: '',
    isDefault: false,
    latitude: undefined,
    longitude: undefined,
    streetNumber: '',
    buildingNumber: '',
    floorNumber: '',
    contactName: '',
    contactPhone: ''
  });
  
  const [errors, setErrors] = useState<Partial<Address>>({});
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const [addressFromMap, setAddressFromMap] = useState<string>('');

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
      setFormData((prev) => {
        if (!prev.street.trim() && address) {
          return {
            ...prev,
            street: address,
            latitude: lat,
            longitude: lng,
          };
        }
        return prev;
      });
    },
    []
  );

  // Google Maps integration
  const {
    mapRef,
    isLoaded,
    error: mapError,
    getCurrentLocation,
    clearMap,
    setMapLocation,
  } = useGoogleMaps({
    onLocationSelect: handleLocationSelect,
  });

  useEffect(() => {
    const fetchAddress = async () => {
      if (!addressId) return;
      
      try {
      setInitialLoading(true);
      const response = await userService.getAddress(addressId);
      console.log("response", response.data);
        
        if (response.success && response.data) {
          const address = response.data.address;
          
          setFormData({
            type: address.type,
            street: address.street,
            isDefault: address.isDefault,
            latitude: address.latitude,
            longitude: address.longitude,
            streetNumber: address.streetNumber || '',
            buildingNumber: address.buildingNumber || '',
            floorNumber: address.floorNumber || '',
            contactName: address.contactName || '',
            contactPhone: address.contactPhone || ''
          });
          
          setAddressFromMap(address.street);
          
          // Set map location if coordinates exist
          if (address.latitude && address.longitude) {
            setTimeout(() => {
              setMapLocation(address.latitude!, address.longitude!);
            }, 1000); // Wait for map to load
          }
        } else {
          toast.error('Failed to load address details');
          navigate('/address');
        }
      } catch (error) {
        console.error('Error fetching address:', error);
        toast.error('Failed to load address details');
        navigate('/address');
      } finally {
        setInitialLoading(false);
      }
    };
    
    fetchAddress();
  }, [addressId, navigate, setMapLocation]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error when field is being edited
    if (errors[name as keyof Address]) {
      setErrors({ ...errors, [name]: undefined });
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData({ ...formData, [name]: checked });
  };

  const handleTypeSelect = (type: 'home' | 'work' | 'other') => {
    setFormData({ ...formData, type });
  };

  const handleGetCurrentLocation = () => {
    if (isLoaded) {
      getCurrentLocation();
    } else {
      toast.error("Map is still loading. Please wait a moment.");
    }
  };

  const handleClearMap = () => {
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
      newErrors.street = 'Address is required';
    }

    if (!formData.contactName?.trim()) {
      newErrors.contactName = 'Contact person name is required';
    }

    if (!formData.contactPhone?.trim()) {
      newErrors.contactPhone = 'Contact phone number is required';
    } else if (!/^[6-9]\d{9}$/.test(formData.contactPhone)) {
      newErrors.contactPhone = 'Please enter a valid 10-digit Indian phone number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate() || !addressId) {
      return;
    }
    
    try {
      setLoading(true);
      const response = await userService.updateAddress(addressId, {
        ...formData,
        latitude: formData.latitude || undefined,
        longitude: formData.longitude || undefined,
        streetNumber: formData.streetNumber || undefined,
        buildingNumber: formData.buildingNumber || undefined, 
        floorNumber: formData.floorNumber || undefined,
        contactName: formData.contactName || undefined,
        contactPhone: formData.contactPhone || undefined
      });
      
      console.log('Address updated:', response);
      
      toast.success('Address updated successfully!');
      navigate('/address');
    } catch (error) {
      toast.error('Failed to update address. Please try again.');
      console.error('Error updating address:', error);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
        <div className="w-full ">
          <div className="bg-white rounded-xl shadow-md p-6 flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
          </div>
        </div>
    );
  }

  return (
      <div className="w-full">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center mb-6">
            <button
              onClick={() => navigate('/address')}
              className="p-2 mr-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Go back"
              title="Go back to address book"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-semibold">Edit Address</h1>
          </div>
          
          <form onSubmit={handleSubmit}>
            {/* Address Type Selection */}
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-medium mb-3">
                Select Address Type
              </label>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  className={`flex items-center px-4 py-3 rounded-lg border ${
                    formData.type === 'home'
                      ? 'border-red-500 bg-red-50 text-red-500'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleTypeSelect('home')}
                >
                  <Home size={18} className="mr-2" />
                  <span>Home</span>
                </button>
                
                <button
                  type="button"
                  className={`flex items-center px-4 py-3 rounded-lg border ${
                    formData.type === 'work'
                      ? 'border-red-500 bg-red-50 text-red-500'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleTypeSelect('work')}
                >
                  <Briefcase size={18} className="mr-2" />
                  <span>Work</span>
                </button>
                
                <button
                  type="button"
                  className={`flex items-center px-4 py-3 rounded-lg border ${
                    formData.type === 'other'
                      ? 'border-red-500 bg-red-50 text-red-500'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleTypeSelect('other')}
                >
                  <MapPin size={18} className="mr-2" />
                  <span>Other</span>
                </button>
              </div>
            </div>
            
            {/* Contact Person Info */}
            <div className="mb-6">
              <h2 className="text-base font-semibold mb-4 text-gray-700">Contact Person Info</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="contactName" className="block text-gray-700 text-sm font-medium mb-2">
                    Contact Person Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
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
                      className={`w-full pl-12 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
                        errors.contactName ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter contact person name"
                      required
                    />
                  </div>
                  {errors.contactName && (
                    <p className="mt-1 text-sm text-red-500">{errors.contactName}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="contactPhone" className="block text-gray-700 text-sm font-medium mb-2">
                    Contact Phone Number
                  </label>
                  <div className="flex">
                    <div className="w-20 mr-2">
                      <div className="flex items-center border rounded-lg px-3 py-2 bg-gray-50">
                        <img src="https://purecatamphetamine.github.io/country-flag-icons/3x2/IN.svg" className="w-5 h-3 mr-1" alt="India flag" />
                        <span className="text-gray-700">+91</span>
                      </div>
                    </div>
                    <input
                      type="tel"
                      id="contactPhone"
                      name="contactPhone"
                      value={formData.contactPhone}
                      onChange={handleChange}
                      className={`flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
                        errors.contactPhone ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter phone number"
                      maxLength={10}
                      required
                    />
                  </div>
                  {errors.contactPhone && (
                    <p className="mt-1 text-sm text-red-500">{errors.contactPhone}</p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Delivery Address Section */}
            <div className="mb-6">
              <h2 className="text-base font-semibold mb-4 text-gray-700">Delivery Address</h2>
              
              {/* Street Address */}
              <div className="mb-4">
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
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
                      errors.street ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter your complete address"
                  />
                </div>
                {errors.street && (
                  <p className="mt-1 text-sm text-red-500">{errors.street}</p>
                )}
              </div>
              
              {/* Street Number */}
              <div className="mb-4">
                <label htmlFor="streetNumber" className="block text-gray-700 text-sm font-medium mb-2">
                  Street Number
                </label>
                <input
                  type="text"
                  id="streetNumber"
                  name="streetNumber"
                  value={formData.streetNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 border-gray-300"
                  placeholder="Enter street number"
                />
              </div>
              
              {/* Building Details */}
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Building/Floor Number
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    id="buildingNumber"
                    name="buildingNumber"
                    value={formData.buildingNumber}
                    onChange={handleChange}
                    className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 border-gray-300"
                    placeholder="House no."
                  />
                  <input
                    type="text"
                    id="floorNumber"
                    name="floorNumber"
                    value={formData.floorNumber}
                    onChange={handleChange}
                    className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 border-gray-300"
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
              onGetCurrentLocation={handleGetCurrentLocation}
              onClearMap={handleClearMap}
            />
            
            {/* Set as default checkbox */}
            <div className="mb-6">
              <label className="flex items-center">
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
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Updating...
                  </div>
                ) : 'Update Address'}
              </button>
            </div>
          </form>
        </div>
      </div>
  );
};

export default EditAddressForm;