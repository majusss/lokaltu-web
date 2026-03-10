"use client";

import {
  assignBagToCurrentUser,
  detachCurrentUserBag,
  getCurrentUserBag,
} from "@/app/actions/user";
import { Button } from "@/components/ui/button";
import { useNfc } from "@/lib/hooks/use-nfc";
import { ChevronLeft, Loader2, Tag, Unplug } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState, useTransition } from "react";

type CurrentBag = {
  id: string;
  nfcTagId: string;
  assignedAt: Date | null;
};

export default function BagManagementPage() {
  const { startScan, scanning, error } = useNfc();
  const [isPending, startTransition] = useTransition();
  const [bag, setBag] = useState<CurrentBag | null | undefined>(undefined);
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");

  const refreshBag = useCallback(async () => {
    const data = await getCurrentUserBag();
    setBag(data);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      void refreshBag();
    }, 0);

    return () => clearTimeout(timer);
  }, [refreshBag]);

  const handleChangeBag = () => {
    setActionError("");
    setActionSuccess("");

    startTransition(async () => {
      try {
        const result = await startScan(60_000);
        await assignBagToCurrentUser(result.content);
        await refreshBag();
        setActionSuccess("Torba została przypisana pomyślnie.");
      } catch (e) {
        if (e instanceof Error && e.name === "AbortError") return;
        setActionError(
          e instanceof Error ? e.message : "Nie udało się przypisać torby.",
        );
      }
    });
  };

  const handleDetach = () => {
    setActionError("");
    setActionSuccess("");

    startTransition(async () => {
      try {
        await detachCurrentUserBag();
        await refreshBag();
        setActionSuccess("Torba została odpięta.");
      } catch (e) {
        setActionError(
          e instanceof Error ? e.message : "Nie udało się odpiąć torby.",
        );
      }
    });
  };

  return (
    <div className="relative min-h-screen bg-white pt-24">
      <div className="absolute top-0 left-0 h-50 w-full bg-[linear-gradient(249.58deg,#61F681_0%,#49BF12_49.21%,#DBC443_97.83%)] pt-8">
        <div className="mb-2 flex items-center gap-2 px-6 pt-6">
          <Link href="/homescreen/profile">
            <ChevronLeft className="h-6 w-6 text-[#E3F8D9]" />
          </Link>
          <h1 className="truncate text-2xl font-semibold text-[#E3F8D9]">
            Zarządzanie torbą
          </h1>
        </div>
      </div>

      <div className="relative h-full w-full space-y-6 rounded-t-2xl bg-white px-6 pt-10 pb-32 transition-all">
        <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
          <p className="text-sm font-bold text-gray-700">Aktualna torba</p>
          {bag === undefined ? (
            <p className="mt-2 text-sm text-gray-500">Ładowanie...</p>
          ) : bag ? (
            <div className="mt-2 space-y-1">
              <p className="text-sm text-gray-700">
                Tag NFC: <span className="font-bold">{bag.nfcTagId}</span>
              </p>
              <p className="text-xs text-gray-500">
                Jedna torba może być przypisana tylko do jednego użytkownika.
              </p>
            </div>
          ) : (
            <p className="mt-2 text-sm text-gray-500">
              Nie masz przypisanej torby.
            </p>
          )}
        </div>

        {(error || actionError) && (
          <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-bold text-red-600">
            {error || actionError}
          </div>
        )}

        {actionSuccess && (
          <div className="rounded-2xl border border-green-100 bg-green-50 p-4 text-sm font-bold text-green-700">
            {actionSuccess}
          </div>
        )}

        <div className="flex flex-col gap-3">
          <Button
            onClick={handleChangeBag}
            disabled={scanning || isPending}
            className="h-14 w-full rounded-2xl bg-[#84cc16] text-base font-bold text-white"
          >
            {scanning || isPending ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Skanowanie...
              </>
            ) : (
              <>
                <Tag className="h-5 w-5" />
                {bag ? "Podmień torbę" : "Przypisz torbę"}
              </>
            )}
          </Button>

          <Button
            onClick={handleDetach}
            disabled={isPending || scanning || !bag}
            variant="outline"
            className="h-14 w-full rounded-2xl border-red-200 text-base font-bold text-red-600 hover:bg-red-50"
          >
            <Unplug className="h-5 w-5" />
            Odepnij aktualną torbę
          </Button>
        </div>
      </div>
    </div>
  );
}
