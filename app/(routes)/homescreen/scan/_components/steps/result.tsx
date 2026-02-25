"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";
import { ScanLayout } from "../scan-layout";

interface ResultStepProps {
  confidence: number;
  reasoning: string;
  onReset: () => void;
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
  onReset,
}: ResultStepProps) {
  const isPositive = confidence >= 70;
  const isMixed = confidence >= 40 && confidence < 70;

  return (
    <ScanLayout
      title="Wynik analizy"
      subtitle="Oto co nasze AI sądzi o Twoich zakupach."
    >
      <div className="flex flex-col items-center gap-8 rounded-[2.5rem] border border-neutral-100 bg-white p-10 shadow-xl shadow-neutral-100/30">
        <ConfidenceRing value={confidence} />

        <div className="space-y-4 text-center">
          <div
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-5 py-2 text-[13px] font-black tracking-wide uppercase",
              isPositive
                ? "bg-green-50 text-green-600"
                : isMixed
                  ? "bg-yellow-50 text-yellow-600"
                  : "bg-red-50 text-red-600",
            )}
          >
            <Sparkles className="h-4 w-4" />
            {isPositive
              ? "Zweryfikowano pozytywnie"
              : isMixed
                ? "Wymagana powtórka"
                : "Weryfikacja negatywna"}
          </div>

          <p className="text-lg leading-relaxed font-bold text-neutral-600">
            {reasoning}
          </p>
        </div>
      </div>

      <Button variant="premium" onClick={onReset} className="mt-4 w-full">
        {isPositive ? "Zakończ i wróć" : "Spróbuj ponownie"}
      </Button>
    </ScanLayout>
  );
}
