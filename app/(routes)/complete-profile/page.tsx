"use client";

import skanowanie_torby from "@/app/assets/skanowanie-torby.png";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export default function CompleteProfilePage() {
  return (
    <div className="anim-fade-in-up text-center">
      <h1 className="text-4xl font-extrabold tracking-tight text-neutral-900 drop-shadow-sm">
        Twój profil Lokaltu
      </h1>
      <p className="mt-2 mb-10 text-lg leading-relaxed font-medium text-neutral-500">
        Czy masz już swoją unikalną torbę Lokaltu z tagiem NFC?
      </p>

      <div className="my-10 max-h-80 overflow-hidden rounded-[60px]">
        <Image src={skanowanie_torby} alt="Skanowanie torby" />
      </div>

      <div className="flex flex-col gap-4">
        <Button asChild variant="premium">
          <Link href="/complete-profile/scan">Tak, aktywuj torbę</Link>
        </Button>

        <Button asChild variant="premium">
          <Link href="/complete-profile/no-bag">Jeszcze nie mam</Link>
        </Button>
      </div>
    </div>
  );
}
