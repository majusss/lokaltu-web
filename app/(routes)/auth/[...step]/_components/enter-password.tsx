"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSignIn } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { AuthLayout } from "./auth-layout";

export default function EnterPassword() {
  const router = useRouter();
  const { isLoaded, signIn, setActive } = useSignIn();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!password || !isLoaded) return;
    setLoading(true);
    setError("");

    try {
      const result = await signIn.attemptFirstFactor({
        strategy: "password",
        password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push("/");
      } else if (result.status === "needs_second_factor") {
        router.push("/auth/verify-second-factor");
      }
    } catch (err: any) {
      console.error(err);
      const message =
        err.errors?.[0]?.longMessage ||
        err.errors?.[0]?.message ||
        "Nieprawidłowe hasło. Spróbuj ponownie.";
      setError(message);
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Wpisz hasło"
      subtitle="Podaj hasło do swojego konta, aby kontynuować."
      error={error}
    >
      <Input
        type="password"
        placeholder="Twoje hasło"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        disabled={loading}
        className="mt-2"
      />

      <Button
        variant="premium"
        onClick={handleSubmit}
        disabled={!password || loading}
        className="mt-6"
      >
        {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
        Zaloguj się
      </Button>
    </AuthLayout>
  );
}
