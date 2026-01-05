import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import Image from "next/image";
import { redirect, RedirectType } from "next/navigation";
import BgPhotos from "../onboarding/_components/bg-photos";
import SignInClient from "./_componnets/singin-client";

import noise from "@/app/assets/sign-in/noise.png";
import { SignInButton, SignUpButton } from "@clerk/nextjs";

export default async function SignInPage() {
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

  return (
    <div className="overflow-y-hidden">
      <div className="fixed z-50 space-x-4 p-4">
        <span>test:</span>
        <SignInButton />
        <SignUpButton />
      </div>
      <BgPhotos />
      <div className="absolute h-screen w-screen bg-white/60"></div>
      <Image
        className="fixed -bottom-1/4 scale-200"
        src={noise}
        alt="Background noise"
      />
      <SignInClient />
    </div>
  );
}
