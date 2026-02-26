"use client";

import { getMapPlaces } from "@/app/actions/places";
import poins from "@/app/assets/points.svg";
import { useGeolocation } from "@/lib/hooks/use-geolocation";
import { Loader2, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type MapPlace = {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  category: string;
  image: string | null;
  distance?: number;
};

const CDN_URL = process.env.NEXT_PUBLIC_CDN_URL;

function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}

export function NearbyShops() {
  const [mounted, setMounted] = useState(false);
  const { latitude, longitude, loading } = useGeolocation();
  const [places, setPlaces] = useState<MapPlace[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);
    getMapPlaces().then((data) => {
      setPlaces(data);
      setFetching(false);
    });
    return () => clearTimeout(timer);
  }, []);

  const nearbyPlaces = useMemo(() => {
    if (!latitude || !longitude || places.length === 0)
      return places.slice(0, 4);

    return [...places]
      .map((place) => ({
        ...place,
        distance: calculateDistance(
          latitude,
          longitude,
          place.latitude,
          place.longitude,
        ),
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 4);
  }, [latitude, longitude, places]);

  if (!mounted || (fetching && loading)) {
    return (
      <div className="flex h-40 w-full items-center justify-center rounded-2xl border border-dashed border-gray-200">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (nearbyPlaces.length === 0) return null;

  return (
    <div>
      <h2 className="ml-1.5 text-2xl font-semibold">
        {latitude && longitude
          ? "Miejsca w Twojej okolicy"
          : "Ekologiczne miejsca"}
      </h2>
      <div className="mt-3 space-y-4">
        {nearbyPlaces.map((shop) => (
          <Link
            href={`/homescreen/map?lat=${shop.latitude}&lng=${shop.longitude}&id=${shop.id}`}
            className="group relative flex h-47 w-full flex-col justify-between overflow-hidden rounded-2xl bg-[#FFF4E6] shadow-md transition-transform active:scale-95"
            key={shop.id}
          >
            {/* Background Image & Gradient */}
            <div className="absolute inset-0">
              <Image
                src={`${CDN_URL}/${shop.image}`}
                alt={shop.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </div>

            <div className="relative z-10 m-4 flex items-center justify-between">
              <div className="inline-flex items-center">
                <Image
                  src={poins}
                  alt=""
                  width={40}
                  height={40}
                  className="z-10"
                />
                <div className="flex h-fit -translate-x-3 items-center rounded-r-full bg-[#FFFCF8] px-4 py-0.5 text-center shadow-sm">
                  <span className="font-medium text-[#59CA34]">Zobacz</span>
                </div>
              </div>

              {shop.distance !== undefined && (
                <div className="rounded-full bg-black/40 px-3 py-1 text-xs font-medium text-white backdrop-blur-md">
                  {shop.distance < 1
                    ? `${(shop.distance * 1000).toFixed(0)} m`
                    : `${shop.distance.toFixed(1)} km`}
                </div>
              )}
            </div>

            <div className="relative z-10 m-4">
              <p className="line-clamp-2 text-2xl leading-tight font-black text-[#FFF4E6]">
                {shop.name}
              </p>
              <div className="mt-1 flex items-center gap-1 text-[#FFF4E6]/80">
                <MapPin className="h-3 w-3" />
                <span className="truncate text-xs">{shop.address}</span>
              </div>
            </div>
          </Link>
        ))}

        {nearbyPlaces.length === 0 && !fetching && (
          <p className="py-8 text-center text-sm text-gray-500">
            Nie znaleźliśmy jeszcze żadnych miejsc w Twojej okolicy.
          </p>
        )}
      </div>
    </div>
  );
}
