"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSignIn } from "@clerk/nextjs";
import { AlertCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Fragment, useState } from "react";

export default function EnterPassword() {
  const router = useRouter();
  const { isLoaded, signIn, setActive } = useSignIn();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!isLoaded) return;
    setLoading(true);
    setError("");

    try {
      const signInAttempt = await signIn.attemptFirstFactor({
        strategy: "password",
        password,
      });

      if (signInAttempt.status === "complete") {
        await setActive({ session: signInAttempt.createdSessionId });
        router.push("/");
      } else {
        console.error(JSON.stringify(signInAttempt, null, 2));
        setError("Niepoprawne hasło lub błąd logowania.");
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

  return (
    <Fragment>
      <h1 className="text-4xl font-semibold">Hasło</h1>
      <p className="text-muted-foreground mt-2">Wpisz hasło do Twojego konta</p>

      <Input
        className="mt-12"
        type="password"
        placeholder="Hasło"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        disabled={loading}
      />

      <Button
        className="mt-8 w-full"
        onClick={handleSubmit}
        disabled={!password || loading}
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Zaloguj się
      </Button>

      {error && (
        <div className="bg-destructive/15 text-destructive mt-4 flex items-center gap-2 rounded-md p-3 text-sm">
          <AlertCircle className="h-4 w-4" />
          <p>{error}</p>
        </div>
      )}

      <p className="mt-4 text-center text-sm text-white/70">
        Zapomniałeś hasła?{" "}
        <button className="font-semibold underline">Zresetuj hasło</button>
      </p>
    </Fragment>
  );
}
