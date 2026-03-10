"use client";

import { useCallback, useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    AndroidBridge?: {
      postMessage: (json: string) => void;
    };
  }
}

function sendToNative(type: string, payload?: object) {
  window.AndroidBridge?.postMessage(JSON.stringify({ type, ...payload }));
}

interface QrBridgeMessage {
  type: "QR_SCAN_RESULT" | "QR_SCAN_ERROR" | "QR_SCAN_CANCELLED";
  payload?: { value?: string; message?: string };
}

export function useQrScanner() {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string>("");

  const resolveRef = useRef<((value: string) => void) | null>(null);
  const rejectRef = useRef<((err: Error) => void) | null>(null);

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      let data: QrBridgeMessage;
      try {
        data =
          typeof event.data === "string" ? JSON.parse(event.data) : event.data;
      } catch {
        return;
      }

      if (data.type === "QR_SCAN_RESULT") {
        const value = data.payload?.value ?? "";
        setScanning(false);
        setError("");
        resolveRef.current?.(value);
        resolveRef.current = null;
        rejectRef.current = null;
      }

      if (data.type === "QR_SCAN_ERROR") {
        const msg = data.payload?.message ?? "Błąd skanowania QR.";
        setError(msg);
        setScanning(false);
        rejectRef.current?.(new Error(msg));
        resolveRef.current = null;
        rejectRef.current = null;
      }

      if (data.type === "QR_SCAN_CANCELLED") {
        setScanning(false);
        setError("");
        rejectRef.current?.(new Error("cancelled"));
        resolveRef.current = null;
        rejectRef.current = null;
      }
    };

    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  /**
   * Opens the native QR code scanner.
   * Resolves with the scanned string value.
   * Rejects if cancelled or on error.
   */
  const scanQr = useCallback((): Promise<string> => {
    setScanning(true);
    setError("");

    if (window.AndroidBridge) {
      return new Promise<string>((resolve, reject) => {
        resolveRef.current = resolve;
        rejectRef.current = reject;
        sendToNative("SCAN_QR");
      });
    }

    // No native bridge available
    setScanning(false);
    return Promise.reject(
      new Error("Skanowanie QR jest dostępne tylko w aplikacji mobilnej."),
    );
  }, []);

  return { scanning, error, scanQr };
}
