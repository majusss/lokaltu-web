import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSignUp } from "@clerk/nextjs";
import { AlertCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Fragment, useState } from "react";

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
    } catch (err) {
      console.error(err);
      setError("Wystąpił błąd podczas zapisywania.");
      setLoading(false);
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
        disabled={loading}
      />

      {error && (
        <div className="bg-destructive/15 text-destructive mt-4 flex items-center gap-2 rounded-md p-3 text-sm">
          <AlertCircle className="h-4 w-4" />
          <p>{error}</p>
        </div>
      )}

      <Button
        className="mt-8 w-full"
        onClick={handleSubmit}
        disabled={!name || loading}
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Dalej
      </Button>
    </Fragment>
  );
}
