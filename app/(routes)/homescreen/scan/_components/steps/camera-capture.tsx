"use client";

import { Button } from "@/components/ui/button";
import { Camera, CheckCircle2 } from "lucide-react";
import { ScanLayout } from "../scan-layout";

interface CameraCaptureStepProps {
  onCapture: () => void;
}

export default function CameraCaptureStep({
  onCapture,
}: CameraCaptureStepProps) {
  return (
    <ScanLayout
      title="Torba zweryfikowana"
      subtitle="Wszystko się zgadza! Teraz zrób wyraźne zdjęcie swoich zakupów."
    >
      <div className="flex flex-col items-center gap-8 rounded-[2rem] border border-green-100 bg-green-50/50 p-10">
        <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-white ring-8 ring-green-100/50">
          <CheckCircle2
            className="h-14 w-14 text-green-500"
            strokeWidth={2.5}
          />
        </div>

        <div className="text-center">
          <h3 className="text-2xl font-black text-neutral-900">
            Potwierdzono tag
          </h3>
          <p className="mt-3 text-lg leading-relaxed font-bold text-neutral-500">
            Połączono z Twoją ekologiczną torbą Lokaltu.
          </p>
        </div>
      </div>

      <Button variant="premium" onClick={onCapture} className="mt-4 w-full">
        <Camera className="mr-3 h-6 w-6" />
        Zrób zdjęcie
      </Button>
    </ScanLayout>
  );
}
