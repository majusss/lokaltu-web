"use client";

import { useTwaBridge } from "@/lib/hooks/use-twa-bridge";
import { useEffect, useState } from "react";

export default function NFCReader() {
  const { isReady, postToAndroid, addListener } = useTwaBridge();
  const [nfcData, setNfcData] = useState<string>("");
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const removeListener = addListener((msg) => {
      if (msg.type === "NFC_TAG_DETECTED") {
        const { id, content } =
          (msg.payload as { id?: string; content?: string }) || {};
        setNfcData(content || id || "Unknown Tag Content");
        setScanning(false);
      } else if (msg.type === "NFC_ERROR") {
        const { message } = (msg.payload as { message?: string }) || {};
        setError(message || "Wystąpił błąd podczas skanowania NFC");
        setScanning(false);
      }
    });

    return () => {
      removeListener();
    };
  }, [addListener]);

  const startNFCScan = () => {
    setScanning(true);
    setError("");
    setNfcData("");

    postToAndroid("REQUEST_NFC");

    // Safety timeout for UI state
    setTimeout(() => {
      setScanning(false);
    }, 30000);
  };

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

      {/* Debug & Mock Section */}
      <div className="mt-12 space-y-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              setScanning(true);
              setTimeout(() => {
                window.dispatchEvent(
                  new MessageEvent("message", {
                    data: {
                      type: "NFC_TAG_DETECTED",
                      payload: {
                        id: "TAG_123",
                        content: "MOCKED_SUCCESS_RESULT",
                      },
                    },
                  }),
                );
                setScanning(false);
              }, 1200);
            }}
            className="rounded bg-gray-600 px-3 py-1.5 text-[10px] font-bold text-white uppercase transition-colors hover:bg-gray-500"
          >
            Simulate Success
          </button>
          <button
            onClick={() => {
              setScanning(true);
              setTimeout(() => {
                setError("MOCKED_ERROR: Device timed out");
                setScanning(false);
              }, 1000);
            }}
            className="rounded bg-gray-600 px-3 py-1.5 text-[10px] font-bold text-white uppercase transition-colors hover:bg-gray-500"
          >
            Simulate Error
          </button>
          <button
            onClick={() => {
              setNfcData("");
              setError("");
              setScanning(false);
            }}
            className="ml-auto rounded bg-red-950 px-3 py-1.5 text-[10px] font-bold text-white uppercase transition-colors hover:bg-red-900"
          >
            Reset
          </button>
        </div>

        <div className="rounded-xl border border-gray-800 bg-black p-4 font-mono text-[10px] leading-tight text-green-400 shadow-2xl">
          <div className="mb-3 flex items-center justify-between border-b border-gray-800 pb-2">
            <span className="font-black tracking-widest text-gray-500 uppercase">
              TWA Opener Bridge Inspector
            </span>
            <span
              className={`flex items-center gap-1.5 font-bold ${isReady ? "text-green-500" : "text-red-500"}`}
            >
              <span className="relative flex h-2 w-2">
                <span
                  className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${isReady ? "bg-green-400" : "bg-red-400"}`}
                ></span>
                <span
                  className={`relative inline-flex h-2 w-2 rounded-full ${isReady ? "bg-green-500" : "bg-red-500"}`}
                ></span>
              </span>
              {isReady ? "CONNECTED" : "OFFLINE"}
            </span>
          </div>
          <pre className="scrollbar-hide max-h-64 overflow-auto py-1">
            {JSON.stringify(
              {
                bridge: {
                  isReady,
                  hasOpener: typeof window !== "undefined" && !!window.opener,
                },
                appState: {
                  scanning,
                  hasData: !!nfcData,
                  hasError: !!error,
                },
                payloads: {
                  error,
                  nfcData,
                },
                meta: {
                  timestamp: new Date().toLocaleTimeString(),
                },
              },
              null,
              2,
            )}
          </pre>
        </div>
      </div>
    </div>
  );
}
