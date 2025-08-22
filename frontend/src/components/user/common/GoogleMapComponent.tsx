import React from 'react';
import { Navigation, Pencil, MapPinOff } from 'lucide-react';

interface GoogleMapComponentProps {
  mapRef: React.RefObject<HTMLDivElement>;
  isLoaded: boolean;
  error: string;
  addressFromMap: string;
  latitude?: number;
  longitude?: number;
  onGetCurrentLocation: () => void;
  onClearMap: () => void;
  height?: string;
  showControls?: boolean;
  showCoordinates?: boolean;
}

const GoogleMapComponent: React.FC<GoogleMapComponentProps> = ({
  mapRef,
  isLoaded,
  error,
  addressFromMap,
  latitude,
  longitude,
  onGetCurrentLocation,
  onClearMap,
  height = "h-64",
  showControls = true,
  showCoordinates = true,
}) => {
  return (
    <div className="mb-6">
      {showControls && (
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-base font-semibold text-gray-700">Map Location</h2>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={onGetCurrentLocation}
              disabled={!isLoaded}
              className="flex items-center px-3 py-1.5 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              title="Use your current location"
            >
              <Navigation size={16} className="mr-1" />
              <span className="text-sm">Current Location</span>
            </button>
            <button
              type="button"
              onClick={onClearMap}
              disabled={!isLoaded}
              className="flex items-center px-3 py-1.5 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              title="Clear all markers and drawings"
            >
              <MapPinOff size={16} className="mr-1" />
              <span className="text-sm">Clear</span>
            </button>
          </div>
        </div>
      )}
      
      <div className="relative border border-gray-200 rounded-lg overflow-hidden">
        {/* Map container is always mounted */}
        <div ref={mapRef} className={`${height} w-full`} />

        {/* Loading state */}
        {!isLoaded && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
              <div className="text-gray-500">Loading map...</div>
            </div>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-50">
            <div className="text-center text-red-600">
              <MapPinOff size={32} className="mx-auto mb-2" />
              <div className="text-sm">{error}</div>
            </div>
          </div>
        )}

        {/* Selected address info */}
        <div className="absolute bottom-2 left-2 right-2 bg-white p-2 rounded-lg shadow-md text-sm text-gray-700">
          <p className="font-medium mb-1">Selected Address:</p>
          <p className="truncate">
            {addressFromMap || "No address selected. Click on the map to place a marker."}
          </p>
        </div>
      </div>

      <p className="text-sm text-gray-500 mt-2">
        <Pencil size={14} className="inline mr-1" />
        Click on the map to place a marker, or drag the marker to adjust the location.
      </p>
      
      {showCoordinates && latitude && longitude && (
        <p className="text-xs text-gray-400 mt-1">
          Coordinates: {latitude.toFixed(6)}, {longitude.toFixed(6)}
        </p>
      )}
    </div>
  );
};

export default GoogleMapComponent;