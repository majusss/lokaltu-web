"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface NfcTagResult {
  id: string;
  content: string;
}

declare global {
  interface Window {
    AndroidBridge?: {
      postMessage: (json: string) => void;
    };
  }
}

// Local type definitions for Web NFC API (not in TS stdlib)
interface NDEFRecord {
  recordType: string;
  encoding?: string;
  data: DataView;
}
interface NDEFMessage {
  records: NDEFRecord[];
}
interface NDEFReadingEvent {
  serialNumber: string;
  message: NDEFMessage;
}
interface NDEFReaderInstance {
  scan(): Promise<void>;
  addEventListener(
    type: "reading",
    listener: (event: NDEFReadingEvent) => void,
  ): void;
  addEventListener(type: "readingerror", listener: () => void): void;
}

function sendToNative(type: string, payload?: object) {
  window.AndroidBridge?.postMessage(JSON.stringify({ type, ...payload }));
}

export function useNfc() {
  const [scanning, setScanning] = useState(false);
  const [nfcData, setNfcData] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isNativeApp, setIsNativeApp] = useState(false);

  // Refs so we can resolve/reject the promise from startScan()
  const resolveRef = useRef<((result: NfcTagResult) => void) | null>(null);
  const rejectRef = useRef<((reason: Error) => void) | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Detect native WebView once on mount
  useEffect(() => {
    setIsNativeApp(!!window.AndroidBridge);
  }, []);

  // Handle messages from the native bridge
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      let data: { type: string; payload?: Record<string, string> };
      try {
        data =
          typeof event.data === "string" ? JSON.parse(event.data) : event.data;
      } catch {
        return;
      }

      if (data.type === "NFC_TAG_DETECTED") {
        const result: NfcTagResult = {
          id: data.payload?.id ?? "",
          content: data.payload?.content ?? data.payload?.id ?? "",
        };

        // Update reactive state
        setNfcData(result.content);
        setError("");
        setScanning(false);

        // Resolve the promise (if startScan() was awaited)
        clearTimeout(timeoutRef.current ?? undefined);
        resolveRef.current?.(result);
        resolveRef.current = null;
        rejectRef.current = null;
      }

      if (data.type === "NFC_ERROR") {
        const msg: string =
          data.payload?.message ?? "Błąd skanowania NFC.";

        setError(msg);
        setScanning(false);

        clearTimeout(timeoutRef.current ?? undefined);
        rejectRef.current?.(new Error(msg));
        resolveRef.current = null;
        rejectRef.current = null;
      }
    };

    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  const stopScan = useCallback(() => {
    sendToNative("STOP_NFC_SCAN");
    clearTimeout(timeoutRef.current ?? undefined);
    const err = new Error("Skanowanie anulowane.");
    rejectRef.current?.(err);
    resolveRef.current = null;
    rejectRef.current = null;
    setScanning(false);
  }, []);

  /**
   * Start an NFC scan.
   *
   * - In the native Android WebView: asks Kotlin via the bridge and returns a
   *   Promise that resolves when a tag is read.
   * - In a regular browser: falls back to the Web NFC API (Chrome-only).
   *
   * @param timeoutMs How long to wait before rejecting (default: 30 s)
   */
  const startScan = useCallback(
    (timeoutMs = 30_000): Promise<NfcTagResult> => {
      setScanning(true);
      setError("");
      setNfcData("");

      // ── Native Android path ───────────────────────────────────────────────
      if (window.AndroidBridge) {
        return new Promise<NfcTagResult>((resolve, reject) => {
          resolveRef.current = resolve;
          rejectRef.current = reject;

          sendToNative("START_NFC_SCAN");

          timeoutRef.current = setTimeout(() => {
            sendToNative("STOP_NFC_SCAN");
            const err = new Error("Upłynął czas oczekiwania. Spróbuj ponownie.");
            setError(err.message);
            setScanning(false);
            reject(err);
            resolveRef.current = null;
            rejectRef.current = null;
          }, timeoutMs);
        });
      }

      // ── Web NFC fallback (Chrome on Android, not in WebView) ──────────────
      return new Promise<NfcTagResult>(async (resolve, reject) => {
        try {
          if (!("NDEFReader" in window)) {
            throw new Error(
              "Przeglądarka nie wspiera Web NFC API. Użyj aplikacji mobilnej.",
            );
          }

          // NDEFReader is not in TypeScript's lib – cast via unknown first
          const NdefReaderClass = (window as unknown as { NDEFReader: new () => NDEFReaderInstance }).NDEFReader;
          const ndef = new NdefReaderClass();
          await ndef.scan();

          const safetyTimer = setTimeout(() => {
            setScanning(false);
            reject(new Error("Upłynął czas oczekiwania. Spróbuj ponownie."));
          }, timeoutMs);

          ndef.addEventListener("readingerror", () => {
            clearTimeout(safetyTimer);
            const err = new Error("Błąd odczytu tagu NFC. Spróbuj ponownie.");
            setError(err.message);
            setScanning(false);
            reject(err);
          });

          ndef.addEventListener(
            "reading",
            ({ message, serialNumber }: NDEFReadingEvent) => {
              clearTimeout(safetyTimer);
              const id: string = serialNumber || "unknown";
              let content = id;

              for (const record of message.records) {
                if (record.recordType === "text") {
                  content = new TextDecoder(record.encoding).decode(
                    record.data,
                  );
                  break;
                }
              }

              const result: NfcTagResult = { id, content };
              setNfcData(content);
              setScanning(false);
              resolve(result);
            },
          );
        } catch (err: unknown) {
          const msg =
            err instanceof Error ? err.message : "Wystąpił błąd podczas skanowania NFC.";
          setError(msg);
          setScanning(false);
          reject(err instanceof Error ? err : new Error(msg));
        }
      });
    },
    [],
  );

  return {
    scanning,
    nfcData,
    error,
    isNativeApp,
    startScan,
    stopScan,
  };
}
