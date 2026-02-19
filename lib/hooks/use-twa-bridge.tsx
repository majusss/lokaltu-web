"use client";

import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

type TWAAction =
  | "REQUEST_NFC"
  | "BRIDGE_READY"
  | "NFC_TAG_DETECTED"
  | "NFC_ERROR"
  | "APP_READY";

interface TWAMessage {
  type: TWAAction;
  payload?: Record<string, unknown>;
}

interface TwaBridgeContextType {
  isReady: boolean;
  postToAndroid: (type: TWAAction, payload?: Record<string, unknown>) => void;
  addListener: (callback: (msg: TWAMessage) => void) => () => void;
}

const TwaBridgeContext = createContext<TwaBridgeContextType | null>(null);

declare global {
  interface Window {
    AndroidBridge?: {
      postMessage: (json: string) => void;
    };
  }
}

export function TwaBridgeProvider({
  children,
}: {
  children: ReactNode;
}): React.ReactNode {
  const [isReady, setIsReady] = useState(false);
  const messageListeners = useRef<Set<(msg: TWAMessage) => void>>(new Set());
  const portRef = useRef<MessagePort | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // WebView Mode: Check for native bridge interface
    if (window.AndroidBridge) {
      console.log(
        "[Bridge] 📱 Native AndroidBridge detected! Skipping port handshake.",
      );
      // Use queueMicrotask to avoid "cascading render" lint error
      queueMicrotask(() => setIsReady(true));
      return;
    }

    const handleInitialMessage = (event: MessageEvent) => {
      // TWA/Port Mode fallback
      const port = event.ports[0];
      if (!port) return;

      console.log(
        "[TWA Bridge] ⚓ Port received! Establishing communication channel...",
      );
      portRef.current = port;
      setIsReady(true);

      port.onmessage = (portEvent) => {
        let message = portEvent.data;
        if (typeof message === "string") {
          try {
            message = JSON.parse(message);
          } catch {
            return;
          }
        }

        if (!message || (!message.type && !message.action)) return;
        const type = message.type || message.action;

        console.log("[TWA Bridge] 📥 Incoming:", { type, message });
        messageListeners.current.forEach((listener) =>
          listener({ ...message, type }),
        );
      };
    };

    window.addEventListener("message", handleInitialMessage);

    // Handshake loop (TWA mode only)
    const handshakeInterval = setInterval(() => {
      if (portRef.current || isReady) {
        clearInterval(handshakeInterval);
        return;
      }

      console.log("[TWA Bridge] 🔍 Searching for Native Bridge...");
      window.postMessage(JSON.stringify({ type: "APP_READY" }), "*");
    }, 2500);

    return () => {
      window.removeEventListener("message", handleInitialMessage);
      clearInterval(handshakeInterval);
    };
  }, [isReady]);

  const postToAndroid = useCallback(
    (type: TWAAction, payload: Record<string, unknown> = {}) => {
      console.log("[Bridge] Posting to Android:", { type, payload });
      const message = JSON.stringify({ type, payload });

      if (window.AndroidBridge) {
        window.AndroidBridge.postMessage(message);
      } else if (portRef.current) {
        portRef.current.postMessage(message);
      } else {
        window.postMessage(message, "*");
      }
    },
    [],
  );

  const addListener = useCallback((callback: (msg: TWAMessage) => void) => {
    messageListeners.current.add(callback);
    return () => {
      messageListeners.current.delete(callback);
    };
  }, []);

  return (
    <TwaBridgeContext.Provider value={{ isReady, postToAndroid, addListener }}>
      {children}
    </TwaBridgeContext.Provider>
  );
}

export function useTwaBridge() {
  const context = useContext(TwaBridgeContext);
  if (!context) {
    throw new Error("useTwaBridge must be used within a TwaBridgeProvider");
  }

  // Proactive re-handshake toggle on mount (TWA fallback)
  useEffect(() => {
    if (!context.isReady && !window.AndroidBridge) {
      console.log(
        "[TWA Bridge] Component mounted, bridge not ready. Requesting sync...",
      );
      window.postMessage(JSON.stringify({ type: "APP_READY" }), "*");
    }
  }, [context.isReady]);

  return context;
}
