"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { Fragment, useState } from "react";

export default function SetPassword() {
  const router = useRouter();
  const [password, setPassword] = useState("");

  const handleSubmit = () => {
    if (password && password.length >= 8) {
      router.push("/auth/welcome");
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
      />

      {password && password.length < 8 && (
        <p className="mt-2 text-sm text-red-500">
          Hasło musi mieć minimum 8 znaków
        </p>
      )}

      <Button
        className="mt-8 w-full"
        onClick={handleSubmit}
        disabled={!isValid}
      >
        Dalej
      </Button>
    </Fragment>
  );
}
