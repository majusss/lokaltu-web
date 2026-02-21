"use client";

import {
  AuthenticateWithRedirectCallback,
  useAuth,
  useClerk,
} from "@clerk/nextjs";
import EnterPassword from "./enter-password";
import SetPassword from "./set-password";
import SignIn from "./sign-in";
import SignUp from "./sign-up";
import VerifyEmail from "./verify-email";
import VerifySecondFactor from "./verify-second-factor";
import Welcome from "./welcome";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface AuthClientProps {
  step: string;
  token?: string;
  isNativeApp: boolean;
}

// Typing for Clerk's handover API which is not yet in the official types
interface ClerkHandoverclient {
  createHandoverToken: () => Promise<{ handover_token: string }>;
}

interface ClerkHandover {
  authenticateWithHandoverToken: (params: {
    handoverToken: string;
  }) => Promise<void>;
}

const NativeReturnBridge = () => {
  const { client } = useClerk();
  const { isLoaded: isAuthLoaded } = useAuth();

  useEffect(() => {
    if (!isAuthLoaded || !client) return;

    const triggerReturn = async () => {
      // Professional trick: Generate a handover token to transfer the session
      // from this external browser to the app's internal WebView.
      console.log("[Auth] Generating handover token...");
      let token = "";
      try {
        const payload = await (
          client as unknown as ClerkHandoverclient
        ).createHandoverToken();
        token = payload.handover_token;
        console.log("[Auth] Token generated successfully.");
      } catch (e) {
        console.error("[Auth] Failed to create handover token", e);
      }

      const tokenParam = token ? `&__clerk_handover_token=${token}` : "";

      const nativeIntent = `intent://auth?${tokenParam}#Intent;scheme=lokaltu;package=pl.lokaltu.android;end`;
      const customScheme = `lokaltu://auth?${tokenParam}`;

      console.log("[Auth] Forcing return into app...");
      // Try Intent first (best for Chrome/Custom Tabs)
      window.location.href = nativeIntent;

      // Fallback for non-chrome browsers
      setTimeout(() => {
        window.location.href = customScheme;
      }, 1000);
    };

    triggerReturn();
  }, [client, isAuthLoaded]);

  return (
    <div className="flex flex-col items-center justify-center space-y-4 py-12">
      <div className="border-primary h-12 w-12 animate-spin rounded-full border-4 border-t-transparent"></div>
      <h2 className="text-xl font-bold text-neutral-800">
        Wracamy do aplikacji...
      </h2>
      <p className="px-6 text-center text-neutral-500">
        Przenosimy Twoją sesję bezpiecznie.
      </p>
    </div>
  );
};

const AuthSync = ({ token }: { token: string }) => {
  const clerk = useClerk();

  useEffect(() => {
    const sync = async () => {
      console.log("[Auth] Syncing session with token...");
      try {
        await (clerk as unknown as ClerkHandover).authenticateWithHandoverToken(
          {
            handoverToken: token,
          },
        );
        console.log("[Auth] Session synced! Redirecting home...");
        window.location.href = "/";
      } catch (e) {
        console.error("[Auth] Sync failed", e);
        window.location.href = "/auth/sign-in";
      }
    };
    sync();
  }, [token, clerk]);

  return (
    <div className="flex flex-col items-center justify-center space-y-4 py-12">
      <div className="border-primary h-12 w-12 animate-spin rounded-full border-4 border-t-transparent"></div>
      <h2 className="text-xl font-bold text-neutral-800">Synchronizacja...</h2>
      <p className="px-6 text-center text-neutral-500">
        Przygotowujemy Twoje konto.
      </p>
    </div>
  );
};

export default function AuthClient({
  step,
  token,
  isNativeApp,
}: AuthClientProps) {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();

  // Professional trick: If client side detects we are already logged in,
  // we must either go home (if in app) or go to return-to-app (if in browser).
  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    // If we are in the middle of a sync or return-to-app, we let those components finish.
    // However, if we are on a standard page (sign-in, sign-up, etc.) and we are signed in,
    // we must move the user out of here.
    if (
      step === "sync" ||
      step === "return-to-app" ||
      step === "verify-second-factor"
    )
      return;

    console.log(`[Auth] Client session detected. Native: ${isNativeApp}.`);
    if (isNativeApp) {
      router.replace("/");
    } else {
      router.replace("/auth/return-to-app");
    }
  }, [isLoaded, isSignedIn, step, router, isNativeApp]);

  switch (step) {
    case "sign-up":
      return <SignUp />;
    case "sign-in":
      return <SignIn />;
    case "verify-email":
      return <VerifyEmail />;
    case "set-password":
      return <SetPassword />;
    case "welcome":
      return <Welcome />;
    case "enter-password":
      return <EnterPassword />;
    case "verify-second-factor":
      return <VerifySecondFactor />;
    case "sso-callback":
      return <AuthenticateWithRedirectCallback />;
    case "return-to-app":
      return <NativeReturnBridge />;
    case "sync":
      return token ? <AuthSync token={token} /> : <SignIn />;
    default:
      return <SignUp />;
  }
}
