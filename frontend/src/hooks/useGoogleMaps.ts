import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "react-hot-toast";
import { Loader } from "@googlemaps/js-api-loader";

interface UseGoogleMapsOptions {
  onLocationSelect: (lat: number, lng: number, address: string) => void;
  initialCenter?: { lat: number; lng: number };
  initialZoom?: number;
}

export const useGoogleMaps = ({
  onLocationSelect,
  initialCenter = { lat: 12.9716, lng: 77.5946 }, // Bangalore coordinates
  initialZoom = 15,
}: UseGoogleMapsOptions) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string>("");
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const isInitialized = useRef(false);
  const locationWatchId = useRef<number | null>(null);

  // Cleanup function
  const cleanup = useCallback(() => {
    try {
      // Clear location watch if active
      if (locationWatchId.current !== null) {
        navigator.geolocation.clearWatch(locationWatchId.current);
        locationWatchId.current = null;
      }

      if (markerRef.current) {
        markerRef.current.setMap(null);
        markerRef.current = null;
      }
      if (mapInstanceRef.current) {
        google.maps.event.clearInstanceListeners(mapInstanceRef.current);
        mapInstanceRef.current = null;
      }
    } catch (error) {
      console.warn("Error during cleanup:", error);
    }
  }, []);

  useEffect(() => {
    if (isInitialized.current) {
      return;
    }

    const initializeMap = async () => {
      try {
        if (!import.meta.env.VITE_GOOGLE_MAPS_API_KEY) {
          setError("Google Maps API key is missing");
          return;
        }

        const loader = new Loader({
          apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
          version: "weekly",
          libraries: ["places", "geometry"],
        });

        await loader.load();

        if (mapRef.current && !mapInstanceRef.current) {
          // Create map instance
          const mapInstance = new google.maps.Map(mapRef.current, {
            center: initialCenter,
            zoom: initialZoom,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
            zoomControl: true,
            clickableIcons: false,
            gestureHandling: 'cooperative',
          });

          const geocoderInstance = new google.maps.Geocoder();

          mapInstanceRef.current = mapInstance;
          geocoderRef.current = geocoderInstance;

          // Wait for map to be fully loaded
          google.maps.event.addListenerOnce(mapInstance, 'idle', () => {
            setIsLoaded(true);
            isInitialized.current = true;
            console.log('Map fully loaded and ready');
          });

          // Add click listener for map - CRITICAL: This must be set correctly
          mapInstance.addListener("click", (event: google.maps.MapMouseEvent) => {
            console.log('Map clicked:', event.latLng?.toJSON());
            if (event.latLng) {
              const lat = event.latLng.lat();
              const lng = event.latLng.lng();
              placeMarker(lat, lng);
              reverseGeocode(lat, lng);
            }
          });

          console.log('Map initialized successfully');
        }
      } catch (error) {
        console.error("Error loading Google Maps:", error);
        setError("Failed to load Google Maps. Please check your internet connection and API key.");
      }
    };

    initializeMap();

    return cleanup;
  }, [cleanup, initialCenter, initialZoom]);

  const placeMarker = useCallback((lat: number, lng: number) => {
    try {
      if (!mapInstanceRef.current) {
        console.error('Map instance not available');
        return;
      }

      console.log('Placing marker at:', lat, lng);

      // Remove existing marker
      if (markerRef.current) {
        markerRef.current.setMap(null);
      }

      // Create new marker
      const newMarker = new google.maps.Marker({
        position: { lat, lng },
        map: mapInstanceRef.current,
        draggable: true,
        animation: google.maps.Animation.DROP,
        title: 'Drag to adjust location',
      });

      // Add drag listener
      newMarker.addListener("dragend", (event: google.maps.MapMouseEvent) => {
        if (event.latLng) {
          const newLat = event.latLng.lat();
          const newLng = event.latLng.lng();
          console.log('Marker dragged to:', newLat, newLng);
          reverseGeocode(newLat, newLng);
        }
      });

      markerRef.current = newMarker;
      console.log('Marker placed successfully');
    } catch (error) {
      console.error("Error placing marker:", error);
      toast.error("Error placing marker on map");
    }
  }, []);

  const reverseGeocode = useCallback(
    (lat: number, lng: number) => {
      if (!geocoderRef.current) {
        console.error('Geocoder not available');
        onLocationSelect(lat, lng, `${lat.toFixed(6)}, ${lng.toFixed(6)}`);
        return;
      }

      console.log('Reverse geocoding:', lat, lng);

      geocoderRef.current.geocode(
        { location: { lat, lng } },
        (results, status) => {
          try {
            if (status === "OK" && results?.[0]) {
              const address = results[0].formatted_address;
              console.log('Geocoding successful:', address);
              onLocationSelect(lat, lng, address);
            } else {
              console.warn('Geocoding failed:', status);
              onLocationSelect(lat, lng, `${lat.toFixed(6)}, ${lng.toFixed(6)}`);
            }
          } catch (error) {
            console.error("Error in reverse geocoding:", error);
            onLocationSelect(lat, lng, `${lat.toFixed(6)}, ${lng.toFixed(6)}`);
          }
        }
      );
    },
    [onLocationSelect]
  );

  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by this browser.");
      return;
    }

    if (isGettingLocation) {
      toast.error("Already getting your location. Please wait.");
      return;
    }

    setIsGettingLocation(true);
    console.log('Starting geolocation...');

    // First, try to get cached location quickly
    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log('Got cached/quick location:', position.coords);
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        if (mapInstanceRef.current) {
          mapInstanceRef.current.setCenter({ lat, lng });
          mapInstanceRef.current.setZoom(16);
          placeMarker(lat, lng);
          reverseGeocode(lat, lng);
          toast.success("Location found!");
        }
        setIsGettingLocation(false);
      },
      (error) => {
        console.log('Quick location failed, trying high accuracy:', error);
        
        // If quick location fails, try with high accuracy but longer timeout
        navigator.geolocation.getCurrentPosition(
          (position) => {
            console.log('Got high accuracy location:', position.coords);
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;

            if (mapInstanceRef.current) {
              mapInstanceRef.current.setCenter({ lat, lng });
              mapInstanceRef.current.setZoom(16);
              placeMarker(lat, lng);
              reverseGeocode(lat, lng);
              toast.success("Precise location found!");
            }
            setIsGettingLocation(false);
          },
          (highAccuracyError) => {
            console.error('High accuracy location also failed:', highAccuracyError);
            setIsGettingLocation(false);
            
            let errorMessage = "Unable to get your location.";
            switch (highAccuracyError.code) {
              case highAccuracyError.PERMISSION_DENIED:
                errorMessage = "Location access denied. Please enable location permissions in your browser settings.";
                break;
              case highAccuracyError.POSITION_UNAVAILABLE:
                errorMessage = "Location information is unavailable. Please try again or select manually on the map.";
                break;
              case highAccuracyError.TIMEOUT:
                errorMessage = "Location request timed out. Please select manually by clicking on the map.";
                break;
            }
            
            toast.error(errorMessage);
          },
          {
            enableHighAccuracy: true,
            timeout: 20000, // 20 seconds for high accuracy
            maximumAge: 60000, // 1 minute
          }
        );
      },
      {
        enableHighAccuracy: false,
        timeout: 5000, // 5 seconds for quick attempt
        maximumAge: 300000, // 5 minutes for cached location
      }
    );
  }, [placeMarker, reverseGeocode, isGettingLocation]);

  const clearMap = useCallback(() => {
    try {
      if (markerRef.current) {
        markerRef.current.setMap(null);
        markerRef.current = null;
        console.log('Map cleared');
      }
    } catch (error) {
      console.warn("Error clearing map:", error);
    }
  }, []);

  const setMapLocation = useCallback((lat: number, lng: number) => {
    if (mapInstanceRef.current && isLoaded) {
      mapInstanceRef.current.setCenter({ lat, lng });
      mapInstanceRef.current.setZoom(16);
      placeMarker(lat, lng);
      console.log('Map location set to:', lat, lng);
    }
  }, [isLoaded, placeMarker]);

  const setMapCenter = useCallback((lat: number, lng: number, zoom?: number) => {
    if (mapInstanceRef.current && isLoaded) {
      mapInstanceRef.current.setCenter({ lat, lng });
      if (zoom) {
        mapInstanceRef.current.setZoom(zoom);
      }
      console.log('Map center set to:', lat, lng);
    }
  }, [isLoaded]);

  // Debug function to test map click
  const testMapClick = useCallback(() => {
    if (mapInstanceRef.current && isLoaded) {
      const center = mapInstanceRef.current.getCenter();
      if (center) {
        const lat = center.lat();
        const lng = center.lng();
        console.log('Testing map click at center:', lat, lng);
        placeMarker(lat, lng);
        reverseGeocode(lat, lng);
        toast.success("Test marker placed at map center");
      }
    }
  }, [isLoaded, placeMarker, reverseGeocode]);

  return {
    mapRef,
    isLoaded,
    error,
    isGettingLocation,
    getCurrentLocation,
    clearMap,
    setMapLocation,
    setMapCenter,
    placeMarker,
    reverseGeocode,
    testMapClick, // Add this for debugging
  };
};