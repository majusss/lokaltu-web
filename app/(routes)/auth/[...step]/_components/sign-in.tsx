"use client";

import google from "@/app/assets/sign-in/google.svg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Fragment, useState } from "react";

export default function SignIn() {
  const router = useRouter();
  const [email, setEmail] = useState("");

  const handleEmailSubmit = () => {
    if (email) {
      router.push("/auth/enter-password");
    }
  };

  const handleGoogleSignIn = () => {
    // Clerk Google OAuth
  };

  return (
    <Fragment>
      <h1 className="text-4xl font-semibold">Zaloguj się</h1>
      <p className="text-muted-foreground mt-2">Aby nie tracić czasu...</p>

      <Input
        className="mt-12"
        placeholder="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleEmailSubmit()}
      />

      <Button
        className="mt-4 w-full"
        onClick={handleEmailSubmit}
        disabled={!email}
      >
        Dalej
      </Button>

      <p className="text-muted-foreground w-full py-6 text-center font-bold">
        LUB
      </p>

      <button
        onClick={handleGoogleSignIn}
        className="flex h-14 w-full items-center rounded-xl bg-white p-4 shadow-xl transition-transform active:scale-95"
      >
        <Image src={google} alt="Google logo" />
        <p className="w-full text-center text-lg font-semibold">
          Użyj konto Google
        </p>
      </button>

      <div className="absolute bottom-12 left-0 w-full">
        <p className="text-center font-semibold text-white">
          Nie masz konta?{" "}
          <button
            onClick={() => router.push("/auth/sign-up")}
            className="underline"
          >
            Dołącz do Lokaltu
          </button>
        </p>
      </div>
    </Fragment>
  );
}
