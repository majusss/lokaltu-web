"use client";

import { Button } from "@/components/ui/button";
import { Nfc, ShoppingBag } from "lucide-react";
import { ScanLayout } from "../scan-layout";

interface IdleStepProps {
  onStart: () => void;
}

export default function IdleStep({ onStart }: IdleStepProps) {
  return (
    <ScanLayout
      title="Skanuj zakupy"
      subtitle="Zeskanuj torbę i zrób zdjęcie zakupów, aby otrzymać punkty lokalności."
    >
      <div className="flex flex-col items-center gap-8 rounded-[2rem] border border-neutral-100 bg-white p-10 transition-all">
        <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-[#44d021]/10">
          <ShoppingBag className="h-12 w-12 text-[#44d021]" strokeWidth={1.5} />
        </div>

        <div className="space-y-4 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-green-50 px-4 py-1.5 text-xs font-black tracking-wider text-green-600 uppercase">
            <Nfc className="h-3.5 w-3.5" />
            Technologia NFC
          </div>
          <p className="text-[17px] leading-relaxed font-bold text-neutral-600">
            Zbliż telefon do tagu NFC na torbie, a następnie zrób zdjęcie
            zakupów do błyskawicznej weryfikacji przez AI.
          </p>
        </div>
      </div>

      <Button variant="premium" onClick={onStart} className="mt-4 w-full">
        <Nfc className="mr-3 h-6 w-6" />
        Rozpocznij skanowanie
      </Button>
    </ScanLayout>
  );
}
