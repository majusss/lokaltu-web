"use client";

import { useMap } from "@/components/ui/map";
import { useEffect } from "react";

interface MapClickHandlerProps {
  onPick: (lngLat: { lng: number; lat: number }) => void;
}

export function MapClickHandler({ onPick }: MapClickHandlerProps) {
  const { map } = useMap();

  useEffect(() => {
    if (!map) return;
    map.getCanvas().style.cursor = "crosshair";
    const handler = (e: { lngLat: { lng: number; lat: number } }) =>
      onPick(e.lngLat);
    map.on("click", handler);
    return () => {
      map.getCanvas().style.cursor = "";
      map.off("click", handler);
    };
  }, [map, onPick]);

  return null;
}
