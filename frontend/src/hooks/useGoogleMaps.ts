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
  const locationTimeoutRef = useRef<number | undefined>(undefined);

  // Cleanup function to properly remove map elements
  const cleanup = useCallback(() => {
    try {
      // Clear location timeout if active
      if (locationTimeoutRef.current) {
        clearTimeout(locationTimeoutRef.current);
        locationTimeoutRef.current = undefined;
      }

      if (markerRef.current) {
        markerRef.current.setMap(null);
        markerRef.current = null;
      }
      if (mapInstanceRef.current) {
        // Clear all listeners
        google.maps.event.clearInstanceListeners(mapInstanceRef.current);
        mapInstanceRef.current = null;
      }
    } catch (error) {
      console.warn("Error during cleanup:", error);
    }
  }, []);

  useEffect(() => {
    // Prevent multiple initializations
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
          const mapInstance = new google.maps.Map(mapRef.current, {
            center: initialCenter,
            zoom: initialZoom,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
            zoomControl: true,
            clickableIcons: false,
          });

          const geocoderInstance = new google.maps.Geocoder();

          mapInstanceRef.current = mapInstance;
          geocoderRef.current = geocoderInstance;
          setIsLoaded(true);
          isInitialized.current = true;

          // Add click listener for map
          const clickListener = mapInstance.addListener(
            "click",
            (event: google.maps.MapMouseEvent) => {
              if (event.latLng) {
                const lat = event.latLng.lat();
                const lng = event.latLng.lng();

                placeMarker(lat, lng);
                reverseGeocode(lat, lng);
              }
            }
          );

          // Store listener for cleanup
          mapInstance.set("clickListener", clickListener);
        }
      } catch (error) {
        console.error("Error loading Google Maps:", error);
        setError(
          "Failed to load Google Maps. Please check your internet connection."
        );
      }
    };

    initializeMap();

    // Cleanup on unmount
    return () => {
      cleanup();
      if (mapInstanceRef.current) {
        mapInstanceRef.current = null;
      }
      if (geocoderRef.current) {
        geocoderRef.current = null;
      }
    };
  }, [cleanup, initialCenter, initialZoom]);

  const placeMarker = useCallback((lat: number, lng: number) => {
    try {
      if (!mapInstanceRef.current) return;

      // Remove existing marker safely
      if (markerRef.current) {
        markerRef.current.setMap(null);
        markerRef.current = null;
      }

      // Create new marker
      const newMarker = new google.maps.Marker({
        position: { lat, lng },
        map: mapInstanceRef.current,
        draggable: true,
        animation: google.maps.Animation.DROP,
      });

      // Add drag listener to marker
      const dragListener = newMarker.addListener("dragend", () => {
        const position = newMarker.getPosition();
        if (position && geocoderRef.current) {
          const newLat = position.lat();
          const newLng = position.lng();
          reverseGeocode(newLat, newLng);
        }
      });

      // Store listener for cleanup
      newMarker.set("dragListener", dragListener);
      markerRef.current = newMarker;
    } catch (error) {
      console.error("Error placing marker:", error);
    }
  }, []);

  const reverseGeocode = useCallback(
    (lat: number, lng: number) => {
      if (!geocoderRef.current) return;

      geocoderRef.current.geocode(
        { location: { lat, lng } },
        (results, status) => {
          try {
            if (status === "OK" && results?.[0]) {
              const address = results[0].formatted_address;
              onLocationSelect(lat, lng, address);
            } else {
              onLocationSelect(
                lat,
                lng,
                `${lat.toFixed(6)}, ${lng.toFixed(6)}`
              );
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

    // Prevent multiple simultaneous requests
    if (isGettingLocation) {
      return;
    }

    setIsGettingLocation(true);
    
    // Show loading toast
    const loadingToast = toast.loading("Getting your location...");

    // Clear any existing timeout
    if (locationTimeoutRef.current) {
      clearTimeout(locationTimeoutRef.current);
    }

    // Fallback to less accurate but faster location after 8 seconds
    const fallbackTimeout = setTimeout(() => {
      // Try with lower accuracy settings
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          if (mapInstanceRef.current) {
            mapInstanceRef.current.setCenter({ lat, lng });
            mapInstanceRef.current.setZoom(16);
            placeMarker(lat, lng);
            reverseGeocode(lat, lng);
            toast.dismiss(loadingToast);
            toast.success("Location found (approximate)");
          }
          setIsGettingLocation(false);
        },
        (fallbackError) => {
          console.error("Fallback location error:", fallbackError);
          let errorMessage = "Unable to get your location.";

          switch (fallbackError.code) {
            case fallbackError.PERMISSION_DENIED:
              errorMessage = "Location access denied. Please enable location permissions.";
              break;
            case fallbackError.POSITION_UNAVAILABLE:
              errorMessage = "Location information is unavailable. Please try again.";
              break;
            case fallbackError.TIMEOUT:
              errorMessage = "Location request timed out. Please select manually on the map.";
              break;
          }

          toast.dismiss(loadingToast);
          toast.error(errorMessage);
          setIsGettingLocation(false);
        },
        {
          enableHighAccuracy: false, // Lower accuracy for faster response
          timeout: 15000, // 15 seconds timeout for fallback
          maximumAge: 600000, // 10 minutes - allow cached location
        }
      );
    }, 8000);

    locationTimeoutRef.current = fallbackTimeout;

    // Primary attempt with high accuracy
    navigator.geolocation.getCurrentPosition(
      (position) => {
        // Clear fallback timeout since we got accurate location
        if (locationTimeoutRef.current) {
          clearTimeout(locationTimeoutRef.current);
          locationTimeoutRef.current = undefined;
        }

        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        if (mapInstanceRef.current) {
          mapInstanceRef.current.setCenter({ lat, lng });
          mapInstanceRef.current.setZoom(16);
          placeMarker(lat, lng);
          reverseGeocode(lat, lng);
          toast.dismiss(loadingToast);
          toast.success("Precise location found");
        }
        setIsGettingLocation(false);
      },
      (error) => {
        // Let the fallback timeout handle the error
        console.warn("Primary location request failed, waiting for fallback:", error);
      },
      {
        enableHighAccuracy: true,
        timeout: 8000, // 8 seconds for high accuracy attempt
        maximumAge: 300000, // 5 minutes
      }
    );
  }, [placeMarker, reverseGeocode, isGettingLocation]);

  const clearMap = useCallback(() => {
    try {
      if (markerRef.current) {
        markerRef.current.setMap(null);
        markerRef.current = null;
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
    }
  }, [isLoaded, placeMarker]);

  const setMapCenter = useCallback((lat: number, lng: number, zoom?: number) => {
    if (mapInstanceRef.current && isLoaded) {
      mapInstanceRef.current.setCenter({ lat, lng });
      if (zoom) {
        mapInstanceRef.current.setZoom(zoom);
      }
    }
  }, [isLoaded]);

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
  };
};