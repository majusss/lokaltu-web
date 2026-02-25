"use client";

import { MapMarker, MarkerContent } from "@/components/ui/map";

interface UserLocationMarkerProps {
  latitude: number;
  longitude: number;
}

export function UserLocationMarker({
  latitude,
  longitude,
}: UserLocationMarkerProps) {
  return (
    <MapMarker longitude={longitude} latitude={latitude}>
      <MarkerContent>
        <div className="relative flex h-6 w-6 items-center justify-center">
          <div className="absolute h-full w-full animate-ping rounded-full bg-blue-500/40 opacity-75"></div>
          <div className="relative h-4 w-4 rounded-full border-2 border-white bg-blue-600 shadow-lg"></div>
        </div>
      </MarkerContent>
    </MapMarker>
  );
}
