"use client";

import { Suspense } from "react";
import { MapClient } from "./_components/map-client";

export default function MapPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen flex-col items-center justify-center gap-4 bg-neutral-50">
          <div className="relative">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-neutral-200 border-t-[#49BF12]" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-2 w-2 rounded-full bg-[#49BF12]" />
            </div>
          </div>
          <p className="animate-pulse text-sm font-semibold text-neutral-500">
            Ładowanie mapy...
          </p>
        </div>
      }
    >
      <MapClient />
    </Suspense>
  );
}
