"use client";

import React, { createContext, useContext, useEffect } from "react";
import { initNativeBridge } from "../native-bridge";

const NativeContext = createContext<{ isInitialized: boolean }>({
  isInitialized: false,
});

export function useNativeContext() {
  return useContext(NativeContext);
}

interface NativeProviderProps {
  children: React.ReactNode;
}

export function NativeProvider({ children }: NativeProviderProps) {
  const [isInitialized, setIsInitialized] = React.useState(false);
  const [isHydrated, setIsHydrated] = React.useState(false);

  useEffect(() => {
    setIsHydrated(true);
    initNativeBridge();
    setIsInitialized(true);
  }, []);

  if (!isHydrated) {
    return <>{children}</>;
  }

  return (
    <NativeContext.Provider value={{ isInitialized }}>
      {children}
    </NativeContext.Provider>
  );
}
