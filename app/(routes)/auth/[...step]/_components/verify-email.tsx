"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { Fragment, useState } from "react";

export default function VerifyEmail() {
  const router = useRouter();
  const [code, setCode] = useState(["", "", "", ""]);

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

  const handleVerify = () => {
    const fullCode = code.join("");
    if (fullCode.length === 6) {
      router.push("/auth/set-password");
    }
  };

  const isCodeComplete = code.every((digit) => digit !== "");

  return (
    <Fragment>
      <h1 className="text-4xl font-semibold">Wprowadź kod</h1>
      <p className="text-muted-foreground mt-2">
        Wysłaliśmy na Twój email 5 cyfr potrzebnych by zweryfikować konto
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
            />
          </div>
        ))}
      </div>

      <Button
        className="mt-8 w-full"
        onClick={handleVerify}
        disabled={!isCodeComplete}
      >
        Weryfikuj
      </Button>

      <p className="mt-4 text-center text-sm text-white/70">
        Nie otrzymałeś kodu?{" "}
        <button className="font-semibold underline">Wyślij ponownie</button>
      </p>
    </Fragment>
  );
}
