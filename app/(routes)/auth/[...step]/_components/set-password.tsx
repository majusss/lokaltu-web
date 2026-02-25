"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSignUp } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { AuthLayout } from "./auth-layout";

export default function SetPassword() {
  const router = useRouter();
  const { isLoaded, signUp, setActive } = useSignUp();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isValid = password.length >= 8;

  const handleSubmit = async () => {
    if (!isValid || !isLoaded) return;
    setLoading(true);
    setError("");

    try {
      const completeSignUp = await signUp.update({
        password,
      });

      if (completeSignUp.status === "complete") {
        await setActive({ session: completeSignUp.createdSessionId });
        router.push("/complete-profile");
      }
    } catch (err: any) {
      console.error(err);
      const message =
        err.errors?.[0]?.longMessage ||
        err.errors?.[0]?.message ||
        "Nie udało się ustawić hasła. Spróbuj ponownie.";
      setError(message);
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Ustaw hasło"
      subtitle="Zadbaj o bezpieczeństwo swojego konta."
      error={error}
    >
      <Input
        type="password"
        placeholder="Twoje bezpieczne hasło"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        disabled={loading}
        className="mt-2"
      />

      <div className="flex items-center gap-2 px-1">
        <div
          className={`h-1.5 flex-1 rounded-full transition-all ${password.length >= 4 ? "bg-primary" : "bg-neutral-200"}`}
        />
        <div
          className={`h-1.5 flex-1 rounded-full transition-all ${password.length >= 8 ? "bg-primary" : "bg-neutral-200"}`}
        />
        <div
          className={`h-1.5 flex-1 rounded-full transition-all ${password.length >= 12 ? "bg-primary" : "bg-neutral-200"}`}
        />
      </div>

      <p
        className={`text-sm font-bold transition-colors ${isValid ? "text-primary" : "text-neutral-400"}`}
      >
        {isValid ? "✓ Hasło jest bezpieczne" : "• Minimum 8 znaków"}
      </p>

      <Button
        variant="premium"
        onClick={handleSubmit}
        disabled={!isValid || loading}
        className="mt-6"
      >
        {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
        Zakończ
      </Button>
    </AuthLayout>
  );
}
