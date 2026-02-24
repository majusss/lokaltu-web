"use client";

import { completeProfile } from "@/app/actions/user";
import skanowanie_torby from "@/app/assets/skanowanie-torby.png";
import { Button } from "@/components/ui/button";
import { useNfc } from "@/lib/hooks/use-nfc";
import { AlertCircle } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ScanBagPage() {
  const router = useRouter();
  const { scanning, error, startScan } = useNfc();
  const [completeError, setCompleteError] = useState<string>("");

  useEffect(() => {
    handleAddBag();
  }, []);

  const handleAddBag = async () => {
    setCompleteError("");
    try {
      const result = await startScan(60000);
      await completeProfile(result.content);
      router.push("/complete-profile/active");
    } catch (e) {
      if (e instanceof Error && e.name === "AbortError") return;
      setCompleteError(
        e instanceof Error ? e.message : "Skanowanie NFC nie powiodło się",
      );
    }
  };

  return (
    <div className="anim-fade-in-up text-center">
      <h1 className="text-4xl font-extrabold tracking-tight text-neutral-900 drop-shadow-sm">
        Super!
      </h1>
      <p className="mt-4 mb-10 text-lg leading-relaxed font-medium text-neutral-500">
        Teraz zbliż telefon do metki z logo NFC na Twojej torbie, aby ją
        aktywować
      </p>

      <div className="my-10 max-h-80 overflow-hidden rounded-[60px]">
        <Image src={skanowanie_torby} alt="Skanowanie torby" />
      </div>

      <div className="mx-auto flex max-w-sm flex-col gap-4">
        {(error || completeError) && (
          <div className="animate-in fade-in slide-in-from-top-2 flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-left text-sm font-bold text-red-600">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p>{error || completeError}</p>
          </div>
        )}

        <Button
          variant="premium"
          onClick={() => router.back()}
          disabled={scanning}
        >
          Wróć
        </Button>
      </div>
    </div>
  );
}
