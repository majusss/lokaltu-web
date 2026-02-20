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

interface CameraBridgeMessage {
  type: "CAMERA_RESULT" | "CAMERA_ERROR";
  payload?: { image?: string; message?: string };
}

export function useCamera() {
  const [capturing, setCapturing] = useState(false);
  const [error, setError] = useState<string>("");

  const resolveRef = useRef<((base64: string) => void) | null>(null);
  const rejectRef = useRef<((err: Error) => void) | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Listen to messages from native bridge
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      let data: CameraBridgeMessage;
      try {
        data =
          typeof event.data === "string" ? JSON.parse(event.data) : event.data;
      } catch {
        return;
      }

      if (data.type === "CAMERA_RESULT") {
        const base64 = data.payload?.image ?? "";
        setCapturing(false);
        setError("");
        resolveRef.current?.(base64);
        resolveRef.current = null;
        rejectRef.current = null;
      }

      if (data.type === "CAMERA_ERROR") {
        const msg = data.payload?.message ?? "Błąd aparatu.";
        setError(msg);
        setCapturing(false);
        rejectRef.current?.(new Error(msg));
        resolveRef.current = null;
        rejectRef.current = null;
      }
    };

    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  // Browser fallback: convert picked file to base64
  const handleFileChange = useCallback(
    (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) {
        const err = new Error("Nie wybrano zdjęcia.");
        setError(err.message);
        setCapturing(false);
        rejectRef.current?.(err);
        resolveRef.current = null;
        rejectRef.current = null;
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Strip data URI prefix if present
        const base64 = result.includes(",") ? result.split(",")[1] : result;
        setCapturing(false);
        resolveRef.current?.(base64 ?? "");
        resolveRef.current = null;
        rejectRef.current = null;
      };
      reader.readAsDataURL(file);
    },
    [],
  );

  /**
   * Opens the native camera (Android) or browser file picker (fallback).
   * Resolves with a base64-encoded JPEG string.
   */
  const takePicture = useCallback((): Promise<string> => {
    setCapturing(true);
    setError("");

    // ── Native Android ────────────────────────────────────────────────────
    if (window.AndroidBridge) {
      return new Promise<string>((resolve, reject) => {
        resolveRef.current = resolve;
        rejectRef.current = reject;
        sendToNative("OPEN_CAMERA");
      });
    }

    // ── Browser fallback: hidden file input ───────────────────────────────
    return new Promise<string>((resolve, reject) => {
      resolveRef.current = resolve;
      rejectRef.current = reject;

      // Re-use or create hidden input
      if (!fileInputRef.current) {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";
        input.capture = "environment";
        input.style.display = "none";
        document.body.appendChild(input);
        fileInputRef.current = input;
      }

      const input = fileInputRef.current;
      // Remove previous listener to avoid duplicates
      const newInput = input.cloneNode() as HTMLInputElement;
      input.replaceWith(newInput);
      fileInputRef.current = newInput;
      newInput.addEventListener("change", handleFileChange, { once: true });
      newInput.click();
    });
  }, [handleFileChange]);

  return { capturing, error, takePicture };
}
