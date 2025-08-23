import React from 'react';
import { Navigation, MapPinOff, Loader2, MapPin, AlertTriangle } from 'lucide-react';

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
  testMapClick?: () => void;
  onMapClick?: (clientX: number, clientY: number) => void;
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
  onMapClick,
  height = "h-64",
  showControls = true,
  showCoordinates = true,
}) => {
  const hasMarker = latitude && longitude;

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
              title="Get your current location"
            >
              {isGettingLocation ? (
                <>
                  <Loader2 size={16} className="mr-1 animate-spin" />
                  <span>Getting...</span>
                </>
              ) : (
                <>
                  <Navigation size={16} className="mr-1" />
                  <span>Current Location</span>
                </>
              )}
            </button>
            
           
            
            <button
              type="button"
              onClick={onClearMap}
              disabled={!hasMarker}
              className="flex items-center px-3 py-1.5 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-sm font-medium shadow-sm"
              title="Clear selected location"
            >
              <MapPinOff size={16} className="mr-1" />
              <span>Clear</span>
            </button>
          </div>
        </div>
      )}
      
      {/* Debug info */}
      <div className="mb-2 text-xs space-y-1">
        <div className="flex items-center gap-4">
          <span className={`flex items-center ${isLoaded ? 'text-green-600' : 'text-yellow-600'}`}>
            <div className={`w-2 h-2 rounded-full mr-2 ${isLoaded ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
            Map Status: {isLoaded ? 'Ready' : 'Loading...'}
          </span>
          <span className={`flex items-center ${hasMarker ? 'text-green-600' : 'text-gray-400'}`}>
            <MapPin size={12} className="mr-1" />
            Marker: {hasMarker ? 'Placed' : 'None'}
          </span>
        </div>
      </div>
      
      <div className="relative border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        {/* Map container */}
        <div 
          ref={mapRef} 
          className={`${height} w-full bg-gray-100 relative`}
          style={{ 
            minHeight: '320px',
            cursor: isLoaded && !error ? 'crosshair' : 'default',
            // Ensure all pointer events reach the map
            pointerEvents: 'auto',
            touchAction: 'manipulation'
          }}
          onClick={(e) => {
            // Debug DOM clicks and handle them if Google Maps click isn't working
            console.log('🖱️ Map container React onClick detected');
            
            if (!isLoaded || error) {
              console.log('Map not ready, ignoring click');
              return;
            }

            if (onMapClick) {
              console.log('🎯 Calling manual map click handler');
              onMapClick(e.clientX, e.clientY);
            } else {
              console.log('❌ No map click handler provided');
            }
          }}
        >
          {/* Instructions overlay when map is ready but no marker */}
          {isLoaded && !error && !hasMarker && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-5">
              <div className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg opacity-80 max-w-xs text-center">
                <div className="flex items-center justify-center">
                  <MapPin size={16} className="mr-2" />
                  Click anywhere on the map to place a marker
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Loading overlay */}
        {!isLoaded && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
              <div className="text-gray-700 font-medium">Loading Google Maps...</div>
              <div className="text-gray-500 text-sm mt-1">Please wait a moment</div>
            </div>
          </div>
        )}

        {/* Error overlay */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-50 z-10">
            <div className="text-center p-6 max-w-md">
              <AlertTriangle size={48} className="mx-auto mb-4 text-red-400" />
              <div className="text-red-700 font-semibold mb-2">Map Loading Failed</div>
              <div className="text-red-600 text-sm mb-4">{error}</div>
              <div className="space-y-2">
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm mr-2"
                >
                  Reload Page
                </button>
                <div className="text-xs text-red-500 mt-2">
                  Make sure you have a valid Google Maps API key configured
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Location getting overlay */}
        {isGettingLocation && (
          <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center z-20">
            <div className="bg-white rounded-lg p-4 shadow-lg">
              <div className="flex items-center">
                <Loader2 size={20} className="animate-spin text-blue-500 mr-3" />
                <span className="text-gray-700 font-medium">Getting your location...</span>
              </div>
            </div>
          </div>
        )}

        {/* Address display */}
        {isLoaded && !error && (
          <div className="absolute bottom-2 left-2 right-2 bg-white bg-opacity-95 backdrop-blur-sm p-3 rounded-lg shadow-md border border-gray-200">
            <div className="flex items-start">
              {hasMarker ? (
                <MapPin size={16} className="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              ) : (
                <MapPinOff size={16} className="text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
              )}
              <div className="min-w-0 flex-1">
                <p className="font-medium text-gray-700 text-sm mb-1">
                  {hasMarker ? "Selected Location:" : "No location selected"}
                </p>
                <p className="text-gray-600 text-sm leading-tight break-words">
                  {addressFromMap || "Click on the map to select a location"}
                </p>
                {showCoordinates && hasMarker && (
                  <p className="text-xs text-gray-400 font-mono mt-2">
                    📍 {latitude!.toFixed(6)}, {longitude!.toFixed(6)}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

   
    </div>
  );
};

export default GoogleMapComponent;