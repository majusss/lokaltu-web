"use client";

import {
  MapMarker,
  MarkerContent,
  MarkerPopup,
  useMap,
} from "@/components/ui/map";
import { ChevronRight, MapPin, Navigation } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import Supercluster from "supercluster";
import { ClusterMarker } from "./cluster-marker";

type MapPlace = {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  category: string;
  image: string | null;
  description: string | null;
};

const CDN_URL = process.env.NEXT_PUBLIC_CDN_URL;

interface ClusterHandlerProps {
  places: MapPlace[];
  selectedPlaceId: string | null;
  setSelectedPlaceId: (id: string | null) => void;
}

export function ClusterHandler({
  places,
  selectedPlaceId,
  setSelectedPlaceId,
}: ClusterHandlerProps) {
  const { map, isLoaded } = useMap();
  const [clusters, setClusters] = useState<
    Supercluster.PointFeature<Supercluster.AnyProps>[]
  >([]);
  const [zoom, setZoom] = useState(1);
  const [bounds, setBounds] = useState<[number, number, number, number] | null>(
    null,
  );

  const clusterer = useMemo(() => {
    const sc = new Supercluster({
      radius: 40,
      maxZoom: 16,
    });

    const points: Supercluster.PointFeature<Supercluster.AnyProps>[] =
      places.map((place) => ({
        type: "Feature" as const,
        properties: {
          cluster: false,
          placeId: place.id,
          category: place.category,
          name: place.name,
          address: place.address,
          image: place.image,
          description: place.description,
        },
        geometry: {
          type: "Point" as const,
          coordinates: [place.longitude, place.latitude] as [number, number],
        },
      }));

    sc.load(points);
    return sc;
  }, [places]);

  const updateMapState = useCallback(() => {
    if (!map) return;
    const b = map.getBounds();
    setZoom(map.getZoom());
    setBounds([b.getWest(), b.getSouth(), b.getEast(), b.getNorth()] as [
      number,
      number,
      number,
      number,
    ]);
  }, [map]);

  useEffect(() => {
    if (!map || !isLoaded) return;

    // Initial update
    const timer = setTimeout(updateMapState, 0);

    // Update on move for fluidity
    map.on("move", updateMapState);
    map.on("zoom", updateMapState);

    return () => {
      clearTimeout(timer);
      map.off("move", updateMapState);
      map.off("zoom", updateMapState);
    };
  }, [map, isLoaded, updateMapState]);

  useEffect(() => {
    if (bounds && clusterer) {
      const currentClusters = clusterer.getClusters(bounds, Math.floor(zoom));
      const timer = setTimeout(() => {
        setClusters(currentClusters);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [bounds, zoom, clusterer]);

  const handleClusterClick = useCallback(
    (longitude: number, latitude: number) => {
      if (!map) return;
      const targetCluster = clusters.find(
        (c) =>
          c.properties.cluster &&
          c.geometry.coordinates[0] === longitude &&
          c.geometry.coordinates[1] === latitude,
      );
      if (!targetCluster) return;

      const expansionZoom = clusterer.getClusterExpansionZoom(
        targetCluster.id as number,
      );
      map.flyTo({
        center: [longitude, latitude],
        zoom: Math.min(expansionZoom, 18),
        duration: 500,
      });
    },
    [map, clusterer, clusters],
  );

  return (
    <>
      {clusters.map((cluster) => {
        const [longitude, latitude] = cluster.geometry.coordinates;
        const { cluster: isCluster, point_count: pointCount } =
          cluster.properties;

        if (isCluster) {
          return (
            <ClusterMarker
              key={`cluster-${cluster.id}`}
              latitude={latitude}
              longitude={longitude}
              count={pointCount}
              onClusterClick={handleClusterClick}
            />
          );
        }

        const place = places.find((p) => p.id === cluster.properties.placeId);
        if (!place) return null;

        return (
          <MapMarker
            key={place.id}
            longitude={place.longitude}
            latitude={place.latitude}
            onClick={(e) => {
              // Prevent map click handler if any
              e.stopPropagation();
              console.log("[Map] Clicked place:", place.id);
              setSelectedPlaceId(
                selectedPlaceId === place.id ? null : place.id,
              );
            }}
          >
            <MarkerContent className="animate-in fade-in zoom-in duration-300">
              <div className="bg-main flex h-10 w-10 cursor-pointer items-center justify-center rounded-full shadow-lg ring-2 ring-white transition-all hover:scale-110 active:scale-95">
                <MapPin className="h-5 w-5 text-white" />
              </div>
            </MarkerContent>
            {selectedPlaceId === place.id && (
              <MarkerPopup className="max-w-75 min-w-60 rounded-2xl! p-0! shadow-xl!">
                <div className="animate-in fade-in slide-in-from-bottom-2 overflow-hidden rounded-2xl bg-white duration-200">
                  {place.image && CDN_URL && (
                    <div className="relative h-32 w-full">
                      <Image
                        src={`${CDN_URL}/${place.image}`}
                        alt={place.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-base leading-tight font-bold text-neutral-900">
                        {place.name}
                      </h3>
                      <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-neutral-300" />
                    </div>

                    <p className="mt-1 text-xs font-medium text-neutral-500">
                      {place.address}
                    </p>

                    {place.description && (
                      <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-neutral-600">
                        {place.description}
                      </p>
                    )}

                    <div className="mt-4 flex flex-col gap-2">
                      <div className="flex items-center justify-between border-t border-neutral-50 pt-3">
                        <span className="inline-block rounded-lg bg-[#49BF12]/10 px-2.5 py-1 text-[10px] font-black tracking-tight text-[#49BF12] uppercase">
                          {place.category}
                        </span>
                      </div>

                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-main mt-1 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-black text-white transition-all hover:opacity-95 active:scale-[0.98]"
                      >
                        <Navigation className="h-4 w-4" />
                        Prowadź do celu
                      </a>
                    </div>
                  </div>
                </div>
              </MarkerPopup>
            )}
          </MapMarker>
        );
      })}
    </>
  );
}
