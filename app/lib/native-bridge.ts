import type { NativeMessage, NativeMessageListener } from "./types/native";

interface NativeBridgeAPI {
  postMessage: (json: string) => void;
  _subscribe: (listener: NativeMessageListener) => () => void;
}

interface NativeGlobal {
  __nativeReady: (ready: boolean) => void;
  __nativeDispatch: (message: NativeMessage) => void;
  AndroidBridge?: NativeBridgeAPI;
}

declare global {
  interface Window extends NativeGlobal {}
}

let nativePostMessage: ((json: string) => void) | null = null;
let isNativeReady = false;
let readyPromise: Promise<boolean> | null = null;
let earlyLogs: Array<{ type: "send" | "receive"; message: NativeMessage }> = [];
let isInitialized = false;
let listeners: Set<NativeMessageListener> = new Set();
let isDispatching = false;

const MAX_EARLY_LOGS = 100;

const createReadyPromise = () => {
  if (typeof window === "undefined") return Promise.resolve(false);

  return new Promise<boolean>((resolve) => {
    let resolved = false;

    const cleanup = () => {
      if (resolved) return;
      resolved = true;
      clearTimeout(timeoutId);
      delete window.__nativeReady;
    };

    const timeoutId = setTimeout(() => {
      cleanup();
      resolve(false);
    }, 2000);

    window.__nativeReady = (ready: boolean) => {
      if (resolved) return;
      isNativeReady = ready;
      cleanup();
      resolve(ready);
    };
  });
};

export function initNativeBridge() {
  if (typeof window === "undefined") return;
  if (isInitialized) return;

  isInitialized = true;

  if (typeof window.AndroidBridge?.postMessage === "function") {
    nativePostMessage = window.AndroidBridge.postMessage.bind(
      window.AndroidBridge,
    );
  }

  window.__nativeDispatch = (message: NativeMessage) => {
    if (isDispatching) return;
    isDispatching = true;

    try {
      if (earlyLogs.length >= MAX_EARLY_LOGS) {
        earlyLogs.shift();
      }
      earlyLogs.push({ type: "receive", message });

      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("nativeMessageReceived", {
            detail: { type: "receive", message },
          }),
        );
      }

      listeners.forEach((listener) => {
        try {
          listener(message);
        } catch (error) {
          console.error(
            "[NativeBridge] Listener error:",
            error instanceof Error ? error.message : error,
          );
        }
      });
    } finally {
      isDispatching = false;
    }
  };

  const bridge = {
    postMessage: (json: string) => {
      try {
        JSON.parse(json);
        if (nativePostMessage) {
          nativePostMessage(json);
        }
      } catch (error) {
        console.error("[NativeBridge]", error);
      }
    },
    _subscribe: (listener: NativeMessageListener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };

  window.AndroidBridge = bridge;

  if (nativePostMessage) {
    const readyMessage: NativeMessage = { type: "APP_READY" };
    try {
      if (earlyLogs.length >= MAX_EARLY_LOGS) {
        earlyLogs.shift();
      }
      earlyLogs.push({ type: "send", message: readyMessage });
      nativePostMessage(JSON.stringify(readyMessage));
    } catch (error) {
      console.error("[NativeBridge]", error);
    }
  } else {
    isNativeReady = false;
  }
}

export function sendNativeMessage(message: NativeMessage) {
  if (typeof window === "undefined") return;

  if (earlyLogs.length >= MAX_EARLY_LOGS) {
    earlyLogs.shift();
  }
  earlyLogs.push({ type: "send", message });

  window.dispatchEvent(
    new CustomEvent("nativeMessageReceived", {
      detail: { type: "send", message },
    }),
  );

  window.AndroidBridge?.postMessage?.(JSON.stringify(message));
}

export function subscribeToNative(listener: NativeMessageListener): () => void {
  if (typeof window === "undefined") return () => {};
  return window.AndroidBridge?._subscribe?.(listener) ?? (() => {});
}

export function isNativeEnvironment(): boolean {
  if (typeof window === "undefined") return false;
  return typeof window.AndroidBridge?.postMessage === "function";
}

export async function waitForNativeReady(): Promise<boolean> {
  if (!readyPromise) {
    readyPromise = createReadyPromise();
  }
  return readyPromise;
}

export function getEarlyLogs() {
  return earlyLogs;
}

export function clearEarlyLogs() {
  earlyLogs = [];
}
