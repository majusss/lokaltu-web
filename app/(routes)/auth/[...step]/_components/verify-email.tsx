"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSignUp } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { AuthLayout } from "./auth-layout";

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
      console.error(err);
      setError("Nieprawidłowy kod. Spróbuj ponownie.");
      setLoading(false);
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
        onClick={handleVerify}
        disabled={!isCodeComplete || loading}
        className="mt-6"
      >
        {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
        Weryfikuj
      </Button>
    </AuthLayout>
  );
}
