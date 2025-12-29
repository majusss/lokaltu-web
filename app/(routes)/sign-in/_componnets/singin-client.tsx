import { Input } from "@/components/ui/input";
import Image from "next/image";

import google from "@/app/assets/sign-in/google.svg";

export default function SignInClient() {
  return (
    <div className="absolute grid h-dvh w-screen place-items-center bg-white/60 backdrop-blur-sm">
      <div className="w-full px-6">
        <h1 className="text-4xl font-semibold">Dołącz do Lokaltu!</h1>
        <p className="text-muted-foreground mt-2">To jest tego warte...</p>
        <Input className="mt-12" placeholder="Email" />
        <p className="text-muted-foreground w-full py-6 text-center font-bold">
          LUB
        </p>
        <div className="flex h-14 w-full rounded-xl bg-white p-4 shadow-xl">
          <Image src={google} alt="Google logo" />
          <p className="w-full text-center text-lg font-semibold">
            Użyj konto Google
          </p>
        </div>
        <p className="mt-4 text-center text-sm text-[#FEFAF6B2]/70">
          Tworząc konto akceptujesz Regulamin i Politykę prywatności
        </p>
      </div>
      <div className="absolute bottom-12 w-full">
        <p className="text-center font-semibold text-white">
          Masz już konto?{" "}
          <a href="/sign-in" className="underline">
            Zaloguj się
          </a>
        </p>
      </div>
    </div>
  );
}
