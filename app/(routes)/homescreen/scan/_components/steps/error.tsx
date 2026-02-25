"use client";

import { Button } from "@/components/ui/button";
import { AlertCircle, RotateCcw } from "lucide-react";
import { ScanLayout } from "../scan-layout";

interface ErrorStepProps {
  message: string;
  onRetry: () => void;
}

export default function ErrorStep({ message, onRetry }: ErrorStepProps) {
  return (
    <ScanLayout
      title="Wystąpił błąd"
      subtitle="Coś poszło nie tak podczas skanowania. Spróbujmy jeszcze raz."
    >
      <div className="flex flex-col items-center gap-8 rounded-[2rem] border border-red-100 bg-red-50/30 p-10 shadow-lg shadow-red-100/10">
        <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-white shadow-sm ring-8 ring-red-100/50">
          <AlertCircle className="h-14 w-14 text-red-500" strokeWidth={2.5} />
        </div>

        <div className="text-center">
          <h3 className="text-xl font-black tracking-tight text-red-600 uppercase">
            Błąd operacji
          </h3>
          <p className="mt-4 text-lg leading-relaxed font-bold text-neutral-600">
            {message || "Nieznany błąd połączenia lub urządzenia."}
          </p>
        </div>
      </div>

      <Button
        variant="premium"
        onClick={onRetry}
        className="mt-4 w-full bg-red-500 shadow-red-500/20 hover:scale-[1.02] hover:bg-red-600"
      >
        <RotateCcw className="mr-3 h-7 w-7" />
        Spróbuj ponownie
      </Button>
    </ScanLayout>
  );
}
