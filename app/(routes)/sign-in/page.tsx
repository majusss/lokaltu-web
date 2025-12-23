import prisma from "@/lib/prisma";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import { redirect, RedirectType } from "next/navigation";

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

  // custom authentication components here
  return (
    <div>
      <SignedOut>
        <SignInButton />
        <SignUpButton>
          <button className="text-ceramic-white h-10 cursor-pointer rounded-full bg-[#6c47ff] px-4 text-sm font-medium sm:h-12 sm:px-5 sm:text-base">
            Sign Up
          </button>
        </SignUpButton>
      </SignedOut>
      <SignedIn>
        <UserButton />
      </SignedIn>
    </div>
  );
}
