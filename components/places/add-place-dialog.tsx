"use client";

import { createPlace } from "@/app/actions/places";
import { getUploadUrl } from "@/app/actions/storage";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  ImagePlus,
  Loader2,
  MapPin,
  Navigation,
  Plus,
  Upload,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

interface AddPlaceDialogProps {
  onStartPicking: () => void;
  pickedLocation: { lat: number; lng: number } | null;
  onClearPicked: () => void;
  userLocation?: { latitude: number; longitude: number } | null;
}

export function AddPlaceDialog({
  onStartPicking,
  pickedLocation,
  onClearPicked,
  userLocation,
}: AddPlaceDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const isPickingRef = useRef(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    description: "",
    latitude: 0,
    longitude: 0,
    category: "other",
  });

  const hasLocation = formData.latitude !== 0 || formData.longitude !== 0;

  // Sync picked location from map into form
  useEffect(() => {
    if (pickedLocation && !open) {
      setFormData((prev) => ({
        ...prev,
        latitude: pickedLocation.lat,
        longitude: pickedLocation.lng,
      }));
      onClearPicked();
      setOpen(true);
    }
  }, [pickedLocation, open, onClearPicked]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null;
    setFile(selected);
    if (selected) {
      const reader = new FileReader();
      reader.onload = (ev) => setPreview(ev.target?.result as string);
      reader.readAsDataURL(selected);
    } else {
      setPreview(null);
    }
  };

  const handleGetLocation = () => {
    if (userLocation) {
      setFormData((prev) => ({
        ...prev,
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
      }));
      return;
    }

    setLocationLoading(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData((prev) => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }));
          setLocationLoading(false);
        },
        () => {
          alert("Nie udało się pobrać lokalizacji.");
          setLocationLoading(false);
        },
      );
    } else {
      alert("Twoja przeglądarka nie obsługuje geolokalizacji.");
      setLocationLoading(false);
    }
  };

  const handlePickOnMap = () => {
    isPickingRef.current = true;
    setOpen(false);
    onStartPicking();
  };

  const resetForm = () => {
    setFormData({
      name: "",
      address: "",
      description: "",
      latitude: 0,
      longitude: 0,
      category: "other",
    });
    setFile(null);
    setPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      alert("Dodaj zdjęcie miejsca.");
      return;
    }
    if (!hasLocation) {
      alert("Ustaw lokalizację miejsca.");
      return;
    }

    setLoading(true);
    try {
      const { url, key } = await getUploadUrl(file.type);

      await fetch(url, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });

      await createPlace({
        ...formData,
        image: key,
      });

      setOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error adding place:", error);
      alert("Nie udało się dodać miejsca. Spróbuj ponownie.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* FAB trigger */}
      <button
        onClick={() => setOpen(true)}
        className="bg-main group flex h-14 w-14 cursor-pointer items-center justify-center rounded-full shadow-lg transition-all hover:scale-105 active:scale-95"
      >
        <Plus
          className="h-7 w-7 text-white transition-transform group-hover:rotate-90"
          strokeWidth={3}
        />
      </button>

      <Dialog
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (!v && !isPickingRef.current) resetForm();
          isPickingRef.current = false;
        }}
      >
        <DialogContent
          showCloseButton={false}
          className="max-h-[85dvh] overflow-hidden rounded-[2.5rem]! border-none p-0 shadow-2xl sm:max-w-110"
        >
          <div className="scrollbar-none flex h-full max-h-[85dvh] flex-col overflow-y-auto pb-4">
            <div className="px-8 pt-8 pb-4">
              <DialogHeader className="space-y-1 text-left">
                <DialogTitle className="text-3xl font-bold tracking-tight text-neutral-900">
                  Nowe miejsce
                </DialogTitle>
                <DialogDescription className="text-base leading-relaxed font-medium text-neutral-500">
                  Podziel się ekologicznym odkryciem ze społecznością.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                {/* Image upload */}
                <div className="space-y-3">
                  <Label className="ml-1 text-sm font-bold tracking-widest text-neutral-700 uppercase">
                    Zdjęcie miejsca
                  </Label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  {preview ? (
                    <div
                      className="group relative cursor-pointer overflow-hidden rounded-[2rem] border-4 border-white shadow-md transition-all hover:shadow-lg"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Image
                        src={preview}
                        alt="Podgląd"
                        width={440}
                        height={220}
                        className="h-48 w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 backdrop-blur-[2px] transition-opacity group-hover:opacity-100">
                        <div className="rounded-full bg-white/90 p-3 shadow-xl">
                          <Upload className="h-6 w-6 text-neutral-900" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="group relative flex h-48 w-full flex-col items-center justify-center gap-3 overflow-hidden rounded-[2rem] border-2 border-dashed border-neutral-200 bg-neutral-50 p-6 text-sm transition-all hover:border-[#44d021]/50 hover:bg-[#44d021]/5"
                    >
                      <div className="rounded-3xl bg-white p-4 shadow-sm transition-transform group-hover:scale-110">
                        <ImagePlus className="h-10 w-10 text-[#44d021]" />
                      </div>
                      <div className="text-center">
                        <span className="font-bold text-neutral-800">
                          Prześlij zdjęcie
                        </span>
                        <p className="mt-1 text-xs text-neutral-400">
                          PNG, JPG do 10MB
                        </p>
                      </div>
                    </button>
                  )}
                </div>

                {/* Form Fields */}
                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label
                      htmlFor="name"
                      className="ml-1 text-sm font-bold tracking-widest text-neutral-700 uppercase"
                    >
                      Nazwa
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="np. Eko-Warzywniak"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="address"
                      className="ml-1 text-sm font-bold tracking-widest text-neutral-700 uppercase"
                    >
                      Adres
                    </Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      placeholder="ul. Ekologiczna 1, Kraków"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="description"
                      className="ml-1 text-sm font-bold tracking-widest text-neutral-700 uppercase"
                    >
                      Więcej o miejscu
                    </Label>
                    <Input
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      placeholder="Napisz kilka słów zachęty..."
                    />
                  </div>
                </div>

                {/* Location selection */}
                <div className="space-y-3">
                  <Label className="ml-1 text-sm font-bold tracking-widest text-neutral-700 uppercase">
                    Położenie
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      type="button"
                      variant="tile"
                      className={cn(
                        "h-16 flex-col items-center justify-center gap-1",
                        locationLoading && "opacity-70",
                      )}
                      onClick={handleGetLocation}
                      disabled={locationLoading}
                    >
                      {locationLoading ? (
                        <Loader2 className="h-6 w-6 animate-spin" />
                      ) : (
                        <Navigation className="h-6 w-6 text-[#44d021]" />
                      )}
                      <span className="text-xs font-bold tracking-wider text-neutral-500 uppercase">
                        GPS
                      </span>
                    </Button>
                    <Button
                      type="button"
                      variant="tile"
                      className="h-16 flex-col items-center justify-center gap-1"
                      onClick={handlePickOnMap}
                    >
                      <MapPin className="h-6 w-6 text-[#f2da00]" />
                      <span className="text-xs font-bold tracking-wider text-neutral-500 uppercase">
                        Na mapie
                      </span>
                    </Button>
                  </div>
                  {hasLocation && (
                    <div className="flex items-center gap-2 px-1 text-xs font-black tracking-tighter text-[#44d021] uppercase">
                      <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#44d021]" />
                      Lokalizacja ustawiona
                    </div>
                  )}
                </div>

                <div className="pt-4 pb-8">
                  <Button
                    variant="premium"
                    className="w-full"
                    type="submit"
                    disabled={loading}
                  >
                    {loading && (
                      <Loader2 className="mr-2 h-6 w-6 animate-spin text-white" />
                    )}
                    Udostępnij miejsce
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
