"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { Fragment, useState } from "react";

export default function Welcome() {
  const router = useRouter();
  const [name, setName] = useState("");

  const handleSubmit = () => {
    if (name) {
      router.push("/");
    }
  };

  return (
    <Fragment>
      <h1 className="text-4xl font-semibold">Witamy...!</h1>
      <p className="text-muted-foreground mt-2">
        Pozwól nam poznać Cię trochę bliżej
      </p>

      <Input
        className="mt-12"
        placeholder="Wpisz tu swoje imię lub pseudonim"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
      />

      <Button className="mt-8 w-full" onClick={handleSubmit} disabled={!name}>
        Zakończ
      </Button>
    </Fragment>
  );
}
