"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { Fragment, useState } from "react";

export default function EnterPassword() {
  const router = useRouter();
  const [password, setPassword] = useState("");

  const handleSubmit = () => {
    if (password) {
      router.push("/");
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
      />

      <Button
        className="mt-8 w-full"
        onClick={handleSubmit}
        disabled={!password}
      >
        Zaloguj się
      </Button>

      <p className="mt-4 text-center text-sm text-white/70">
        Zapomniałeś hasła?{" "}
        <button className="font-semibold underline">Zresetuj hasło</button>
      </p>
    </Fragment>
  );
}
