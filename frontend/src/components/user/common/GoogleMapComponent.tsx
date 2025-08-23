import React from 'react';
import { Navigation, Pencil, MapPinOff, Loader2, TestTube } from 'lucide-react';

interface GoogleMapComponentProps {
  mapRef: React.RefObject<HTMLDivElement | null>;
  isLoaded: boolean;
  error: string;
  addressFromMap: string;
  latitude?: number;
  longitude?: number;
  isGettingLocation?: boolean;
  onGetCurrentLocation: () => void;
  onClearMap: () => void;
  testMapClick?: () => void; // Add this for debugging
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
  isGettingLocation = false,
  onGetCurrentLocation,
  onClearMap,
  testMapClick,
  height = "h-64",
  showControls = true,
  showCoordinates = true,
}) => {
  const handleMapContainerClick = (e: React.MouseEvent) => {
    console.log('Map container clicked:', e);
    // Don't prevent propagation - let it reach the Google Map
  };

  return (
    <div className="mb-6">
      {showControls && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
          <h2 className="text-base font-semibold text-gray-700">Map Location</h2>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onGetCurrentLocation}
              disabled={!isLoaded || isGettingLocation}
              className="flex items-center px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-sm font-medium shadow-sm"
              title="Use your current location"
            >
              {isGettingLocation ? (
                <>
                  <Loader2 size={16} className="mr-1 animate-spin" />
                  <span>Getting Location...</span>
                </>
              ) : (
                <>
                  <Navigation size={16} className="mr-1" />
                  <span>Current Location</span>
                </>
              )}
            </button>
            
            {/* Debug button */}
            {testMapClick && (
              <button
                type="button"
                onClick={testMapClick}
                disabled={!isLoaded}
                className="flex items-center px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-sm font-medium shadow-sm"
                title="Test map click at center"
              >
                <TestTube size={16} className="mr-1" />
                <span>Test Click</span>
              </button>
            )}
            
            <button
              type="button"
              onClick={onClearMap}
              disabled={!isLoaded || isGettingLocation}
              className="flex items-center px-3 py-1.5 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-sm font-medium shadow-sm"
              title="Clear all markers"
            >
              <MapPinOff size={16} className="mr-1" />
              <span>Clear</span>
            </button>
          </div>
        </div>
      )}
      
      <div className="relative border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        {/* Map container - CRITICAL: No pointer-events blocking */}
        <div 
          ref={mapRef} 
          className={`${height} w-full bg-gray-50 cursor-crosshair`}
          style={{ 
            minHeight: '256px',
            // Ensure map can receive clicks
            pointerEvents: isLoaded ? 'auto' : 'none'
          }}
          onClick={handleMapContainerClick}
        />

        {/* Loading state overlay */}
        {!isLoaded && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-3 border-blue-500 border-t-transparent mx-auto mb-3"></div>
              <div className="text-gray-600 font-medium">Loading map...</div>
              <div className="text-gray-400 text-sm mt-1">Please wait a moment</div>
            </div>
          </div>
        )}

        {/* Error state overlay */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-50 z-10">
            <div className="text-center p-4">
              <MapPinOff size={40} className="mx-auto mb-3 text-red-400" />
              <div className="text-red-600 font-medium mb-2">Map Error</div>
              <div className="text-red-500 text-sm max-w-xs">{error}</div>
              <button
                onClick={() => window.location.reload()}
                className="mt-3 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
              >
                Reload Page
              </button>
            </div>
          </div>
        )}

        {/* Location getting overlay */}
        {isGettingLocation && isLoaded && (
          <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center z-20">
            <div className="bg-white rounded-lg p-4 shadow-lg">
              <div className="flex items-center">
                <Loader2 size={20} className="animate-spin text-blue-500 mr-3" />
                <span className="text-gray-700 font-medium">Getting your location...</span>
              </div>
            </div>
          </div>
        )}

        {/* Debug info overlay */}
        {isLoaded && (
          <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white text-xs p-2 rounded">
            <div>Map Loaded: {isLoaded ? '✅' : '❌'}</div>
            <div>Has Coordinates: {latitude && longitude ? '✅' : '❌'}</div>
            <div>Click Status: Ready</div>
          </div>
        )}

        {/* Selected address info */}
        {isLoaded && !error && (
          <div className="absolute bottom-2 left-2 right-2 bg-white bg-opacity-95 backdrop-blur-sm p-3 rounded-lg shadow-md border border-gray-200">
            <div className="flex items-start">
              <MapPinOff size={16} className="text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-gray-700 text-sm mb-1">Selected Address:</p>
                <p className="text-gray-600 text-sm leading-tight break-words">
                  {addressFromMap || "No address selected. Click anywhere on the map to place a marker."}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      {isLoaded && !error && (
        <div className="mt-3 space-y-2">
          <p className="text-sm text-gray-500 flex items-center">
            <Pencil size={14} className="mr-2 flex-shrink-0" />
            Click anywhere on the map to place a marker, or drag the marker to adjust the location.
          </p>
          
          {showCoordinates && latitude && longitude && (
            <p className="text-xs text-gray-400 font-mono">
              Coordinates: {latitude.toFixed(6)}, {longitude.toFixed(6)}
            </p>
          )}

          {/* Debug instructions */}
          <p className="text-xs text-blue-500">
            Debug: If manual clicking doesn't work, try the "Test Click" button above.
          </p>
        </div>
      )}

      {/* Error state instructions */}
      {error && (
        <div className="mt-3">
          <p className="text-sm text-red-500">
            Unable to load map. Please check your internet connection and Google Maps API key.
          </p>
        </div>
      )}
    </div>
  );
};

export default GoogleMapComponent;