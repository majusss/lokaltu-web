"use client";

import { completeProfile } from "@/app/actions/user";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NoBagPage() {
  const router = useRouter();
  const [isSkipping, setIsSkipping] = useState(false);

  const handleGoHome = async () => {
    setIsSkipping(true);
    try {
      await completeProfile();
      router.push("/");
    } catch (e) {
      console.error("Failed to complete profile:", e);
      setIsSkipping(false);
    }
  };

  return (
    <div className="anim-fade-in-up text-center">
      <h1 className="text-4xl font-extrabold tracking-tight text-neutral-900 drop-shadow-sm">
        Nie ma problemu!
      </h1>
      <p className="mt-2 mb-10 text-lg leading-relaxed font-medium text-neutral-500">
        Możesz odebrać swoją torbę w Zespole Szkół Technicznych i
        Ogólnokształcących im. Stefana Banacha w Jarosławiu.
        <br /> <br />
        <span className="text-xl font-semibold">
          Otrzymasz od nas e-mail z informacją o najbliższych terminach odbioru.
        </span>
        <br /> <br />W międzyczasie możesz już odkrywać mapę lokalnych skarbów!
      </p>

      <Button
        onClick={handleGoHome}
        variant="premium"
        className="mx-auto w-full"
      >
        {isSkipping ? (
          <>
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Przetwarzanie...</span>
          </>
        ) : (
          "Przejdź do strony głównej"
        )}
      </Button>
    </div>
  );
}
