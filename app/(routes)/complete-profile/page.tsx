"use client";

import { completeProfile, getUserDb } from "@/app/actions/user";
import noise from "@/app/assets/sign-in/noise.png";
import BgPhotos from "@/components/bg-photos";
import { Button } from "@/components/ui/button";
import { useNativeBridge } from "@/lib/hooks/useNativeBridge";
import { useUser } from "@clerk/nextjs";
import { AlertCircle, Loader2 } from "lucide-react";
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
      if (user) {
        try {
          const userDb = await getUserDb();
          if (userDb) {
            setIsSynced(true);
          }
        } catch (e) {
          console.error(e);
        }
      }
    };

    checkSync();
  }, [isLoaded, isSignedIn, user, router]);

  const handleAddBag = async () => {
    setScanning(true);
    setError("");

    try {
      // @ts-expect-error - send type inference might be tricky
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
      <div className="overflow-y-hidden">
        <BgPhotos />
        <div className="absolute h-screen w-full bg-white/60"></div>
        <Image
          className="fixed -bottom-1/4 scale-200"
          src={noise}
          alt="Background noise"
        />
        <div className="absolute grid h-full w-full place-items-center bg-white/60 backdrop-blur-sm">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-y-hidden">
      <BgPhotos />
      <div className="absolute h-screen w-full bg-white/60"></div>
      <Image
        className="fixed -bottom-1/4 scale-200"
        src={noise}
        alt="Background noise"
      />

      <div className="absolute grid h-full w-full place-items-center bg-white/60 backdrop-blur-sm">
        <div className="w-full px-7">
          <h1 className="text-4xl font-semibold">Dodaj torbę</h1>
          <p className="text-muted-foreground mt-2">
            Zeskanuj tag NFC na torbie lub pomiń ten krok
          </p>

          {error && (
            <div className="bg-destructive/15 text-destructive mt-8 flex items-center gap-2 rounded-md p-3 text-sm">
              <AlertCircle className="h-4 w-4" />
              <p>{error}</p>
            </div>
          )}

          <Button
            className="mt-12 w-full"
            onClick={handleAddBag}
            disabled={scanning || !isReady}
          >
            {scanning && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {scanning ? "Skanowanie..." : "Dodaj torbę"}
          </Button>

          <Button
            variant="ghost"
            className="mt-4 w-full"
            onClick={handleSkip}
            disabled={scanning}
          >
            Pomiń
          </Button>
        </div>
      </div>
    </div>
  );
}
