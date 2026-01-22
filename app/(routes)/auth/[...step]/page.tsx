import noise from "@/app/assets/sign-in/noise.png";
import BgPhotos from "@/components/bg-photos";
import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import Image from "next/image";
import { redirect, RedirectType } from "next/navigation";
import AuthClient from "./_components/auth-client";

export default async function AuthPage({
  params,
}: {
  params: Promise<{ step: string[] }>;
}) {
  const user = await currentUser();

  if (user) {
    const userDb = await prisma.user.findFirst({
      where: {
        id: user.id,
      },
    });

    if (userDb?.profileCompleted == false) {
      return redirect("/complete-profile", RedirectType.replace);
    }
    return redirect("/", RedirectType.replace);
  }

  const { step } = await params;
  const currentStep = step?.[0] || "sign-up";

  return (
    <div className="overflow-y-hidden">
      <BgPhotos />
      <div className="absolute h-screen bg-white/60"></div>
      <Image
        className="fixed -bottom-1/4 scale-200"
        src={noise}
        alt="Background noise"
      />

      <div className="absolute grid h-full w-full place-items-center bg-white/60 backdrop-blur-sm">
        <div className="w-full px-7">
          <AuthClient step={currentStep} />
        </div>
      </div>
    </div>
  );
}
