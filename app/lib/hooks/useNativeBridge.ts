"use client";

import { useEffect, useMemo, useRef } from "react";

type NativeMessage =
  | { type: "APP_READY" }
  | { type: "APP_READY_ACK" }
  | { type: "REQUEST_NFC" }
  | { type: "NFC_RESULT"; payload: string }
  | { type: "NFC_ERROR"; error: string }
  | { type: "REGISTER_PUSH_TOKEN"; token: string }
  | {
      type: "PUSH_NOTIFICATION";
      title: string;
      body: string;
      data?: Record<string, string>;
    }
  | { type: "PERMISSION_REQUEST"; permission: string }
  | { type: "PERMISSION_RESULT"; permission: string; granted: boolean };

interface NativeBridgeAPI {
  postMessage: (json: string) => void;
}

declare global {
  interface Window {
    AndroidBridge?: NativeBridgeAPI;
    __nativeDispatch?: (msg: NativeMessage) => void;
    __nativeReady?: (ready: boolean) => void;
  }
}

let bridgeInitialized = false;

function initBridge() {
  if (typeof window === "undefined" || bridgeInitialized) return;

  if (!window.AndroidBridge?.postMessage) {
    return;
  }

  bridgeInitialized = true;

  try {
    window.AndroidBridge.postMessage(JSON.stringify({ type: "APP_READY" }));
  } catch (e) {
    console.error("[Bridge]", e);
  }
}

export function useNativeBridge() {
  const isReady = useMemo(
    () => typeof window !== "undefined" && !!window.AndroidBridge?.postMessage,
    []
  );
  const pendingRequests = useRef(
    new Map<string, (msg: NativeMessage) => void>()
  );
  const requestId = useRef(0);
  const messageHandler = useRef<((msg: NativeMessage) => void) | null>(null);

  useEffect(() => {
    initBridge();

    if (!isReady) return;

    messageHandler.current = (msg: NativeMessage) => {
      pendingRequests.current.forEach((resolve) => {
        resolve(msg);
      });
      pendingRequests.current.clear();
    };

    window.__nativeDispatch = messageHandler.current;

    return () => {
      window.__nativeDispatch = undefined;
    };
  }, [isReady]);

  const send = async <T extends NativeMessage>(
    message: NativeMessage,
    timeoutMs = 5000
  ): Promise<T> => {
    if (!isReady || !window.AndroidBridge) {
      throw new Error("Native bridge not available");
    }

    const id = String(requestId.current++);

    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        pendingRequests.current.delete(id);
        reject(new Error("Native request timeout"));
      }, timeoutMs);

      pendingRequests.current.set(id, (msg) => {
        clearTimeout(timer);
        resolve(msg as T);
      });

      try {
        window.AndroidBridge!.postMessage(JSON.stringify(message));
      } catch (e) {
        clearTimeout(timer);
        pendingRequests.current.delete(id);
        reject(e);
      }
    });
  };

  return { send, isReady };
}
