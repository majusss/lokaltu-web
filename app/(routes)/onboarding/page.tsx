import BgPhotos from "@/components/bg-photos";
import { currentUser } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { OnboardingClient } from "./_components/onboarding-client";

export default async function OnboardingPage() {
  const user = await currentUser();
  if (user) {
    return redirect("/");
  }

  const cookieStore = await cookies();
  const onboardingCompleted = cookieStore.get("onboarding_completed");

  if (onboardingCompleted) {
    return redirect("/auth/sign-up");
  }

  return (
    <div className="overflow-y-hidden">
      <BgPhotos />
      <OnboardingClient />
    </div>
  );
}
