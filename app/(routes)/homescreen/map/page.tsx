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
import { MapPin, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

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
  const hasCentered = useRef(false);

  useEffect(() => {
    if (latitude && longitude && map && !hasCentered.current) {
      map.flyTo({
        center: [longitude, latitude],
        zoom: 14,
        duration: 2000,
      });
      hasCentered.current = true;
    }
  }, [latitude, longitude, map]);

  return null;
}

export default function MapPage() {
  const { latitude, longitude } = useGeolocation();
  const [isPicking, setIsPicking] = useState(false);
  const [pickedLocation, setPickedLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [places, setPlaces] = useState<MapPlace[]>([]);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);

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
    <div className="relative h-screen w-full pb-18">
      <Map theme="light" attributionControl={false}>
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

        {/* Place markers */}
        {places.map((place) => (
          <MapMarker
            key={place.id}
            longitude={place.longitude}
            latitude={place.latitude}
            onClick={() =>
              setSelectedPlaceId(selectedPlaceId === place.id ? null : place.id)
            }
          >
            <MarkerContent>
              <div className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-[#44d021] shadow-md transition-transform hover:scale-110">
                <MapPin className="h-5 w-5 text-white" />
              </div>
            </MarkerContent>
            {selectedPlaceId === place.id && (
              <MarkerPopup className="max-w-[280px] min-w-[200px] rounded-xl! p-0! shadow-lg!">
                <div className="overflow-hidden rounded-xl">
                  {place.image && CDN_URL && (
                    <img
                      src={`${CDN_URL}/${place.image}`}
                      alt={place.name}
                      className="h-32 w-full object-cover"
                    />
                  )}
                  <div className="p-3">
                    <h3 className="text-sm font-semibold">{place.name}</h3>
                    <p className="mt-0.5 text-xs text-gray-500">
                      {place.address}
                    </p>
                    {place.description && (
                      <p className="mt-1.5 text-xs text-gray-600">
                        {place.description}
                      </p>
                    )}
                    <span className="mt-2 inline-block rounded-full bg-[#44d021]/10 px-2 py-0.5 text-xs font-medium text-[#44d021]">
                      {place.category}
                    </span>
                  </div>
                </div>
              </MarkerPopup>
            )}
          </MapMarker>
        ))}

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
