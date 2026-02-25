"use client";

import { Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { ScanLayout } from "../scan-layout";

const TRIVIA = [
  "Czy wiesz, że używając torby wielorazowej oszczędzasz średnio 500 foliówek rocznie?",
  "Średnia długość życia torby foliowej to 12 minut, a rozkłada się ona nawet 500 lat.",
  "Recykling jednej szklanej butelki oszczędza tyle energii, ile potrzeba do świecenia 100W żarówki przez 4 godziny.",
  "W Polsce rocznie marnuje się prawie 5 milionów ton żywności.",
  "Kupując produkty lokalne, znacząco redukujesz ślad węglowy związany z transportem.",
  "Produkcja 1 kg wołowiny pochłania aż 15 tysięcy litrów wody.",
  "Aluminium można przetwarzać w nieskończoność bez utraty jego jakości.",
  "Produkty sezonowe mają najwyższą wartość odżywczą, ponieważ są zbierane w pełni dojrzałości.",
  "Jedna tona makulatury pozwala uratować przed wycięciem 17 drzew.",
  "Kawa wypita we własnym kubku smakuje lepiej i oszczędza setki papierowych kubeczków rocznie.",
  "90% kosztów wody butelkowanej to cena za plastikową butelkę i marketing, a nie samą wodę.",
  "Warzywa i owoce przechowywane bez plastiku zachowują świeżość dłużej, jeśli mają dostęp do powietrza.",
  "Szklane opakowania są w 100% bezpieczne dla żywności i nie przenikają do niej żadne substancje.",
  "Planując zakupy z listą, ograniczasz zakup niepotrzebnych rzeczy nawet o 30%.",
  "Niemal 1/3 całej wyprodukowanej na świecie żywności ląduje w koszu.",
];

export default function AnalyzingStep() {
  const [triviaIndex, setTriviaIndex] = useState(0);

  useEffect(() => {
    setTriviaIndex(Math.floor(Math.random() * TRIVIA.length));

    const interval = setInterval(() => {
      setTriviaIndex((current) => (current + 1) % TRIVIA.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <ScanLayout
      title="Analizujemy zakupy"
      subtitle="Nasze AI sprawdza świeżość i zgodność Twoich produktów..."
    >
      <div className="flex flex-col items-center justify-center gap-12 py-16">
        <div className="relative flex h-32 w-32 items-center justify-center">
          <div className="flex h-20 w-20 animate-pulse items-center justify-center rounded-3xl bg-[#44d021]/10">
            <Sparkles className="h-10 w-10 text-[#44d021]" />
          </div>
        </div>

        <div className="space-y-3 text-center">
          <p className="text-xl font-black text-neutral-900">
            Trwa weryfikacja AI
          </p>
          <p className="text-sm font-bold tracking-widest text-neutral-400 uppercase">
            To zajmie tylko chwilę...
          </p>
        </div>
      </div>

      <div className="flex min-h-30 items-center justify-center rounded-3xl bg-neutral-50 p-6 text-center text-sm font-medium text-neutral-500 italic">
        <p className="animate-in fade-in duration-700" key={triviaIndex}>
          "{TRIVIA[triviaIndex]}"
        </p>
      </div>
    </ScanLayout>
  );
}
