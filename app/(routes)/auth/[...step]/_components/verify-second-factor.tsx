"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSignIn } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { AuthLayout } from "./auth-layout";

export default function VerifySecondFactor() {
  const router = useRouter();
  const { isLoaded, signIn, setActive } = useSignIn();
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const hasPrepared = useRef(false);

  useEffect(() => {
    if (!isLoaded || !signIn || hasPrepared.current) return;

    const prepareFactors = async () => {
      // If we are already in needs_second_factor, we might need to prepare it
      if (
        signIn.status === "needs_second_factor" &&
        signIn.supportedSecondFactors
      ) {
        const factor = signIn.supportedSecondFactors.find(
          (f) => f.strategy === "email_code",
        );
        if (factor && "emailAddressId" in factor) {
          try {
            hasPrepared.current = true;
            await signIn.prepareSecondFactor({
              strategy: "email_code",
              emailAddressId: factor.emailAddressId as string,
            });
          } catch (err) {
            console.error("Error preparing second factor:", err);
          }
        }
      }
    };

    prepareFactors();
  }, [isLoaded, signIn]);

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
    if (!isLoaded || !signIn) return;
    setLoading(true);
    setError("");
    const fullCode = code.join("");

    try {
      const result = await signIn.attemptSecondFactor({
        strategy: "email_code",
        code: fullCode,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push("/");
      } else {
        console.log("Second factor result status:", result.status);
      }
    } catch (err) {
      console.error(err);
      setError("Nieprawidłowy kod. Spróbuj ponownie.");
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!isLoaded || !signIn) return;
    setError("");
    try {
      if (signIn.supportedSecondFactors) {
        const factor = signIn.supportedSecondFactors.find(
          (f) => f.strategy === "email_code",
        );
        if (factor && "emailAddressId" in factor) {
          await signIn.prepareSecondFactor({
            strategy: "email_code",
            emailAddressId: factor.emailAddressId as string,
          });
        }
      }
    } catch (err) {
      console.error(err);
      setError("Nie udało się wysłać kodu ponownie.");
    }
  };

  const isCodeComplete = code.every((digit) => digit !== "");

  return (
    <AuthLayout
      title="Wprowadź kod"
      subtitle="Wysłaliśmy 6-cyfrowy kod na Twój adres email."
      error={error}
    >
      <div className="mt-4 flex justify-between gap-2">
        {code.map((digit, index) => (
          <div
            key={index}
            className={`relative h-16 flex-1 rounded-2xl border-2 bg-white shadow-sm transition-all ${
              digit ? "border-primary shadow-md" : "border-neutral-100"
            } focus-within:border-primary focus-within:shadow-md`}
          >
            <Input
              id={`code-${index}`}
              className="h-full w-full border-none bg-transparent px-0 text-center text-2xl font-bold shadow-none ring-0 outline-none focus:bg-transparent focus:shadow-none focus:ring-0"
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
        variant="premium"
        size="lg"
        onClick={handleVerify}
        disabled={!isCodeComplete || loading}
        className="mt-6"
      >
        {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
        Weryfikuj
      </Button>

      <p className="mt-6 text-center text-sm font-medium text-neutral-500">
        Nie otrzymałeś kodu?{" "}
        <button
          onClick={handleResend}
          className="text-primary font-bold hover:underline"
        >
          Wyślij ponownie
        </button>
      </p>
    </AuthLayout>
  );
}
