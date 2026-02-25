"use client";

import { Nfc } from "lucide-react";
import { ScanLayout } from "../scan-layout";

function NfcPulse() {
  return (
    <div className="relative flex items-center justify-center py-20">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="border-main/30 absolute animate-ping rounded-full border-2"
          style={{
            width: `${8 + i * 4}rem`,
            height: `${8 + i * 4}rem`,
            animationDelay: `${i * 0.4}s`,
            animationDuration: "2s",
          }}
        />
      ))}
      <div className="bg-main shadow-main/40 relative z-10 flex h-32 w-32 items-center justify-center rounded-[2.5rem] shadow-2xl">
        <Nfc className="h-16 w-16 text-white" strokeWidth={1.5} />
      </div>
    </div>
  );
}

export default function NfcScanStep() {
  return (
    <ScanLayout
      title="Przytknij torbę"
      subtitle="Szukamy Twojego tagu NFC... Prosimy nie odsuwać telefonu."
    >
      <div className="flex flex-col items-center justify-center py-10">
        <NfcPulse />
      </div>

      <div className="rounded-3xl bg-neutral-50 p-6 text-center">
        <p className="text-sm font-bold tracking-widest text-neutral-400 uppercase">
          Status: Oczekiwanie na sygnał
        </p>
      </div>
    </ScanLayout>
  );
}
