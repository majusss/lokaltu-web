"use client";

import { Sparkles } from "lucide-react";
import { ScanLayout } from "../scan-layout";

export default function AnalyzingStep() {
  return (
    <ScanLayout
      title="Analizujemy zakupy"
      subtitle="Nasze AI sprawdza świeżość i zgodność Twoich produktów..."
      showBack={false}
    >
      <div className="flex flex-col items-center justify-center gap-12 py-16">
        <div className="relative flex h-32 w-32 items-center justify-center">
          <div className="absolute inset-0 animate-spin rounded-[2.5rem] border-[6px] border-neutral-100 border-t-[#44d021]" />
          <div className="flex h-20 w-20 animate-pulse items-center justify-center rounded-3xl bg-[#44d021]/10">
            <Sparkles className="h-10 w-10 text-[#44d021]" />
          </div>
        </div>

        <div className="space-y-3 text-center">
          <p className="text-xl font-black text-neutral-900">
            Trwa weryfikacja AI
          </p>
          <p className="text-sm font-bold tracking-widest text-neutral-400 uppercase">
            To zajmie tylko chwilę...
          </p>
        </div>
      </div>

      <div className="rounded-3xl bg-neutral-50 p-6 text-center font-medium text-neutral-500 italic">
        "Czy wiesz, że używając torby wielorazowej oszczędzasz średnio 500
        foliowek rocznie?"
      </div>
    </ScanLayout>
  );
}
