"use client";

import { useEffect, useState } from "react";

export interface GeolocationState {
  loading: boolean;
  latitude: number | null;
  longitude: number | null;
  error: {
    code: number | null;
    message: string;
  } | null;
}

const CACHE_KEY = "last_known_location";

export function useGeolocation(options?: PositionOptions) {
  const [state, setState] = useState<GeolocationState>(() => {
    const isSupported =
      typeof window !== "undefined" && "geolocation" in navigator;

    // Try to load from cache
    let cachedLocation = null;
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(CACHE_KEY);
        if (saved) {
          cachedLocation = JSON.parse(saved);
        }
      } catch (e) {
        console.warn("Failed to load location from cache", e);
      }
    }

    return {
      loading: isSupported && !cachedLocation,
      latitude: cachedLocation?.latitude ?? null,
      longitude: cachedLocation?.longitude ?? null,
      error: isSupported
        ? null
        : { code: 0, message: "Geolocation not supported" },
    };
  });

  useEffect(() => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) return;

    console.log("useGeolocation: starting watchPosition...");

    const handleSuccess = (position: GeolocationPosition) => {
      const newLocation = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };

      // Update cache
      try {
        localStorage.setItem(
          CACHE_KEY,
          JSON.stringify({
            ...newLocation,
            timestamp: Date.now(),
          }),
        );
      } catch (e) {
        console.warn("Failed to save location to cache", e);
      }

      setState({
        loading: false,
        ...newLocation,
        error: null,
      });
    };

    const handleError = (error: GeolocationPositionError) => {
      // Explicitly pull properties because GeolocationPositionError isn't serializable
      const errorDetail = {
        code: error.code,
        message: error.message,
      };
      console.error("Geolocation error detail:", errorDetail);

      setState((prev) => ({
        ...prev,
        loading: false,
        error: errorDetail,
      }));
    };

    const watchId = navigator.geolocation.watchPosition(
      handleSuccess,
      handleError,
      {
        enableHighAccuracy: false, // Soften to get a fix faster on desktops
        timeout: 15000, // 15 seconds
        maximumAge: 30000, // 30 seconds cached is fine
        ...options,
      },
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [options]);

  return state;
}
