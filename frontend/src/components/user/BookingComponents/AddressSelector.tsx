import React, { useState, useEffect } from 'react';
import { MapPin, Plus, ArrowDownUp, Navigation, Home, Building, MapPinOff, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import type { RootState } from '../../../store';
import { userService } from '../../../services/user';
import type { Address } from '../../../types';
import { useGoogleMaps } from '../../../hooks/useGoogleMaps';
import GoogleMapComponent from '../common/GoogleMapComponent';

interface AddressSelectorProps {
  pickupAddress: {
    addressId: string;
    street: string;
    latitude?: number;
    longitude?: number;
  } | null;
  
  dropoffAddress: {
    addressId: string;
    street: string;
    latitude?: number;
    longitude?: number;
  } | null;
  
  onPickupSelected: (address: { addressId: string; street: string; latitude?: number; longitude?: number; } | null) => void;
  onDropoffSelected: (address: { addressId: string; street: string; latitude?: number; longitude?: number; } | null) => void;
}

const AddressSelector: React.FC<AddressSelectorProps> = ({
  pickupAddress,
  dropoffAddress,
  onPickupSelected,
  onDropoffSelected
}) => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useSelector((state: RootState) => state.auth.user);
  const userId = user?.id;
  const navigate = useNavigate();
  
  // State for custom address creation
  const [showMapForPickup, setShowMapForPickup] = useState(false);
  const [showMapForDropoff, setShowMapForDropoff] = useState(false);
  const [pickupExpanded, setPickupExpanded] = useState(true);
  const [dropoffExpanded, setDropoffExpanded] = useState(true);
  
  // State for storing selected addresses from map
  const [pickupAddressFromMap, setPickupAddressFromMap] = useState('');
  const [dropoffAddressFromMap, setDropoffAddressFromMap] = useState('');
  const [pickupCoords, setPickupCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [dropoffCoords, setDropoffCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Google Maps integration for pickup
  const pickupMapHook = useGoogleMaps({
    onLocationSelect: (lat: number, lng: number, address: string) => {
      setPickupAddressFromMap(address);
      setPickupCoords({ lat, lng });
      onPickupSelected({
        addressId: `temp-pickup-${Date.now()}`,
        street: address,
        latitude: lat,
        longitude: lng
      });
    },
    initialCenter: { lat: 12.9716, lng: 77.5946 },
    initialZoom: 15,
  });

  // Google Maps integration for dropoff
  const dropoffMapHook = useGoogleMaps({
    onLocationSelect: (lat: number, lng: number, address: string) => {
      setDropoffAddressFromMap(address);
      setDropoffCoords({ lat, lng });
      onDropoffSelected({
        addressId: `temp-dropoff-${Date.now()}`,
        street: address,
        latitude: lat,
        longitude: lng
      });
    },
    initialCenter: { lat: 12.9716, lng: 77.5946 },
    initialZoom: 15,
  });

  // Sync with existing addresses when switching between map and saved addresses
  useEffect(() => {
    if (pickupAddress && pickupAddress.addressId.startsWith('temp-pickup-')) {
      setPickupAddressFromMap(pickupAddress.street);
      if (pickupAddress.latitude && pickupAddress.longitude) {
        setPickupCoords({ lat: pickupAddress.latitude, lng: pickupAddress.longitude });
      }
    } else if (!pickupAddress) {
      setPickupAddressFromMap('');
      setPickupCoords(null);
    }
  }, [pickupAddress]);

  useEffect(() => {
    if (dropoffAddress && dropoffAddress.addressId.startsWith('temp-dropoff-')) {
      setDropoffAddressFromMap(dropoffAddress.street);
      if (dropoffAddress.latitude && dropoffAddress.longitude) {
        setDropoffCoords({ lat: dropoffAddress.latitude, lng: dropoffAddress.longitude });
      }
    } else if (!dropoffAddress) {
      setDropoffAddressFromMap('');
      setDropoffCoords(null);
    }
  }, [dropoffAddress]);

  // Set map location when switching to map view with existing coordinates
  useEffect(() => {
    if (showMapForPickup && pickupCoords && pickupMapHook.isLoaded) {
      pickupMapHook.setMapLocation(pickupCoords.lat, pickupCoords.lng);
    }
  }, [showMapForPickup, pickupCoords, pickupMapHook.isLoaded]);

  useEffect(() => {
    if (showMapForDropoff && dropoffCoords && dropoffMapHook.isLoaded) {
      dropoffMapHook.setMapLocation(dropoffCoords.lat, dropoffCoords.lng);
    }
  }, [showMapForDropoff, dropoffCoords, dropoffMapHook.isLoaded]);

  // Fetch user addresses
  useEffect(() => {
    const fetchAddresses = async () => {
      if (!userId) return;
      
      try {
        setLoading(true);
        const response = await userService.getAddresses();
        
        if (response.success && response.data) {
          setAddresses(response.data.addresses);
        }
      } catch (error) {
        console.error('Error fetching addresses:', error);
        toast.error('Failed to load addresses');
      } finally {
        setLoading(false);
      }
    };

    fetchAddresses();
  }, [userId]);
  
  // Swap pickup and dropoff
  const swapAddresses = () => {
    const temp = pickupAddress;
    onPickupSelected(dropoffAddress);
    onDropoffSelected(temp);
    
    const tempPickupAddress = pickupAddressFromMap;
    const tempPickupCoords = pickupCoords;
    
    setPickupAddressFromMap(dropoffAddressFromMap);
    setPickupCoords(dropoffCoords);
    setDropoffAddressFromMap(tempPickupAddress);
    setDropoffCoords(tempPickupCoords);
  };
  
  const handleAddAddress = () => {
    navigate('/address/add');
  };

  const handleClearPickupMap = () => {
    pickupMapHook.clearMap();
    setPickupAddressFromMap('');
    setPickupCoords(null);
    onPickupSelected(null);
  };

  const handleClearDropoffMap = () => {
    dropoffMapHook.clearMap();
    setDropoffAddressFromMap('');
    setDropoffCoords(null);
    onDropoffSelected(null);
  };

  const handlePickupCurrentLocation = () => {
    if (!pickupMapHook.isLoaded) {
      toast.error('Map is still loading. Please wait...');
      return;
    }
    pickupMapHook.getCurrentLocation();
  };

  const handleDropoffCurrentLocation = () => {
    if (!dropoffMapHook.isLoaded) {
      toast.error('Map is still loading. Please wait...');
      return;
    }
    dropoffMapHook.getCurrentLocation();
  };

  const getAddressIcon = (type: string) => {
    switch (type) {
      case 'home':
        return <Home size={16} />;
      case 'work':
        return <Building size={16} />;
      default:
        return <MapPin size={16} />;
    }
  };

  const getAddressColor = (type: string) => {
    switch (type) {
      case 'home':
        return 'bg-blue-100 text-blue-600 border-blue-200';
      case 'work':
        return 'bg-purple-100 text-purple-600 border-purple-200';
      default:
        return 'bg-green-100 text-green-600 border-green-200';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200"></div>
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-500 border-t-transparent absolute top-0 left-0"></div>
          </div>
          <p className="text-gray-600 mt-4 font-medium">Loading your addresses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-50 to-blue-50 px-6 py-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Select Addresses</h2>
            <p className="text-gray-600 mt-1">Choose pickup and dropoff locations for your trip</p>
          </div>
          {addresses.length > 0 && (
            <button
              onClick={handleAddAddress}
              className="bg-white text-red-600 border border-red-200 px-4 py-2 rounded-xl hover:bg-red-50 transition-all duration-200 flex items-center font-medium"
            >
              <Plus size={16} className="mr-2" />
              Add Address
            </button>
          )}
        </div>
      </div>

      <div className="p-6">
        {addresses.length === 0 && !showMapForPickup && !showMapForDropoff ? (
          <div className="text-center py-16">
            <div className="bg-gray-50 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
              <MapPinOff size={40} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No saved addresses</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Get started by adding your frequently used addresses or select locations directly on the map
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleAddAddress}
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl flex items-center justify-center font-medium transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <Plus size={18} className="mr-2" />
                Add New Address
              </button>
              <button
                onClick={() => {
                  setShowMapForPickup(true);
                  setShowMapForDropoff(true);
                }}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl flex items-center justify-center font-medium transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <MapPin size={18} className="mr-2" />
                Use Map Location
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Pickup Address Section */}
            <div className="space-y-4">
              <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setPickupExpanded(!pickupExpanded)}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                  <h3 className="text-lg font-semibold text-gray-900">Pickup Location</h3>
                  {pickupAddress && (
                    <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium flex items-center">
                      <Check size={12} className="mr-1" />
                      Selected
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  {!showMapForPickup ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMapForPickup(true);
                      }}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-all duration-200"
                    >
                      <MapPin size={14} className="mr-1" />
                      Use Map
                    </button>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMapForPickup(false);
                      }}
                      className="text-gray-600 hover:text-gray-700 text-sm font-medium flex items-center px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-all duration-200"
                    >
                      <MapPinOff size={14} className="mr-1" />
                      Use Saved
                    </button>
                  )}
                  {pickupExpanded ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
                </div>
              </div>
              
              <div className={`transition-all duration-300 overflow-hidden ${pickupExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                {showMapForPickup ? (
                  <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl border-2 border-red-100 overflow-hidden">
                    <div className="p-4 bg-red-500 text-white flex items-center justify-between">
                      <div className="flex items-center">
                        <MapPin size={20} className="mr-2" />
                        <span className="font-medium">Select Pickup Location</span>
                      </div>
                      <button
                        onClick={handlePickupCurrentLocation}
                        disabled={!pickupMapHook.isLoaded}
                        className="bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50"
                      >
                        <Navigation size={14} className="mr-1 inline" />
                        Current Location
                      </button>
                    </div>
                    <GoogleMapComponent
                      mapRef={pickupMapHook.mapRef}
                      isLoaded={pickupMapHook.isLoaded}
                      error={pickupMapHook.error}
                      addressFromMap={pickupAddressFromMap}
                      latitude={pickupCoords?.lat}
                      longitude={pickupCoords?.lng}
                      onGetCurrentLocation={pickupMapHook.getCurrentLocation}
                      onClearMap={handleClearPickupMap}
                      height="h-80"
                      showControls={false}
                      showCoordinates={true}
                    />
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {addresses.map(address => (
                      <div 
                        key={`pickup-${address._id}`}
                        onClick={() => onPickupSelected({
                          addressId: address._id || '',
                          street: address.street,
                          latitude: address.latitude,
                          longitude: address.longitude
                        })}
                        className={`group p-4 rounded-xl cursor-pointer transition-all duration-200 border-2 ${
                          pickupAddress?.addressId === address._id
                            ? 'bg-red-50 border-red-200 shadow-md'
                            : 'bg-white border-gray-100 hover:border-red-200 hover:shadow-sm'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-lg border ${getAddressColor(address.type)}`}>
                              {getAddressIcon(address.type)}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 capitalize">{address.type}</p>
                              <p className="text-gray-600 text-sm line-clamp-1">{address.street}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {address.isDefault && (
                              <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                                Default
                              </span>
                            )}
                            {pickupAddress?.addressId === address._id && (
                              <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                                <Check size={14} className="text-white" />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Swap Button */}
            <div className="flex justify-center">
              <button
                onClick={swapAddresses}
                className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-all duration-200 hover:shadow-md group"
                title="Swap pickup and dropoff locations"
              >
                <ArrowDownUp size={20} className="text-gray-600 group-hover:rotate-180 transition-transform duration-300" />
              </button>
            </div>

            {/* Dropoff Address Section */}
            <div className="space-y-4">
              <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setDropoffExpanded(!dropoffExpanded)}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                  <h3 className="text-lg font-semibold text-gray-900">Dropoff Location</h3>
                  {dropoffAddress && (
                    <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium flex items-center">
                      <Check size={12} className="mr-1" />
                      Selected
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  {!showMapForDropoff ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMapForDropoff(true);
                      }}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-all duration-200"
                    >
                      <MapPin size={14} className="mr-1" />
                      Use Map
                    </button>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMapForDropoff(false);
                      }}
                      className="text-gray-600 hover:text-gray-700 text-sm font-medium flex items-center px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-all duration-200"
                    >
                      <MapPinOff size={14} className="mr-1" />
                      Use Saved
                    </button>
                  )}
                  {dropoffExpanded ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
                </div>
              </div>
              
              <div className={`transition-all duration-300 overflow-hidden ${dropoffExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                {showMapForDropoff ? (
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-100 overflow-hidden">
                    <div className="p-4 bg-blue-500 text-white flex items-center justify-between">
                      <div className="flex items-center">
                        <MapPin size={20} className="mr-2" />
                        <span className="font-medium">Select Dropoff Location</span>
                      </div>
                      <button
                        onClick={handleDropoffCurrentLocation}
                        disabled={!dropoffMapHook.isLoaded}
                        className="bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50"
                      >
                        <Navigation size={14} className="mr-1 inline" />
                        Current Location
                      </button>
                    </div>
                    <GoogleMapComponent
                      mapRef={dropoffMapHook.mapRef}
                      isLoaded={dropoffMapHook.isLoaded}
                      error={dropoffMapHook.error}
                      addressFromMap={dropoffAddressFromMap}
                      latitude={dropoffCoords?.lat}
                      longitude={dropoffCoords?.lng}
                      onGetCurrentLocation={dropoffMapHook.getCurrentLocation}
                      onClearMap={handleClearDropoffMap}
                      height="h-80"
                      showControls={false}
                      showCoordinates={true}
                    />
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {addresses.map(address => (
                      <div 
                        key={`dropoff-${address._id}`}
                        onClick={() => onDropoffSelected({
                          addressId: address._id || '',
                          street: address.street,
                          latitude: address.latitude,
                          longitude: address.longitude
                        })}
                        className={`group p-4 rounded-xl cursor-pointer transition-all duration-200 border-2 ${
                          dropoffAddress?.addressId === address._id
                            ? 'bg-blue-50 border-blue-200 shadow-md'
                            : 'bg-white border-gray-100 hover:border-blue-200 hover:shadow-sm'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-lg border ${getAddressColor(address.type)}`}>
                              {getAddressIcon(address.type)}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 capitalize">{address.type}</p>
                              <p className="text-gray-600 text-sm line-clamp-1">{address.street}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {address.isDefault && (
                              <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                                Default
                              </span>
                            )}
                            {dropoffAddress?.addressId === address._id && (
                              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                <Check size={14} className="text-white" />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddressSelector;