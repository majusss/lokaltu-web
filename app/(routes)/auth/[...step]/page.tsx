import noise from "@/app/assets/sign-in/noise.png";
import BgPhotos from "@/components/bg-photos";
import { currentUser } from "@clerk/nextjs/server";
import Image from "next/image";
import { redirect, RedirectType } from "next/navigation";
import AuthClient from "./_components/auth-client";

import { headers } from "next/headers";

export default async function AuthPage({
  params,
  searchParams,
}: {
  params: Promise<{ step: string[] }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { step } = await params;
  const { __clerk_handover_token } = await searchParams;
  const currentStep = step?.[0] || "sign-up";
  const user = await currentUser();
  const userAgent = (await headers()).get("user-agent") || "";
  const isNativeApp = userAgent.includes("Lokaltu-Native-Android");

  if (
    user &&
    currentStep !== "return-to-app" &&
    currentStep !== "verify-second-factor"
  ) {
    // If we are already in the app, just go home.
    // If we are in external browser, go to bridge to "pull" user into app.
    if (isNativeApp) {
      return redirect("/", RedirectType.replace);
    }
    return redirect("/auth/return-to-app", RedirectType.replace);
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden overflow-y-auto">
      <div className="fixed inset-0 -z-50">
        <BgPhotos />
        <div className="absolute inset-0 bg-white/60"></div>
        <Image
          className="absolute inset-0 h-full w-full object-cover opacity-20"
          src={noise}
          alt="Background noise"
        />
      </div>

      <div className="grid min-h-screen w-full place-items-center bg-white/40 px-6 py-12 backdrop-blur-sm">
        <div className="w-full max-w-md">
          <AuthClient
            isNativeApp={isNativeApp}
            step={__clerk_handover_token ? "sync" : currentStep}
            token={__clerk_handover_token as string}
          />
        </div>
      </div>
    </div>
  );
}
