"use client";

import { completeProfile, getUserDb } from "@/app/actions/user";
import noise from "@/app/assets/sign-in/noise.png";
import BgPhotos from "@/components/bg-photos";
import { Button } from "@/components/ui/button";
import { useNativeBridge } from "@/lib/hooks/useNativeBridge";
import { useUser } from "@clerk/nextjs";
import { AlertCircle, Loader2, Nfc, Sparkles } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function CompleteProfilePage() {
  const router = useRouter();
  const { isLoaded, isSignedIn, user } = useUser();
  const { send, isReady } = useNativeBridge();

  const [isSynced, setIsSynced] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const checkSync = async () => {
      if (!isLoaded) return;
      if (!isSignedIn) {
        router.push("/auth/sign-in");
        return;
      }

      try {
        await getUserDb();
      } catch (e) {
        console.error("Failed to check user sync:", e);
      } finally {
        setIsSynced(true);
      }
    };

    checkSync();
  }, [isLoaded, isSignedIn, user, router]);

  const handleAddBag = async () => {
    setScanning(true);
    setError("");

    try {
      const result = await send({ type: "REQUEST_NFC" }, 30000);

      const nfcResult = result as
        | { type: "NFC_RESULT"; payload: string }
        | { type: "NFC_ERROR"; error: string };

      if (nfcResult.type === "NFC_RESULT") {
        await completeProfile(nfcResult.payload);
        router.push("/");
      } else {
        setError(nfcResult.error);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "NFC scan failed");
    } finally {
      setScanning(false);
    }
  };

  const handleSkip = async () => {
    await completeProfile();
    router.push("/");
  };

  if (!isLoaded || !isSynced) {
    return (
      <div className="relative min-h-screen overflow-hidden">
        <div className="fixed inset-0 -z-50">
          <BgPhotos />
          <div className="absolute inset-0 bg-white/60"></div>
          <Image
            className="absolute inset-0 h-full w-full object-cover opacity-20"
            src={noise}
            alt="Background noise"
          />
        </div>
        <div className="grid min-h-screen w-full place-items-center backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="text-primary h-10 w-10 animate-spin" />
            <p className="text-muted-foreground animate-pulse font-medium">
              Inicjalizacja...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden overflow-y-auto">
      <div className="fixed inset-0 -z-50">
        <BgPhotos />
        <div className="absolute inset-0 bg-white/60"></div>
        <Image
          className="absolute inset-0 h-full w-full object-cover opacity-20"
          src={noise}
          alt="Background noise"
        />
      </div>

      <div className="grid min-h-screen w-full place-items-center bg-white/40 px-6 py-12 backdrop-blur-sm">
        <div className="anim-fade-in-up w-full max-w-md">
          <h1 className="text-4xl font-extrabold tracking-tight text-neutral-900 drop-shadow-sm">
            Dodaj swoją torbę
          </h1>
          <p className="mt-2 mb-10 text-lg leading-relaxed font-medium text-neutral-500">
            Zeskanuj tag NFC, aby połączyć torbę ze swoją tożsamością w
            aplikacji.
          </p>

          <div className="flex flex-col gap-4">
            {error && (
              <div className="animate-in fade-in slide-in-from-top-2 flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-bold text-red-600">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <Button
              variant="premium"
              size="xl"
              onClick={handleAddBag}
              disabled={scanning || !isReady}
              className="group relative flex items-center justify-center gap-4 overflow-hidden"
            >
              <div className="group-hover:animate-shimmer pointer-events-none absolute inset-0 skew-x-[-20deg] bg-linear-to-r from-transparent via-white/10 to-transparent"></div>

              {scanning ? (
                <div className="flex items-center gap-3">
                  <Loader2 className="h-7 w-7 animate-spin" />
                  <span>Skanowanie...</span>
                </div>
              ) : (
                <>
                  <Nfc className="h-7 w-7 stroke-[2.5]" />
                  <span>Zeskanuj teraz</span>
                </>
              )}
            </Button>

            <Button
              variant="ghost"
              size="lg"
              className="mt-2"
              onClick={handleSkip}
              disabled={scanning}
            >
              Pominę ten krok
            </Button>
          </div>

          <div className="mt-12 flex w-full items-start gap-4 rounded-3xl border border-white bg-white/30 p-6 text-left shadow-sm backdrop-blur-md">
            <div className="bg-primary/10 rounded-2xl p-2.5">
              <Sparkles className="text-primary h-5 w-5" />
            </div>
            <div>
              <p className="mb-1 text-sm font-bold text-neutral-800">
                Dla kogo to jest?
              </p>
              <p className="text-xs leading-relaxed font-medium text-neutral-600">
                Każda torba Lokaltu posiada unikalny tag NFC. Dzięki niemu
                możesz zbierać punkty i personalizować swoje doświadczenie.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
