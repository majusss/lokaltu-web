"use client";

import { analyzeReceipt, verifyBag } from "@/app/actions/scan";
import { Button } from "@/components/ui/button";
import { useCamera } from "@/lib/hooks/use-camera";
import { useNfc } from "@/lib/hooks/use-nfc";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  Camera,
  CheckCircle2,
  Nfc,
  RotateCcw,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import { useCallback, useState } from "react";

type Step = "idle" | "scanning_nfc" | "camera_ready" | "analyzing" | "result" | "error";

interface ScanResult {
  confidence: number;
  reasoning: string;
}

// ── Pulsing NFC ring animation (Green/Yellow) ─────────────────────────────────
function NfcPulse() {
  return (
    <div className="relative flex items-center justify-center">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="absolute rounded-full border-2 border-green-400/40 animate-ping"
          style={{
            width: `${5 + i * 3}rem`,
            height: `${5 + i * 3}rem`,
            animationDelay: `${i * 0.35}s`,
            animationDuration: "1.8s",
          }}
        />
      ))}
      <div className="relative z-10 flex h-20 w-20 items-center justify-center rounded-full bg-main shadow-xl shadow-green-500/20">
        <Nfc className="h-10 w-10 text-white" strokeWidth={1.5} />
      </div>
    </div>
  );
}

