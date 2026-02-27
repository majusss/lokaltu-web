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
  isPicking?: boolean;
  onSuccess?: () => void;
}

export function AddPlaceDialog({
  onStartPicking,
  pickedLocation,
  onClearPicked,
  userLocation,
  isPicking,
  onSuccess,
}: AddPlaceDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const isPickingRef = useRef(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    description: "",
    latitude: 0,
    longitude: 0,
    category: "",
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
      // Clear location error if it existed
      setErrors((prev) => {
        const next = { ...prev };
        delete next.location;
        return next;
      });
    }
  }, [pickedLocation, open, onClearPicked]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null;
    if (selected) {
      if (selected.size > 10 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          file: "Plik jest za duży (max 10MB)",
        }));
        return;
      }
      setFile(selected);
      const reader = new FileReader();
      reader.onload = (ev) => setPreview(ev.target?.result as string);
      reader.readAsDataURL(selected);
      // Clear file error
      setErrors((prev) => {
        const next = { ...prev };
        delete next.file;
        return next;
      });
    }
  };

  const handleGetLocation = () => {
    if (userLocation) {
      setFormData((prev) => ({
        ...prev,
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
      }));
      setErrors((prev) => {
        const next = { ...prev };
        delete next.location;
        return next;
      });
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
          setErrors((prev) => {
            const next = { ...prev };
            delete next.location;
            return next;
          });
          setLocationLoading(false);
        },
        () => {
          setErrors((prev) => ({
            ...prev,
            location: "Nie udało się pobrać lokalizacji GPS.",
          }));
          setLocationLoading(false);
        },
      );
    } else {
      setErrors((prev) => ({
        ...prev,
        location: "Geolokalizacja nie jest obsługiwana.",
      }));
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
      category: "",
    });
    setFile(null);
    setPreview(null);
    setErrors({});
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Podaj nazwę miejsca.";
    if (!formData.address.trim()) newErrors.address = "Podaj adres miejsca.";
    if (!file && !preview) newErrors.file = "Dodaj zdjęcie miejsca.";
    if (!hasLocation) newErrors.location = "Ustaw lokalizację miejsca.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      let imageKey = "";
      if (file) {
        const { url, key } = await getUploadUrl(file.type);
        await fetch(url, {
          method: "PUT",
          body: file,
          headers: { "Content-Type": file.type },
        });
        imageKey = key;
      }

      await createPlace({
        ...formData,
        image: imageKey,
      });

      setOpen(false);
      resetForm();
      onSuccess?.();
    } catch (error) {
      console.error("Error adding place:", error);
      setErrors((prev) => ({
        ...prev,
        submit: "Nie udało się dodać miejsca. Spróbuj ponownie.",
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* FAB trigger */}
      {!isPicking && (
        <button
          onClick={() => setOpen(true)}
          className="bg-main group flex h-14 w-14 cursor-pointer items-center justify-center rounded-full shadow-lg transition-all hover:scale-105 active:scale-95"
        >
          <Plus
            className="h-7 w-7 text-white transition-transform group-hover:rotate-90"
            strokeWidth={3}
          />
        </button>
      )}

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
          className="max-h-[90dvh] overflow-hidden rounded-[2.5rem]! border-none p-0 shadow-2xl sm:max-w-110"
        >
          <div className="scrollbar-none flex h-full max-h-[90dvh] flex-col overflow-y-auto pb-4">
            <div className="px-8 pt-8 pb-4">
              <DialogHeader className="space-y-1 text-left">
                <DialogTitle className="text-3xl font-bold tracking-tight text-neutral-900">
                  Nowe miejsce
                </DialogTitle>
                <DialogDescription className="text-base leading-relaxed font-medium text-neutral-500">
                  Miejsce pojawi się na mapie po weryfikacji przez zespół
                  Lokaltu.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                {/* Image upload */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="ml-1 text-sm font-bold tracking-widest text-neutral-700 uppercase">
                      Zdjęcie miejsca
                    </Label>
                    {errors.file && (
                      <span className="animate-in fade-in slide-in-from-right-2 text-[10px] font-bold text-red-500 uppercase">
                        {errors.file}
                      </span>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute h-0 w-0 opacity-0"
                    tabIndex={-1}
                  />
                  {preview ? (
                    <div
                      className={cn(
                        "group relative cursor-pointer overflow-hidden rounded-[2rem] border-4 border-white shadow-md transition-all hover:shadow-lg",
                        errors.file && "ring-2 ring-red-500/50",
                      )}
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
                      className={cn(
                        "group relative flex h-48 w-full flex-col items-center justify-center gap-3 overflow-hidden rounded-[2rem] border-2 border-dashed border-neutral-200 bg-neutral-50 p-6 text-sm transition-all hover:border-[#44d021]/50 hover:bg-[#44d021]/5",
                        errors.file &&
                          "border-red-200 bg-red-50 hover:border-red-300 hover:bg-red-100/50",
                      )}
                    >
                      <div className="rounded-3xl bg-white p-4 shadow-sm transition-transform group-hover:scale-110">
                        <ImagePlus
                          className={cn(
                            "h-10 w-10 text-[#44d021]",
                            errors.file && "text-red-400",
                          )}
                        />
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
                    <div className="flex items-center justify-between">
                      <Label
                        htmlFor="name"
                        className="ml-1 text-sm font-bold tracking-widest text-neutral-700 uppercase"
                      >
                        Nazwa
                      </Label>
                      {errors.name && (
                        <span className="animate-in fade-in slide-in-from-right-2 text-[10px] font-bold text-red-500 uppercase">
                          {errors.name}
                        </span>
                      )}
                    </div>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => {
                        setFormData({ ...formData, name: e.target.value });
                        if (errors.name)
                          setErrors((prev) => {
                            const n = { ...prev };
                            delete n.name;
                            return n;
                          });
                      }}
                      placeholder="np. Eko-Warzywniak"
                      className={cn(
                        errors.name &&
                          "border-red-300 focus-visible:ring-red-500",
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label
                        htmlFor="address"
                        className="ml-1 text-sm font-bold tracking-widest text-neutral-700 uppercase"
                      >
                        Adres
                      </Label>
                      {errors.address && (
                        <span className="animate-in fade-in slide-in-from-right-2 text-[10px] font-bold text-red-500 uppercase">
                          {errors.address}
                        </span>
                      )}
                    </div>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => {
                        setFormData({ ...formData, address: e.target.value });
                        if (errors.address)
                          setErrors((prev) => {
                            const n = { ...prev };
                            delete n.address;
                            return n;
                          });
                      }}
                      placeholder="ul. Ekologiczna 1, Kraków"
                      className={cn(
                        errors.address &&
                          "border-red-300 focus-visible:ring-red-500",
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="category"
                      className="ml-1 text-sm font-bold tracking-widest text-neutral-700 uppercase"
                    >
                      Kategoria
                    </Label>
                    <Input
                      id="category"
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                      placeholder="np. Restauracja, Park, Sklep"
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
                  <div className="flex items-center justify-between">
                    <Label className="ml-1 text-sm font-bold tracking-widest text-neutral-700 uppercase">
                      Położenie
                    </Label>
                    {errors.location && (
                      <span className="animate-in fade-in slide-in-from-right-2 text-[10px] font-bold text-red-500 uppercase">
                        {errors.location}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      type="button"
                      variant="tile"
                      className={cn(
                        "h-16 flex-col items-center justify-center gap-1",
                        locationLoading && "opacity-70",
                        errors.location && "border-red-200 bg-red-50",
                      )}
                      onClick={handleGetLocation}
                      disabled={locationLoading}
                    >
                      {locationLoading ? (
                        <Loader2 className="h-6 w-6 animate-spin" />
                      ) : (
                        <Navigation
                          className={cn(
                            "h-6 w-6 text-[#44d021]",
                            errors.location && "text-red-400",
                          )}
                        />
                      )}
                      <span className="text-xs font-bold tracking-wider text-neutral-500 uppercase">
                        GPS
                      </span>
                    </Button>
                    <Button
                      type="button"
                      variant="tile"
                      className={cn(
                        "h-16 flex-col items-center justify-center gap-1",
                        errors.location && "border-red-200 bg-red-50",
                      )}
                      onClick={handlePickOnMap}
                    >
                      <MapPin
                        className={cn(
                          "h-6 w-6 text-[#f2da00]",
                          errors.location && "text-red-300",
                        )}
                      />
                      <span className="text-xs font-bold tracking-wider text-neutral-500 uppercase">
                        Na mapie
                      </span>
                    </Button>
                  </div>
                  {hasLocation && (
                    <div className="animate-in slide-in-from-top-2 space-y-2">
                      <div className="flex items-center gap-2 px-1 text-xs font-black tracking-tighter text-[#44d021] uppercase">
                        <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#44d021]" />
                        Lokalizacja ustawiona
                      </div>
                      <div className="flex items-center justify-between rounded-2xl bg-neutral-100 p-3 font-mono text-[10px] text-neutral-500 shadow-inner">
                        <div className="flex flex-col">
                          <span className="font-bold text-neutral-400">
                            LAT
                          </span>
                          <span className="font-bold text-neutral-700">
                            {formData.latitude.toFixed(6)}
                          </span>
                        </div>
                        <div className="h-4 w-px bg-neutral-200" />
                        <div className="flex flex-col text-right">
                          <span className="font-bold text-neutral-400">
                            LNG
                          </span>
                          <span className="font-bold text-neutral-700">
                            {formData.longitude.toFixed(6)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-4 pb-8">
                  {errors.submit && (
                    <p className="mb-4 text-center text-xs font-bold text-red-500 uppercase">
                      {errors.submit}
                    </p>
                  )}
                  <Button
                    variant="premium"
                    className="w-full shadow-lg shadow-[#44d021]/20 transition-all hover:shadow-[#44d021]/30"
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="mr-2 h-6 w-6 animate-spin text-white" />
                    ) : (
                      "Udostępnij miejsce"
                    )}
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
