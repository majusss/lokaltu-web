"use client";

import { getMapPlaces } from "@/app/actions/places";
import { AddPlaceDialog } from "@/components/places/add-place-dialog";
import {
  Map,
  MapControls,
  MapMarker,
  MarkerContent,
  MarkerPopup,
  useMap,
} from "@/components/ui/map";
import { useGeolocation } from "@/lib/hooks/use-geolocation";
import { ChevronRight, Loader2, MapPin, Navigation, X } from "lucide-react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Supercluster from "supercluster";

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

function UserLocationMarker({
  latitude,
  longitude,
}: {
  latitude: number;
  longitude: number;
}) {
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

function MapClickHandler({
  onPick,
}: {
  onPick: (lngLat: { lng: number; lat: number }) => void;
}) {
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

function MapAutoCenterer({
  latitude,
  longitude,
}: {
  latitude: number | null;
  longitude: number | null;
}) {
  const { map } = useMap();
  const searchParams = useSearchParams();
  const lastCoords = useRef<string | null>(null);

  useEffect(() => {
    if (!map) return;

    const queryLat = searchParams.get("lat");
    const queryLng = searchParams.get("lng");

    if (queryLat && queryLng) {
      const lat = parseFloat(queryLat);
      const lng = parseFloat(queryLng);

      if (!isNaN(lat) && !isNaN(lng)) {
        const coordKey = `${queryLat},${queryLng}`;
        if (lastCoords.current !== coordKey) {
          map.flyTo({
            center: [lng, lat],
            zoom: 16,
            duration: 1500,
          });
          lastCoords.current = coordKey;
        }
      }
    } else if (latitude && longitude && lastCoords.current === null) {
      map.flyTo({
        center: [longitude, latitude],
        zoom: 14,
        duration: 2000,
      });
      lastCoords.current = "user";
    }
  }, [latitude, longitude, map, searchParams]);

  return null;
}

function ClusterMarker({
  latitude,
  longitude,
  count,
  onClusterClick,
}: {
  latitude: number;
  longitude: number;
  count: number;
  onClusterClick: (longitude: number, latitude: number) => void;
}) {
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
          className={`${size} flex cursor-pointer items-center justify-center rounded-full border-2 border-white bg-[#44d021] shadow-lg transition-all hover:scale-110 active:scale-95`}
        >
          <span className={`${fontSize} font-bold text-white`}>{count}</span>
        </div>
      </MarkerContent>
    </MapMarker>
  );
}

function ClusterHandler({
  places,
  selectedPlaceId,
  setSelectedPlaceId,
}: {
  places: MapPlace[];
  selectedPlaceId: string | null;
  setSelectedPlaceId: (id: string | null) => void;
}) {
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
      // Use timeout to avoid cascading renders warning
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
            onClick={() =>
              setSelectedPlaceId(selectedPlaceId === place.id ? null : place.id)
            }
          >
            <MarkerContent className="animate-in fade-in zoom-in duration-300">
              <div className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-[#44d021] shadow-lg ring-2 ring-white transition-all hover:scale-110 active:scale-95">
                <MapPin className="h-5 w-5 text-white" />
              </div>
            </MarkerContent>
            {selectedPlaceId === place.id && (
              <MarkerPopup className="max-w-[280px] min-w-[200px] rounded-xl! p-0! shadow-lg!">
                <div className="animate-in fade-in slide-in-from-bottom-2 overflow-hidden rounded-xl duration-200">
                  {place.image && CDN_URL && (
                    <Image
                      src={`${CDN_URL}/${place.image}`}
                      alt={place.name}
                      width={280}
                      height={128}
                      className="h-32 w-full object-cover"
                    />
                  )}
                  <div className="p-3">
                    <h3 className="text-sm font-semibold">{place.name}</h3>
                    <p className="mt-0.5 text-xs text-gray-500">
                      {place.address}
                    </p>
                    {place.description && (
                      <p className="mt-1.5 line-clamp-3 text-xs leading-relaxed text-gray-600">
                        {place.description}
                      </p>
                    )}
                    <div className="mt-3 mb-1 flex items-center justify-between border-t border-gray-50 pt-3">
                      <span className="inline-block rounded-full bg-[#44d021]/10 px-2.5 py-1 text-[10px] font-bold tracking-tight text-[#44d021] uppercase">
                        {place.category}
                      </span>
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </div>

                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-[#44d021] py-2 text-xs font-bold text-white transition-opacity hover:opacity-90"
                    >
                      <Navigation className="h-4 w-4" />
                      Nawiguj
                    </a>
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

function MapContent() {
  const { latitude, longitude } = useGeolocation();
  const searchParams = useSearchParams();
  const [isPicking, setIsPicking] = useState(false);
  const [pickedLocation, setPickedLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [places, setPlaces] = useState<MapPlace[]>([]);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(
    searchParams.get("id"),
  );
  const lastInjectedId = useRef<string | null>(searchParams.get("id"));

  // Sync selected place with query param - response to navigation from feed
  useEffect(() => {
    const id = searchParams.get("id");
    if (id && id !== lastInjectedId.current) {
      setSelectedPlaceId(id);
      lastInjectedId.current = id;
    }
  }, [searchParams]);

  // If deselecting, allow re-injection if URL changes back
  useEffect(() => {
    if (selectedPlaceId === null) {
      lastInjectedId.current = null;
    }
  }, [selectedPlaceId]);

  // Fetch places on mount
  useEffect(() => {
    getMapPlaces().then(setPlaces);
  }, []);

  // Refresh places after adding
  const refreshPlaces = useCallback(() => {
    getMapPlaces().then(setPlaces);
  }, []);

  const handleStartPicking = useCallback(() => {
    setIsPicking(true);
    setSelectedPlaceId(null);
  }, []);

  const handleMapPick = useCallback((lngLat: { lng: number; lat: number }) => {
    setPickedLocation({ lat: lngLat.lat, lng: lngLat.lng });
    setIsPicking(false);
  }, []);

  const handleCancelPicking = useCallback(() => {
    setIsPicking(false);
  }, []);

  const handleClearPicked = useCallback(() => {
    setPickedLocation(null);
    refreshPlaces();
  }, [refreshPlaces]);

  return (
    <div className="relative h-screen w-full pb-18 text-black">
      <Map theme="light" attributionControl={false} maxZoom={19}>
        <MapControls
          showLocate
          position="bottom-right"
          className="mb-28"
          userLocation={latitude && longitude ? { latitude, longitude } : null}
        />

        <MapAutoCenterer latitude={latitude} longitude={longitude} />

        {latitude && longitude && (
          <UserLocationMarker latitude={latitude} longitude={longitude} />
        )}

        {/* Clustered Place markers */}
        <ClusterHandler
          places={places}
          selectedPlaceId={selectedPlaceId}
          setSelectedPlaceId={setSelectedPlaceId}
        />

        {/* Picking mode handler */}
        {isPicking && <MapClickHandler onPick={handleMapPick} />}
        {isPicking && pickedLocation && (
          <MapMarker
            longitude={pickedLocation.lng}
            latitude={pickedLocation.lat}
          >
            <MarkerContent>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#44d021] shadow-lg ring-4 ring-[#44d021]/30">
                <MapPin className="h-5 w-5 text-white" />
              </div>
            </MarkerContent>
          </MapMarker>
        )}
      </Map>

      {/* Picking mode overlay */}
      {isPicking && (
        <>
          <div className="pointer-events-none absolute inset-x-0 top-4 z-20 flex justify-center">
            <div className="rounded-full bg-black/60 px-4 py-2 text-sm font-medium text-white shadow-lg backdrop-blur-sm">
              Kliknij na mapie, aby wybrać lokalizację
            </div>
          </div>
          <button
            onClick={handleCancelPicking}
            className="absolute top-4 right-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg transition-transform active:scale-95"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </>
      )}

      {/* FAB - repositioned under map controls */}
      {!isPicking && (
        <div className="fixed right-2 bottom-20 z-10">
          <AddPlaceDialog
            onStartPicking={handleStartPicking}
            pickedLocation={pickedLocation}
            onClearPicked={handleClearPicked}
            userLocation={
              latitude && longitude ? { latitude, longitude } : null
            }
          />
        </div>
      )}
    </div>
  );
}

export default function MapPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-gray-50">
          <Loader2 className="h-8 w-8 animate-spin text-[#44d021]" />
        </div>
      }
    >
      <MapContent />
    </Suspense>
  );
}