// ── Progress indicator (Green Theme) ──────────────────────────────────────────
function StepIndicator({ step }: { step: Step }) {
  const steps: { id: Step | "nfc"; label: string }[] = [
    { id: "scanning_nfc", label: "NFC" },
    { id: "camera_ready", label: "Zdjęcie" },
    { id: "analyzing", label: "AI" },
    { id: "result", label: "Wynik" },
  ];

  const order: Step[] = ["scanning_nfc", "camera_ready", "analyzing", "result"];
  const currentIdx = order.indexOf(step);

  return (
    <div className="flex items-center gap-2">
      {steps.map((s, i) => (
        <div key={s.id} className="flex items-center gap-2">
          <div
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all duration-500",
              i < currentIdx
                ? "bg-green-500 text-white"
                : i === currentIdx
                  ? "bg-main text-white ring-4 ring-green-100"
                  : "bg-neutral-200 text-neutral-500",
            )}
          >
            {i < currentIdx ? "✓" : i + 1}
          </div>
          <span
            className={cn(
              "text-xs font-semibold",
              i === currentIdx ? "text-green-600" : "text-neutral-400",
            )}
          >
            {s.label}
          </span>
          {i < steps.length - 1 && (
            <div
              className={cn(
                "h-0.5 w-4 rounded-full transition-all duration-500 @sm:w-6",
                i < currentIdx ? "bg-green-400" : "bg-neutral-200",
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// ── Confidence ring (Match app theme) ─────────────────────────────────────────
function ConfidenceRing({ value }: { value: number }) {
  const r = 52;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  
  // Custom colors based on confidence
  const color =
    value >= 70 ? "#44d021" : value >= 40 ? "#f2da00" : "#ef4444";

  return (
    <div className="relative flex items-center justify-center">
      <svg width="140" height="140" className="-rotate-90">
        <circle
          cx="70"
          cy="70"
          r={r}
          stroke="#e5e7eb"
          strokeWidth="10"
          fill="none"
        />
        <circle
          cx="70"
          cy="70"
          r={r}
          stroke={color}
          strokeWidth="10"
          fill="none"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-extrabold text-neutral-900">
          {value}%
        </span>
        <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">pewność</span>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function NFCReader() {
  const { startScan } = useNfc();
  const { takePicture } = useCamera();

  const [step, setStep] = useState<Step>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [result, setResult] = useState<ScanResult | null>(null);

  const handleError = useCallback((msg: string) => {
    setErrorMsg(msg);
    setStep("error");
  }, []);

  const handleStart = useCallback(async () => {
    setErrorMsg("");
    setResult(null);
    setStep("scanning_nfc");

    try {
      // 1. NFC scan
      const tag = await startScan(30_000);

      // 2. Verify bag ownership on server
      const verify = await verifyBag(tag.content);
      if (!verify.ok) {
        handleError(verify.error ?? "Weryfikacja torby nieudana.");
        return;
      }

      // 3. Camera
      setStep("camera_ready");
    } catch (e) {
      handleError(e instanceof Error ? e.message : "Błąd skanowania NFC.");
    }
  }, [startScan, handleError]);

  const handleTakePhoto = useCallback(async () => {
    try {
      const base64 = await takePicture();
      setStep("analyzing");

      // 4. AI analysis
      const aiResult = await analyzeReceipt(base64);
      setResult(aiResult);
      setStep("result");
    } catch (e) {
      handleError(e instanceof Error ? e.message : "Błąd aparatu lub AI.");
    }
  }, [takePicture, handleError]);

  const handleReset = () => {
    setStep("idle");
    setResult(null);
    setErrorMsg("");
  };

  return (
    <div className="flex min-h-[calc(100vh-10rem)] flex-col items-center justify-center gap-10 px-6 py-8">
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-main shadow-lg shadow-green-500/20">
          <ShoppingBag className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-3xl font-black tracking-tight text-neutral-900">
          Skanuj zakupy
        </h1>
        <p className="mt-2 text-base font-semibold text-neutral-400">
          Zeskanuj torbę i zrób zdjęcie zakupów
        </p>
      </div>

      {/* Step indicator */}
      {step !== "idle" && step !== "error" && (
        <div className="animate-in fade-in slide-in-from-top-3">
          <StepIndicator step={step} />
        </div>
      )}

      <div className="w-full max-w-sm">
        {/* ── idle ── */}
        {step === "idle" && (
          <div className="animate-in fade-in zoom-in-95 space-y-6">
            <div className="flex flex-col items-center gap-6 rounded-3xl border border-neutral-100 bg-white p-8 shadow-sm">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-green-50">
                <Nfc className="h-12 w-12 text-green-500" strokeWidth={1.5} />
              </div>
              <p className="text-center text-sm font-bold leading-relaxed text-neutral-500">
                Zbliż telefon do tagu NFC na torbie, a następnie zrób zdjęcie
                zakupów do błyskawicznej weryfikacji przez AI.
              </p>
            </div>

            <Button
              variant="premium"
              size="xl"
              onClick={handleStart}
              className="w-full"
            >
              <Nfc className="mr-2 h-6 w-6" />
              Rozpocznij skanowanie
            </Button>
          </div>
        )}

        {/* ── scanning_nfc ── */}
        {step === "scanning_nfc" && (
          <div className="animate-in fade-in zoom-in-95 flex flex-col items-center gap-10 py-4">
            <NfcPulse />
            <div className="text-center">
              <p className="text-2xl font-black text-neutral-900">
                Przytknij torbę
              </p>
              <p className="mt-2 text-sm font-bold text-neutral-400">
                Szukamy Twojego tagu NFC...
              </p>
            </div>
          </div>
        )}

        {/* ── camera_ready ── */}
        {step === "camera_ready" && (
          <div className="animate-in fade-in zoom-in-95 space-y-6">
            <div className="flex flex-col items-center gap-6 rounded-3xl border border-green-100 bg-green-50 p-8 shadow-sm">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm">
                <CheckCircle2 className="h-9 w-9 text-green-500" />
              </div>
              <div className="text-center">
                <p className="text-xl font-black text-neutral-900">Torba OK!</p>
                <p className="mt-2 text-sm font-bold leading-relaxed text-neutral-500">
                  Wszystko się zgadza. Teraz zrób zdjęcie swoich zakupów.
                </p>
              </div>
            </div>
            <Button
              variant="premium"
              size="xl"
              onClick={handleTakePhoto}
              className="w-full"
            >
              <Camera className="mr-2 h-6 w-6" />
              Zrób zdjęcie
            </Button>
          </div>
        )}

        {/* ── analyzing ── */}
        {step === "analyzing" && (
          <div className="animate-in fade-in zoom-in-95 flex flex-col items-center gap-8 py-10">
            <div className="relative flex h-24 w-24 items-center justify-center">
              <div className="absolute inset-0 animate-spin rounded-full border-4 border-neutral-100 border-t-green-500" />
              <Sparkles className="h-10 w-10 text-green-500 pulse" />
            </div>
            <div className="text-center">
              <p className="text-2xl font-black text-neutral-900">Analizujemy...</p>
              <p className="mt-2 text-sm font-bold text-neutral-400">
                Nasze AI sprawdza świeżość zakupów 🛒
              </p>
            </div>
          </div>
        )}

        {/* ── result ── */}
        {step === "result" && result && (
          <div className="animate-in fade-in zoom-in-95 space-y-6">
            <div className="flex flex-col items-center gap-6 rounded-3xl border border-neutral-100 bg-white p-8 shadow-sm">
              <ConfidenceRing value={result.confidence} />
              <p className="text-center text-sm font-bold leading-relaxed text-neutral-500">
                {result.reasoning}
              </p>
            </div>

            <div
              className={cn(
                "flex items-center gap-3 rounded-2xl border p-5 text-sm font-black uppercase tracking-tight",
                result.confidence >= 70
                  ? "border-green-100 bg-green-50 text-green-700"
                  : result.confidence >= 40
                    ? "border-yellow-100 bg-yellow-50 text-yellow-700"
                    : "border-red-100 bg-red-50 text-red-700",
              )}
            >
              <Sparkles className="h-5 w-5 shrink-0" />
              {result.confidence >= 70
                ? "Zakupy zweryfikowane pozytywnie!"
                : result.confidence >= 40
                  ? "Wynik niepewny – spróbuj ponownie."
                  : "Weryfikacja odrzucona."}
            </div>

            <Button
              variant="outline"
              size="lg"
              onClick={handleReset}
              className="w-full border-neutral-200 text-neutral-500 hover:bg-neutral-50"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Skanuj ponownie
            </Button>
          </div>
        )}

        {/* ── error ── */}
        {step === "error" && (
          <div className="animate-in fade-in zoom-in-95 space-y-6">
            <div className="flex flex-col items-center gap-4 rounded-2xl border border-red-100 bg-red-50 p-6">
              <AlertCircle className="h-10 w-10 text-red-500" />
              <p className="text-center text-sm font-black text-red-600 uppercase tracking-tight">
                {errorMsg}
              </p>
            </div>
            <Button
              variant="premium"
              size="lg"
              onClick={handleReset}
              className="w-full bg-red-500 hover:bg-red-600"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Spróbuj jeszcze raz
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
