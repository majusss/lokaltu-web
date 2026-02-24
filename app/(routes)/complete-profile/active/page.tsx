"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function ActiveBagPage() {
  return (
    <div className="anim-fade-in-up text-center">
      <h1 className="text-4xl font-extrabold tracking-tight text-neutral-900 drop-shadow-sm">
        Torba jest aktywna!
      </h1>
      <p className="mt-4 mb-10 text-lg leading-relaxed font-medium text-neutral-500">
        Doskonale! Twoja torba Lokaltu została pomyślnie połączona z profilem.
        Możesz teraz w pełni korzystać ze wszystkich funkcji.
      </p>

      <div className="mx-auto flex max-w-sm flex-col gap-4">
        <Button asChild variant="premium">
          <Link href="/">
            <span>Rozpocznij przygodę</span>
            <ArrowRight className="h-6 w-6 transition-transform group-hover:translate-x-1" />
            <div className="group-hover:animate-shimmer pointer-events-none absolute inset-0 skew-x-[-20deg] bg-linear-to-r from-transparent via-white/10 to-transparent"></div>
          </Link>
        </Button>
      </div>
    </div>
  );
}
