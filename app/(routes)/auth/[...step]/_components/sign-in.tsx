"use client";

import google from "@/app/assets/sign-in/google.svg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSignIn } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { AuthLayout } from "./auth-layout";

export default function SignIn() {
  const router = useRouter();
  const { isLoaded, signIn } = useSignIn();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleEmailSubmit = async () => {
    if (!isLoaded) return;
    setLoading(true);
    setError("");
    try {
      await signIn.create({
        identifier: email,
      });
      router.push("/auth/enter-password");
    } catch (err) {
      console.error(err);
      const clerkError = err as {
        errors?: { code: string; message: string; longMessage?: string }[];
      };
      const code = clerkError.errors?.[0]?.code;

      if (code === "form_identifier_not_found") {
        setError("Nie znaleźliśmy konta z tym adresem email.");
      } else {
        setError(
          clerkError.errors?.[0]?.longMessage ||
            clerkError.errors?.[0]?.message ||
            "Wystąpił błąd. Spróbuj ponownie.",
        );
      }
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!isLoaded) return;
    setLoading(true);
    setError("");
    try {
      await signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/auth/sso-callback",
        redirectUrlComplete: "/auth/return-to-app",
      });
    } catch (err) {
      console.error("[Auth] Google Sign In Error:", err);
      setError("Nie udało się połączyć z kontem Google.");
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Zaloguj się"
      subtitle="Witaj ponownie w społeczności Lokaltu."
      error={error}
    >
      <Input
        placeholder="Wpisz swój email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleEmailSubmit()}
        disabled={loading}
      />

      <Button
        variant="premium"
        size="lg"
        onClick={handleEmailSubmit}
        disabled={!email || loading}
        className="mt-2"
      >
        {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
        Dalej
      </Button>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-neutral-200"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-transparent px-4 font-bold text-neutral-400">
            LUB
          </span>
        </div>
      </div>

      <Button
        variant="google"
        size="lg"
        onClick={handleGoogleSignIn}
        disabled={loading}
      >
        {loading ? (
          <Loader2 className="h-6 w-6 animate-spin" />
        ) : (
          <>
            <Image src={google} alt="Google logo" className="h-6 w-6" />
            <span>Użyj konta Google</span>
          </>
        )}
      </Button>

      <div className="mt-12 flex justify-center">
        <p className="text-center font-bold text-neutral-600">
          Nie masz konta?{" "}
          <Link href="/auth/sign-up" className="text-primary hover:underline">
            Dołącz do nas
          </Link>
        </p>
      </div>

      <div id="clerk-captcha" />
    </AuthLayout>
  );
}
