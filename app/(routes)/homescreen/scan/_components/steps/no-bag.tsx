"use client";

import { Button } from "@/components/ui/button";
import { ShoppingBag } from "lucide-react";
import Link from "next/link";
import { ScanLayout } from "../scan-layout";

export default function NoBagStep() {
  return (
    <ScanLayout
      title="Skonfiguruj torbę"
      subtitle="Zanim zaczniesz zbierać punkty, musisz przypisać swoją torbę do konta."
    >
      <div className="flex flex-col items-center gap-8 rounded-[2rem] border border-neutral-100 bg-white p-10 transition-all">
        <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-amber-500/10">
          <ShoppingBag className="h-12 w-12 text-amber-500" strokeWidth={1.5} />
        </div>

        <div className="space-y-4 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-4 py-1.5 text-xs font-black tracking-wider text-amber-600 uppercase">
            Wymagana konfiguracja
          </div>
          <p className="text-[17px] leading-relaxed font-black text-neutral-800">
            Wygląda na to, że Twoja torba nie została jeszcze skonfigurowana.
          </p>
          <p className="text-[15px] leading-relaxed font-bold text-neutral-600">
            Aby korzystać z funkcji skanowania zakupów, musisz najpierw połączyć
            swoją fizyczną torbę Lokaltu z aplikacją. Czy jesteś gotowy?
          </p>
        </div>
      </div>

      <Button asChild variant="premium" className="w-full">
        <Link href="/complete-profile/scan">Rozpocznij konfigurację</Link>
      </Button>
    </ScanLayout>
  );
}
