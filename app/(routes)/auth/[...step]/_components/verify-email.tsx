"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSignUp } from "@clerk/nextjs";
import { AlertCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Fragment, useState } from "react";

export default function VerifyEmail() {
  const router = useRouter();
  const { isLoaded, signUp, setActive } = useSignUp();
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleVerify = async () => {
    if (!isLoaded) return;
    setLoading(true);
    setError("");
    const fullCode = code.join("");

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code: fullCode,
      });

      if (completeSignUp.status !== "complete") {
        console.log(JSON.stringify(completeSignUp, null, 2));
        if (completeSignUp.missingFields.includes("password")) {
          router.push("/auth/welcome");
        }
      }
      if (completeSignUp.status === "complete") {
        await setActive({ session: completeSignUp.createdSessionId });
        router.push("/");
      }
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
      const error = err as {
        errors?: { longMessage?: string; message: string }[];
      };
      if (error.errors?.[0]?.longMessage) {
        setError(error.errors[0].longMessage);
      } else {
        setError("Błędny kod weryfikacyjny.");
      }
      setLoading(false);
    }
  };

  const isCodeComplete = code.every((digit) => digit !== "");

  return (
    <Fragment>
      <h1 className="text-4xl font-semibold">Wprowadź kod</h1>
      <p className="text-muted-foreground mt-2">
        Wysłaliśmy na Twój email 6 cyfr potrzebnych by zweryfikować konto
      </p>

      <div className="mt-12 flex justify-center gap-2">
        {code.map((digit, index) => (
          <div
            key={index}
            className={`relative h-12 w-14 bg-white ${digit ? "border-main-input" : ""}`}
            style={{ borderRadius: "var(--input-radius, 1rem)" }}
          >
            <Input
              id={`code-${index}`}
              className="h-full w-full border-0 bg-transparent text-center text-2xl font-semibold ring-0 outline-none focus-visible:ring-0"
              style={{ borderRadius: "var(--input-radius, 1rem)" }}
              maxLength={1}
              value={digit}
              onChange={(e) => handleCodeChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              inputMode="numeric"
              pattern="[0-9]*"
              disabled={loading}
            />
          </div>
        ))}
      </div>

      <Button
        className="mt-8 w-full"
        onClick={handleVerify}
        disabled={!isCodeComplete || loading}
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Weryfikuj
      </Button>

      {error && (
        <div className="bg-destructive/15 text-destructive mt-4 flex items-center gap-2 rounded-md p-3 text-sm">
          <AlertCircle className="h-4 w-4" />
          <p>{error}</p>
        </div>
      )}

      <p className="mt-4 text-center text-sm text-white/70">
        Nie otrzymałeś kodu?{" "}
        <button className="font-semibold underline">Wyślij ponownie</button>
      </p>
    </Fragment>
  );
}
