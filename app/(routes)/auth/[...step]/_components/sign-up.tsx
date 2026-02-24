"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSignUp } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { AuthLayout } from "./auth-layout";

export default function SignUp() {
  const router = useRouter();
  const { isLoaded, signUp } = useSignUp();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleEmailSubmit = async () => {
    if (!isLoaded) return;
    setLoading(true);
    setError("");
    try {
      await signUp.create({
        emailAddress: email,
      });

      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

      router.push("/auth/verify-email");
    } catch (err) {
      console.error(err);
      const clerkError = err as {
        errors?: { code: string; message: string; longMessage?: string }[];
      };
      const code = clerkError.errors?.[0]?.code;

      if (code === "form_identifier_exists") {
        setError("To konto już istnieje. Zaloguj się.");
      } else if (code === "form_password_length_too_short") {
        setError("Hasło jest za krótkie.");
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
      title="Dołącz do Lokaltu!"
      subtitle="Zacznij zbierać punkty i wspierać rzemieślników."
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
        Kontynuuj
      </Button>

      <p className="mt-6 px-4 text-center text-xs leading-relaxed font-medium text-neutral-400">
        Tworząc konto akceptujesz{" "}
        <span className="cursor-pointer text-neutral-800 underline">
          Regulamin
        </span>{" "}
        i{" "}
        <span className="cursor-pointer text-neutral-800 underline">
          Politykę prywatności
        </span>
      </p>

      <div className="mt-12 flex justify-center">
        <p className="text-center font-bold text-neutral-600">
          Masz już konto?{" "}
          <Link href="/auth/sign-in" className="text-primary hover:underline">
            Zaloguj się
          </Link>
        </p>
      </div>

      <div id="clerk-captcha" />
    </AuthLayout>
  );
}
