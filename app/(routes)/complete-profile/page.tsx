"use client";

import { completeProfile, getUserDb } from "@/app/actions/user";
import { Button } from "@/components/ui/button";
import { useNativeBridge } from "@/lib/hooks/useNativeBridge";
import { useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";

export default function CompleteProfilePage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { send, isReady } = useNativeBridge();
  const [isSynced, setIsSynced] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const checkSync = async () => {
      if (!isLoaded) return;
      if (!isSignedIn) {
        redirect("/sign-in");
      }
      if (user) {
        const userDb = await getUserDb();
        if (userDb) {
          setIsSynced(true);
        }
      }
    };

    checkSync();
  }, [isLoaded, isSignedIn, user]);

  const handleAddBag = async () => {
    setScanning(true);
    setError("");

    try {
      const result = await send<
        | { type: "NFC_RESULT"; payload: string }
        | { type: "NFC_ERROR"; error: string }
      >({ type: "REQUEST_NFC" }, 30000);

      if (result.type === "NFC_RESULT") {
        await completeProfile(result.payload);
        redirect("/");
      } else {
        setError(result.error);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "NFC scan failed");
    } finally {
      setScanning(false);
    }
  };

  const handleSkip = async () => {
    await completeProfile();
    redirect("/");
  };

  if (!isLoaded) {
    return <>Ładowanie...</>;
  }

  if (!isSynced) {
    return <>Synchronizowanie profilu...</>;
  }

  return (
    <div>
      <h1>Dodaj torbę</h1>
      <p>Zeskanuj tag NFC na torbie lub pomiń ten krok</p>

      {error && <p>{error}</p>}

      <Button onClick={handleAddBag} disabled={scanning || !isReady}>
        {scanning ? "Zbliż tag NFC..." : "Dodaj torbę"}
      </Button>

      <Button onClick={handleSkip} disabled={scanning}>
        Pomiń
      </Button>
    </div>
  );
}
