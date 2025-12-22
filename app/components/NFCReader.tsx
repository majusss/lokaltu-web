"use client";

import { useState } from "react";
import { useNativeBridge } from "../lib/hooks/useNativeBridge";

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
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-bold">NFC Reader</h1>

      <button
        onClick={startNFCScan}
        disabled={scanning}
        className="bg-blue-500 text-white px-6 py-3 rounded disabled:opacity-50"
      >
        {scanning ? "📱 Zbliż tag NFC..." : "Skanuj NFC"}
      </button>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded">
          ❌ {error}
        </div>
      )}

      {nfcData && (
        <div className="bg-green-100 border border-green-400 text-green-700 p-4 rounded">
          <p className="font-bold">✅ Tag odczytany:</p>
          <p className="mt-2 break-all">{nfcData}</p>
        </div>
      )}
    </div>
  );
}
