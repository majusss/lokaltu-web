"use client";

import { getUserDb, updateUserName } from "@/app/actions/user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SignOutButton } from "@clerk/nextjs";
import { ChevronLeft, LogOut, Save, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

export default function SettingsPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUserDb().then((user) => {
      if (user) {
        setName(user.name);
      }
      setLoading(false);
    });
  }, []);

  const handleSave = () => {
    startTransition(async () => {
      try {
        await updateUserName(name);
        router.refresh();
        alert("Zapisano pomyślnie!");
      } catch (error) {
        alert("Wystąpił błąd podczas zapisywania.");
      }
    });
  };

  return (
    <div className="relative min-h-screen bg-white pt-24">
      {/* Background Gradient Header */}
      <div className="absolute top-0 left-0 h-50 w-full bg-[linear-gradient(249.58deg,#61F681_0%,#49BF12_49.21%,#DBC443_97.83%)] pt-8">
        <div className="mb-2 flex items-center gap-2 px-6 pt-6">
          <Link href="/homescreen/profile">
            <ChevronLeft className="h-6 w-6 text-[#E3F8D9]" />
          </Link>
          <h1 className="truncate text-2xl font-semibold text-[#E3F8D9]">
            Ustawienia
          </h1>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="relative h-full w-full space-y-8 rounded-t-2xl bg-white px-6 pt-10 pb-32 transition-all">
        {/* Profile Section */}
        <div className="space-y-4">
          <h2 className="text-sm font-black tracking-widest text-gray-400 uppercase">
            Profil użytkownika
          </h2>

          <div className="space-y-2">
            <Label
              htmlFor="name"
              className="ml-1 text-xs font-bold text-gray-500"
            >
              Twoje imię / Nick
            </Label>
            <div className="relative">
              <User className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading || isPending}
                placeholder="Wpisz swoje imię..."
                className="focus:ring--[#84cc16]/10 h-14 rounded-2xl border-gray-100 bg-gray-50 pl-12 text-base font-medium transition-all focus:border-[#84cc16] focus:bg-white"
              />
            </div>
          </div>

          <Button
            onClick={handleSave}
            disabled={loading || isPending || !name}
            className="h-14 w-full rounded-2xl bg-[#84cc16] text-base font-bold text-white shadow-lg shadow-green-200 transition-all hover:bg-[#71af12] active:scale-[0.98] disabled:opacity-50"
          >
            {isPending ? (
              "Zapisywanie..."
            ) : (
              <span className="flex items-center gap-2">
                <Save className="h-5 w-5" />
                Zapisz zmiany
              </span>
            )}
          </Button>
        </div>

        {/* App Section */}
        <div className="space-y-4 pt-4">
          <h2 className="text-sm font-black tracking-widest text-gray-400 uppercase">
            Aplikacja
          </h2>

          <SignOutButton redirectUrl="/">
            <button className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl border-2 border-red-50 bg-white text-base font-bold text-red-500 transition-all hover:bg-red-50 active:scale-[0.98]">
              <LogOut className="h-5 w-5" />
              Wyloguj się
            </button>
          </SignOutButton>
        </div>

        <div className="pt-10 text-center">
          <p className="text-[10px] font-black tracking-[0.2em] text-gray-300 uppercase">
            Lokaltu v1.0.0
          </p>
        </div>
      </div>
    </div>
  );
}
