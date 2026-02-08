"use client";

import { useNativeBridge } from "@/lib/hooks/useNativeBridge";
import { useState } from "react";

export default function NFCReader() {
  const { send, isReady } = useNativeBridge();
  const [nfcData, setNfcData] = useState<string>("");
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string>("");

  const startNFCScan = async () => {
    setScanning(true);
    setError("");
    setNfcData("");

    try {
      const result = await send<
        | { type: "NFC_RESULT"; payload: string }
        | { type: "NFC_ERROR"; error: string }
      >({ type: "REQUEST_NFC" }, 30000);

      if (result.type === "NFC_RESULT") {
        setNfcData(result.payload);
      } else {
        setError(result.error);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "NFC scan failed");
    } finally {
      setScanning(false);
    }
  };

  if (!isReady) {
    return <div>Native bridge not available</div>;
  }

  return (
    <div className="space-y-4 p-8">
      <h1 className="text-2xl font-bold">NFC Reader</h1>

      <button
        onClick={startNFCScan}
        disabled={scanning}
        className="rounded bg-blue-500 px-6 py-3 text-white disabled:opacity-50"
      >
        {scanning ? "📱 Zbliż tag NFC..." : "Skanuj NFC"}
      </button>

      {error && (
        <div className="rounded border border-red-400 bg-red-100 p-4 text-red-700">
          ❌ {error}
        </div>
      )}

      {nfcData && (
        <div className="rounded border border-green-400 bg-green-100 p-4 text-green-700">
          <p className="font-bold">✅ Tag odczytany:</p>
          <p className="mt-2 break-all">{nfcData}</p>
        </div>
      )}
    </div>
  );
}
