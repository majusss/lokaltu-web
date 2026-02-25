"use client";

import { MapMarker, MarkerContent } from "@/components/ui/map";

interface ClusterMarkerProps {
  latitude: number;
  longitude: number;
  count: number;
  onClusterClick: (longitude: number, latitude: number) => void;
}

export function ClusterMarker({
  latitude,
  longitude,
  count,
  onClusterClick,
}: ClusterMarkerProps) {
  // Determine size based on count
  const size =
    count < 10 ? "h-10 w-10" : count < 50 ? "h-12 w-12" : "h-14 w-14";
  const fontSize = count < 100 ? "text-sm" : "text-xs";

  return (
    <MapMarker
      longitude={longitude}
      latitude={latitude}
      onClick={() => onClusterClick(longitude, latitude)}
    >
      <MarkerContent className="animate-in fade-in zoom-in duration-300">
        <div
          className={`${size} bg-main flex cursor-pointer items-center justify-center rounded-full border-2 border-white shadow-lg transition-all hover:scale-110 active:scale-95`}
        >
          <span className={`${fontSize} font-bold text-white`}>{count}</span>
        </div>
      </MarkerContent>
    </MapMarker>
  );
}
