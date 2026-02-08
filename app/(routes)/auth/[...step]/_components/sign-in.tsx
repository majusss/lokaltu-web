"use client";

import google from "@/app/assets/sign-in/google.svg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSignIn } from "@clerk/nextjs";
import { AlertCircle, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Fragment, useState } from "react";

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

  const handleGoogleSignIn = async () => {
    if (!isLoaded) return;
    setLoading(true);
    setError("");
    try {
      await signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/auth/sso-callback",
        redirectUrlComplete: "/",
      });
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
      <h1 className="text-4xl font-semibold">Zaloguj się</h1>
      <p className="text-muted-foreground mt-2">Aby nie tracić czasu...</p>

      <Input
        className="mt-12"
        placeholder="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleEmailSubmit()}
        disabled={loading}
      />

      <Button
        className="mt-4 w-full"
        onClick={handleEmailSubmit}
        disabled={!email || loading}
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Dalej
      </Button>

      {error && (
        <div className="bg-destructive/15 text-destructive mt-4 flex items-center gap-2 rounded-md p-3 text-sm">
          <AlertCircle className="h-4 w-4" />
          <p>{error}</p>
        </div>
      )}

      <p className="text-muted-foreground w-full py-6 text-center font-bold">
        LUB
      </p>

      <button
        onClick={handleGoogleSignIn}
        className="flex h-14 w-full items-center rounded-xl bg-white p-4 shadow-xl transition-transform active:scale-95 disabled:opacity-50"
        disabled={loading}
      >
        {loading ? (
          <Loader2 className="mx-auto h-6 w-6 animate-spin text-black" />
        ) : (
          <>
            <Image src={google} alt="Google logo" />
            <p className="w-full text-center text-lg font-semibold">
              Użyj konto Google
            </p>
          </>
        )}
      </button>

      <div id="clerk-captcha" />

      <div className="absolute bottom-12 left-0 w-full">
        <p className="text-center font-semibold text-white">
          Nie masz konta?{" "}
          <Link href="/auth/sign-up" className="underline">
            Dołącz do Lokaltu
          </Link>
        </p>
      </div>
    </Fragment>
  );
}
