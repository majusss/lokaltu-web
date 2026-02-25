import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSignUp } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { AuthLayout } from "./auth-layout";

export default function Welcome() {
  const router = useRouter();
  const { isLoaded, signUp } = useSignUp();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!name || !isLoaded) return;
    setLoading(true);
    setError("");

    try {
      await signUp.update({
        firstName: name,
      });
      router.push("/auth/set-password");
    } catch (err: any) {
      console.error(err);
      const message =
        err.errors?.[0]?.longMessage ||
        err.errors?.[0]?.message ||
        "Wystąpił błąd podczas zapisywania Twojego imienia.";
      setError(message);
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Poznajmy się!"
      subtitle="Jak mamy się do Ciebie zwracać w aplikacji?"
      error={error}
    >
      <Input
        placeholder="Wpisz swoje imię lub pseudonim"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        disabled={loading}
        className="mt-2"
      />

      <Button
        variant="premium"
        onClick={handleSubmit}
        disabled={!name || loading}
        className="mt-6"
      >
        {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
        Kontynuuj
      </Button>
    </AuthLayout>
  );
}
