"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";
import { ScanLayout } from "../scan-layout";

interface ResultStepProps {
  confidence: number;
  reasoning: string;
  pointsData?: {
    points: number;
    bonus: number;
    total: number;
    isNewPlace: boolean;
    placeName?: string;
  };
  onReset: () => void;
}

function SuccessView({
  total,
  base,
  bonus,
  placeName,
}: {
  total: number;
  base: number;
  bonus: number;
  placeName?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center space-y-8 py-4">
      <div className="relative">
        <div className="absolute inset-0 animate-pulse rounded-full bg-green-400/20 blur-3xl" />
        <div className="bg-main flex h-40 w-40 flex-col items-center justify-center rounded-full shadow-2xl ring-8 shadow-green-500/20 ring-white">
          <span className="text-5xl font-black text-white">+{total}</span>
          <span className="text-[10px] font-black tracking-widest text-white/80 uppercase">
            PKT EXP
          </span>
        </div>
        <div className="absolute -top-2 -right-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-400 shadow-lg ring-4 ring-white">
            <Sparkles className="h-6 w-6 text-yellow-900" />
          </div>
        </div>
      </div>

      <div className="space-y-2 text-center">
        <h2 className="text-3xl font-black tracking-tight text-neutral-900">
          Świetne zakupy!
        </h2>
        <p className="mx-auto max-w-60 text-sm font-medium text-neutral-400">
          Twoje zgłoszenie zostało zweryfikowane pozytywnie.
        </p>
      </div>

      <div className="w-full space-y-3 rounded-[2rem] bg-neutral-50 p-6">
        <div className="flex justify-between text-sm font-bold">
          <span className="text-neutral-400">Baza za zakupy</span>
          <span className="text-neutral-900">+{base} pkt</span>
        </div>
        {bonus > 0 && (
          <div className="flex justify-between text-sm font-bold">
            <span className="text-green-600">Bonus: Nowe miejsce</span>
            <span className="text-green-600">+{bonus} pkt</span>
          </div>
        )}
        {placeName && (
          <div className="flex justify-between border-t border-neutral-200 pt-3 text-xs font-bold italic">
            <span className="text-neutral-400">Lokalizacja</span>
            <span className="text-neutral-900">{placeName}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function ConfidenceRing({ value }: { value: number }) {
  const r = 58;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;

  const color = value >= 70 ? "#44d021" : value >= 40 ? "#f2da00" : "#ef4444";

  return (
    <div className="relative flex items-center justify-center">
      <svg width="150" height="150" className="-rotate-90">
        <circle
          cx="75"
          cy="75"
          r={r}
          stroke="#f5f5f5"
          strokeWidth="12"
          fill="none"
          strokeLinecap="round"
        />
        <circle
          cx="75"
          cy="75"
          r={r}
          stroke={color}
          strokeWidth="12"
          fill="none"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-4xl leading-none font-black text-neutral-900">
          {value}%
        </span>
        <span className="mt-1 text-[10px] font-black tracking-widest text-neutral-400 uppercase">
          Pewność
        </span>
      </div>
    </div>
  );
}

export default function ResultStep({
  confidence,
  reasoning,
  pointsData,
  onReset,
}: ResultStepProps) {
  const isAwarded = !!pointsData;
  const isMixed = confidence >= 40 && confidence < 70;

  return (
    <ScanLayout
      title={isAwarded ? "Sukces!" : "Wynik analizy"}
      subtitle={
        isAwarded
          ? "Punkty zostały dodane do Twojego konta."
          : "Oto co nasze AI sądzi o Twoich zakupach."
      }
    >
      <div className="flex flex-col items-center gap-8 rounded-[2.5rem] border border-neutral-100 bg-white p-10 shadow-xl shadow-neutral-100/30">
        {isAwarded ? (
          <SuccessView
            total={pointsData.total}
            base={pointsData.points}
            bonus={pointsData.bonus}
            placeName={pointsData.placeName}
          />
        ) : (
          <>
            <ConfidenceRing value={confidence} />

            <div className="space-y-4 text-center">
              <div
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-5 py-2 text-[13px] font-black tracking-wide uppercase",
                  confidence >= 70
                    ? "bg-green-50 text-green-600"
                    : isMixed
                      ? "bg-yellow-50 text-yellow-600"
                      : "bg-red-50 text-red-600",
                )}
              >
                <Sparkles className="h-4 w-4" />
                {confidence >= 70
                  ? "Prawie się udało"
                  : isMixed
                    ? "Wymagana powtórka"
                    : "Weryfikacja negatywna"}
              </div>

              <p className="text-lg leading-relaxed font-bold text-neutral-600">
                {reasoning}
              </p>
            </div>
          </>
        )}
      </div>

      <Button
        variant={isAwarded ? "premium" : "default"}
        onClick={onReset}
        className="mt-6 w-full"
      >
        {isAwarded ? "Zakończ i wróć" : "Spróbuj ponownie"}
      </Button>
    </ScanLayout>
  );
}
