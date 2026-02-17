"use client";

import { createPlace } from "@/app/actions/places";
import { getUploadUrl } from "@/app/actions/storage";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  ImagePlus,
  Loader2,
  MapPin,
  Navigation,
  Plus,
  Upload,
} from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";

interface AddPlaceDialogProps {
  onStartPicking: () => void;
  pickedLocation: { lat: number; lng: number } | null;
  onClearPicked: () => void;
}

export function AddPlaceDialog({
  onStartPicking,
  pickedLocation,
  onClearPicked,
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
  if (pickedLocation && !open) {
    setFormData((prev) => ({
      ...prev,
      latitude: pickedLocation.lat,
      longitude: pickedLocation.lng,
    }));
    onClearPicked();
    setOpen(true);
  }

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
        className="bg-main flex h-14 w-14 cursor-pointer items-center justify-center rounded-full shadow-lg transition-transform active:scale-95"
      >
        <Plus className="h-7 w-7 text-white" strokeWidth={2.5} />
      </button>

      <Dialog
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (!v && !isPickingRef.current) resetForm();
          isPickingRef.current = false;
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Dodaj nowe miejsce</DialogTitle>
            <DialogDescription>
              Podziel się ekologicznym miejscem ze społecznością.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="grid gap-4 py-2">
            {/* Image upload */}
            <div className="grid gap-2">
              <Label>Zdjęcie</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              {preview ? (
                <div
                  className="group relative cursor-pointer overflow-hidden rounded-xl"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Image
                    src={preview}
                    alt="Podgląd"
                    width={425}
                    height={200}
                    className="h-40 w-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                    <Upload className="h-6 w-6 text-white" />
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-muted-foreground flex h-40 w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#44d021]/30 bg-[#44d021]/5 text-sm transition-colors hover:border-[#44d021]/50 hover:bg-[#44d021]/10"
                >
                  <ImagePlus className="h-8 w-8 text-[#44d021]/60" />
                  <span>Kliknij, aby dodać zdjęcie</span>
                </button>
              )}
            </div>

            {/* Name */}
            <div className="grid gap-2">
              <Label htmlFor="name">Nazwa miejsca</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="np. Eko Sklep"
                required
              />
            </div>

            {/* Address */}
            <div className="grid gap-2">
              <Label htmlFor="address">Adres</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                placeholder="np. ul. Zielona 12, Kraków"
                required
              />
            </div>

            {/* Description */}
            <div className="grid gap-2">
              <Label htmlFor="description">Krótki opis</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Dlaczego warto odwiedzić to miejsce?"
                rows={3}
              />
            </div>

            {/* Location */}
            <div className="grid gap-2">
              <Label>Lokalizacja</Label>
              <div className="grid gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={handleGetLocation}
                  disabled={locationLoading}
                >
                  {locationLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Navigation className="mr-2 h-4 w-4" />
                  )}
                  Moja lokalizacja
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={handlePickOnMap}
                >
                  <MapPin className="mr-2 h-4 w-4" />
                  Wybierz na mapie
                </Button>
              </div>
              {hasLocation && (
                <p className="text-muted-foreground text-xs">
                  📍 {formData.latitude.toFixed(6)},{" "}
                  {formData.longitude.toFixed(6)}
                </p>
              )}
            </div>

            <DialogFooter>
              <Button
                type="submit"
                disabled={loading}
                className="bg-main w-full text-white hover:opacity-90"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Dodaj miejsce
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
