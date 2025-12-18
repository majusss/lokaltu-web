"use client";

import React, { useEffect, useRef, useCallback } from "react";
import type { NativeMessage, NativeMessageListener } from "../types/native";
import {
  sendNativeMessage,
  subscribeToNative,
  isNativeEnvironment,
} from "../native-bridge";

interface UseNativeOptions {
  onMessage?: NativeMessageListener;
  enabled?: boolean;
}

export function useNative(options: UseNativeOptions = {}) {
  const { onMessage, enabled = true } = options;
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const [isAvailable, setIsAvailable] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isHydrated, setIsHydrated] = React.useState(false);

  const send = useCallback(
    (message: NativeMessage) => {
      if (enabled && isHydrated) {
        sendNativeMessage(message);
      }
    },
    [enabled, isHydrated]
  );

  useEffect(() => {
    setIsHydrated(true);

    const timeoutId = setTimeout(() => {
      const nativeAvailable = isNativeEnvironment();
      setIsAvailable(nativeAvailable);
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    if (!enabled || !onMessage || !isHydrated) return;
    unsubscribeRef.current = subscribeToNative(onMessage);
    return () => {
      unsubscribeRef.current?.();
      unsubscribeRef.current = null;
    };
  }, [onMessage, enabled, isHydrated]);

  return {
    send,
    isAvailable,
    isLoading,
    isEnabled: enabled,
  };
}

export function useNativeMessage<T extends NativeMessage["type"]>(
  messageType: T,
  handler: (message: NativeMessage & { type: T }) => void,
  enabled = true
) {
  useNative({
    onMessage: (msg: NativeMessage) => {
      if (msg.type === messageType) {
        handler(msg as NativeMessage & { type: T });
      }
    },
    enabled,
  });
}

export function useNFC() {
  const { send } = useNative();
  const [nfcData, setNfcData] = React.useState<string | null>(null);

  const requestNFC = useCallback(() => {
    send({ type: "REQUEST_NFC" });
  }, [send]);

  useNativeMessage("NFC_RESULT", (msg) => {
    setNfcData(msg.payload);
  });

  useNativeMessage("NFC_ERROR", () => {
    setNfcData(null);
  });

  return {
    requestNFC,
    lastNFCData: nfcData,
  };
}

export function usePushNotifications() {
  const { send } = useNative();
  const [token, setToken] = React.useState<string | null>(null);

  useNativeMessage("REGISTER_PUSH_TOKEN", (msg) => {
    setToken(msg.token);
  });

  return {
    token,
    requestToken: () => {
      send({ type: "REGISTER_PUSH_TOKEN", token: "" });
    },
  };
}

export function useNativePermission(permission: string) {
  const { send } = useNative();
  const [granted, setGranted] = React.useState(false);

  const request = useCallback(() => {
    send({ type: "PERMISSION_REQUEST", permission });
  }, [send, permission]);

  useNativeMessage("PERMISSION_RESULT", (msg) => {
    if (msg.permission === permission) {
      setGranted(msg.granted);
    }
  });

  return {
    granted,
    request,
  };
}
