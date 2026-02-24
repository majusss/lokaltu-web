"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSignIn } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";
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
