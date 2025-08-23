import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "react-hot-toast";

interface UseGoogleMapsOptions {
  onLocationSelect: (lat: number, lng: number, address: string) => void;
  initialCenter?: { lat: number; lng: number };
  initialZoom?: number;
}

// Declare global google types
declare global {
  interface Window {
    google: typeof google;
    initMap?: () => void;
  }
}

export const useGoogleMaps = ({
  onLocationSelect,
  initialCenter = { lat: 12.9716, lng: 77.5946 }, // Bangalore coordinates
  initialZoom = 15,
}: UseGoogleMapsOptions) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map>(null);
  const markerRef = useRef<google.maps.Marker>(null);
  const geocoderRef = useRef<google.maps.Geocoder>(null);
  const clickListenerRef = useRef<google.maps.MapsEventListener>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string>("");
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const initAttempts = useRef(0);
  const maxInitAttempts = 3;

  // Keep a stable reference to the callback to prevent re-initialization
  const stableOnLocationSelect = useRef(onLocationSelect);
  stableOnLocationSelect.current = onLocationSelect;

  // Load Google Maps Script
  const loadGoogleMapsScript = useCallback((): Promise<void> => {
    return new Promise((resolve, reject) => {
      // Check if already loaded
      if (window.google && window.google.maps && window.google.maps.Map) {
        console.log('Google Maps already loaded');
        resolve();
        return;
      }

      // Remove any existing script
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
      if (existingScript) {
        existingScript.remove();
      }

      console.log('Loading Google Maps script...');
      const script = document.createElement('script');
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      
      if (!apiKey) {
        reject(new Error('Google Maps API key is missing'));
        return;
      }

      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initMap`;
      script.async = true;
      script.defer = true;

      // Global callback function
      window.initMap = () => {
        console.log('Google Maps script loaded via callback');
        resolve();
      };

      script.onerror = () => {
        console.error('Failed to load Google Maps script');
        reject(new Error('Failed to load Google Maps script'));
      };

      document.head.appendChild(script);
    });
  }, []);

  // Place marker on map - simplified and more stable
  const placeMarker = useCallback((lat: number, lng: number) => {
    if (!mapInstanceRef.current || !window.google) {
      console.error('Map or Google Maps not available for placing marker');
      return;
    }

    try {
      console.log('Placing marker at:', lat, lng);

      // Remove existing marker only if it exists
      if (markerRef.current) {
        markerRef.current.setMap(null);
        markerRef.current = null;
      }

      // Create new marker
      const marker = new window.google.maps.Marker({
        position: { lat, lng },
        map: mapInstanceRef.current,
        draggable: true,
        animation: window.google.maps.Animation.DROP,
        title: 'Selected Location - Drag to adjust',
      });

      // Add drag listener
      marker.addListener('dragend', (event: google.maps.MapMouseEvent) => {
        if (event.latLng) {
          const newLat = event.latLng.lat();
          const newLng = event.latLng.lng();
          console.log('Marker dragged to:', newLat, newLng);
          reverseGeocode(newLat, newLng);
        }
      });

      markerRef.current = marker;
      console.log('Marker placed successfully');
    } catch (error) {
      console.error('Error placing marker:', error);
      toast.error('Error placing marker on map');
    }
  }, []);

  // Reverse geocode coordinates to address - use stable callback
  const reverseGeocode = useCallback((lat: number, lng: number) => {
    if (!geocoderRef.current) {
      console.log('Geocoder not available, using coordinates as address');
      stableOnLocationSelect.current(lat, lng, `${lat.toFixed(6)}, ${lng.toFixed(6)}`);
      return;
    }

    console.log('Starting reverse geocoding for:', lat, lng);

    geocoderRef.current.geocode(
  { location: { lat, lng } },
  (results: google.maps.GeocoderResult[] | null, status: google.maps.GeocoderStatus) => {
    if (status === google.maps.GeocoderStatus.OK && results && results[0]) {
      const address = results[0].formatted_address;
      console.log('Reverse geocoding successful:', address);
      stableOnLocationSelect.current(lat, lng, address);
    } else {
      console.log('Reverse geocoding failed or no results:', status);
      stableOnLocationSelect.current(
        lat,
        lng,
        `${lat.toFixed(6)}, ${lng.toFixed(6)}`
      );
    }
  }
);
  }, []);

  // Function to handle manual coordinate calculation from React events
  const handleMapClick = useCallback((clientX: number, clientY: number) => {
    if (!mapInstanceRef.current || !mapRef.current || !isLoaded) {
      console.log('Map not ready for click handling');
      return false;
    }

    console.log('🎯 Handling manual map click:', { clientX, clientY });

    const mapDiv = mapRef.current;
    const rect = mapDiv.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    console.log('📍 Calculated click position:', { x, y, mapWidth: rect.width, mapHeight: rect.height });

    try {
      const bounds = mapInstanceRef.current.getBounds();
      if (bounds) {
        const ne = bounds.getNorthEast();
        const sw = bounds.getSouthWest();
        
        const latRange = ne.lat() - sw.lat();
        const lngRange = ne.lng() - sw.lng();
        
        const lat = ne.lat() - (y / rect.height) * latRange;
        const lng = sw.lng() + (x / rect.width) * lngRange;
        
        console.log('📍 Calculated coordinates:', { lat, lng });
        
        if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
          placeMarker(lat, lng);
          reverseGeocode(lat, lng);
          return true; // Success
        } else {
          console.error('Invalid coordinates:', { lat, lng });
        }
      }
    } catch (error) {
      console.error('Error calculating coordinates from click:', error);
    }
    return false; // Failed
  }, [isLoaded, placeMarker, reverseGeocode]);

  // Initialize the map - more stable version
  const initializeMap = useCallback(async () => {
    if (!mapRef.current) {
      console.error('Map container ref not available');
      return;
    }

    if (mapInstanceRef.current) {
      console.log('Map already initialized');
      return;
    }

    initAttempts.current += 1;
    console.log(`Map initialization attempt ${initAttempts.current}`);

    try {
      // Load Google Maps if not already loaded
      await loadGoogleMapsScript();

      // Wait a bit for Google Maps to be fully ready
      await new Promise(resolve => setTimeout(resolve, 500));

      if (!window.google || !window.google.maps) {
        throw new Error('Google Maps API not loaded properly');
      }

      console.log('Creating map instance...');

      // Create map with stable configuration
      const mapInstance = new window.google.maps.Map(mapRef.current, {
        center: initialCenter,
        zoom: initialZoom,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        zoomControl: true,
        clickableIcons: false,
        gestureHandling: 'auto',
        disableDoubleClickZoom: false,
        draggable: true,
        keyboardShortcuts: true,
        scrollwheel: true,
      });

      // Create geocoder
      const geocoder = new window.google.maps.Geocoder();

      // Store references
      mapInstanceRef.current = mapInstance;
      geocoderRef.current = geocoder;

      console.log('Map instance created, adding event listeners...');

      // Wait for map to be fully loaded
      window.google.maps.event.addListenerOnce(mapInstance, 'idle', () => {
        console.log('Map is ready and idle, adding click listener...');
        
        // Remove any existing click listener
        if (clickListenerRef.current) {
          window.google.maps.event.removeListener(clickListenerRef.current);
          clickListenerRef.current = null;
        }
        
        // Add click listener - single method for stability
        try {
          clickListenerRef.current = mapInstance.addListener('click', (event: google.maps.MapMouseEvent) => {
            console.log('🎯 Map clicked via Google Maps API!', event.latLng?.toJSON());
            if (event.latLng) {
              const lat = event.latLng.lat();
              const lng = event.latLng.lng();
              console.log('📍 Click coordinates:', { lat, lng });
              placeMarker(lat, lng);
              reverseGeocode(lat, lng);
            }
          });

          console.log('✅ Click listener added successfully');
          setIsLoaded(true);
          setError('');
          toast.success('Map ready! Click anywhere to place a marker.');
          
        } catch (error) {
          console.error('Error adding click listener:', error);
          setIsLoaded(true);
          toast.error('Map loaded but click detection may not work');
        }
      });

      console.log('Map initialization completed');

    } catch (error) {
      console.error('Map initialization failed:', error);
      setError(`Failed to load map: ${(error as Error).message}`);
      
      // Retry initialization
      if (initAttempts.current < maxInitAttempts) {
        console.log(`Retrying map initialization in 2 seconds... (${initAttempts.current}/${maxInitAttempts})`);
        setTimeout(() => {
          initializeMap();
        }, 2000);
      } else {
        toast.error('Failed to load Google Maps after multiple attempts');
      }
    }
  }, [loadGoogleMapsScript, initialCenter, initialZoom, placeMarker, reverseGeocode]);

  // Get current location
  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by this browser');
      return;
    }

    if (!mapInstanceRef.current) {
      toast.error('Map is not ready yet');
      return;
    }

    if (isGettingLocation) {
      toast.error('Already getting location...');
      return;
    }

    setIsGettingLocation(true);
    console.log('Getting current location...');

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000,
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        console.log('Current location obtained:', { lat, lng });
        
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setCenter({ lat, lng });
          mapInstanceRef.current.setZoom(16);
          placeMarker(lat, lng);
          reverseGeocode(lat, lng);
          toast.success('Current location found!');
        }
        setIsGettingLocation(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        setIsGettingLocation(false);
        
        let message = 'Unable to get your location';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = 'Location access denied by user';
            break;
          case error.POSITION_UNAVAILABLE:
            message = 'Location information is unavailable';
            break;
          case error.TIMEOUT:
            message = 'Location request timed out';
            break;
        }
        toast.error(message);
      },
      options
    );
  }, [isGettingLocation, placeMarker, reverseGeocode]);

  // Clear map
  const clearMap = useCallback(() => {
    if (markerRef.current) {
      markerRef.current.setMap(null);
      markerRef.current = null;
      console.log('Map marker cleared');
      toast.success('Map cleared');
    }
  }, []);

  // Test map click function
  const testMapClick = useCallback(() => {
    console.log('Testing map click...');
    console.log('Map loaded:', isLoaded);
    console.log('Map instance:', !!mapInstanceRef.current);
    console.log('Google available:', !!window.google);

    if (!isLoaded || !mapInstanceRef.current) {
      toast.error('Map is not ready yet. Please wait...');
      return;
    }

    try {
      const center = mapInstanceRef.current.getCenter();
      if (center) {
        const lat = center.lat();
        const lng = center.lng();
        console.log('Testing with center coordinates:', lat, lng);
        placeMarker(lat, lng);
        reverseGeocode(lat, lng);
        toast.success('Test marker placed at map center!');
      } else {
        toast.error('Unable to get map center');
      }
    } catch (error) {
      console.error('Error in test click:', error);
      toast.error('Error in test click');
    }
  }, [isLoaded, placeMarker, reverseGeocode]);

  // Set map location programmatically
  const setMapLocation = useCallback((lat: number, lng: number, zoom?: number) => {
    if (mapInstanceRef.current && isLoaded) {
      mapInstanceRef.current.setCenter({ lat, lng });
      if (zoom) {
        mapInstanceRef.current.setZoom(zoom);
      }
      placeMarker(lat, lng);
      reverseGeocode(lat, lng);
      console.log('Map location set programmatically to:', lat, lng);
    }
  }, [isLoaded, placeMarker, reverseGeocode]);

  // Update marker position without recreating
  const updateMarkerPosition = useCallback((lat: number, lng: number) => {
    if (markerRef.current && mapInstanceRef.current) {
      console.log('Updating marker position to:', lat, lng);
      markerRef.current.setPosition({ lat, lng });
      mapInstanceRef.current.setCenter({ lat, lng });
      return true;
    }
    return false;
  }, []);

  // Initialize map on mount - only run once
  useEffect(() => {
    console.log('Starting map initialization...');
    initializeMap();

    // Cleanup function
    return () => {
      console.log('Cleaning up Google Maps...');
      
      // Clean up click listeners
      if (clickListenerRef.current && window.google) {
        try {
          window.google.maps.event.removeListener(clickListenerRef.current);
          clickListenerRef.current = null;
        } catch (error) {
          console.warn('Error removing click listener:', error);
        }
      }
      
      // Clean up marker
      if (markerRef.current) {
        try {
          markerRef.current.setMap(null);
          markerRef.current = null;
        } catch (error) {
          console.warn('Error removing marker:', error);
        }
      }
      
      // Clean up map instance
      if (mapInstanceRef.current && window.google) {
        try {
          window.google.maps.event.clearInstanceListeners(mapInstanceRef.current);
          mapInstanceRef.current = null;
        } catch (error) {
          console.warn('Error clearing map instance:', error);
        }
      }
      
      // Clean up global callback
      if (window.initMap) {
        delete window.initMap;
      }
    };
  }, []); // Empty dependency array - only run once

  return {
    mapRef,
    isLoaded,
    error,
    isGettingLocation,
    getCurrentLocation,
    clearMap,
    testMapClick,
    placeMarker,
    reverseGeocode,
    handleMapClick,
    setMapLocation,
    updateMarkerPosition,
  };
};