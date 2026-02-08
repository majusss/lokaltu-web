"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSignUp } from "@clerk/nextjs";
import { AlertCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Fragment, useState } from "react";

export default function SetPassword() {
  const router = useRouter();
  const { isLoaded, signUp, setActive } = useSignUp();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!isLoaded || !password || password.length < 8) return;
    setLoading(true);
    setError("");

    try {
      const completeSignUp = await signUp.update({
        password,
      });

      if (completeSignUp.status === "complete") {
        await setActive({ session: completeSignUp.createdSessionId });
        router.push("/");
      } else {
        console.error(JSON.stringify(completeSignUp, null, 2));
        setError("Nie udało się ustawić hasła.");
        setLoading(false);
      }
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
      const error = err as {
        errors?: { longMessage?: string; message: string }[];
      };
      if (error.errors?.[0]?.longMessage) {
        setError(error.errors[0].longMessage);
      } else {
        setError("Wystąpił błąd. Spróbuj ponownie.");
      }
      setLoading(false);
    }
  };

  const isValid = password.length >= 8;

  return (
    <Fragment>
      <h1 className="text-4xl font-semibold">Ustaw hasło</h1>
      <p className="text-muted-foreground mt-2">
        Aby Twój wpływ był tylko Twój...
      </p>

      <Input
        className="mt-12"
        type="password"
        placeholder="Hasło"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        disabled={loading}
      />

      {password && password.length < 8 && (
        <p className="mt-2 text-sm text-red-500">
          Hasło musi mieć minimum 8 znaków
        </p>
      )}

      <Button
        className="mt-8 w-full"
        onClick={handleSubmit}
        disabled={!isValid || loading}
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Zakończ
      </Button>

      {error && (
        <div className="bg-destructive/15 text-destructive mt-4 flex items-center gap-2 rounded-md p-3 text-sm">
          <AlertCircle className="h-4 w-4" />
          <p>{error}</p>
        </div>
      )}
    </Fragment>
  );
}
