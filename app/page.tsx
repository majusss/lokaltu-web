import { currentUser } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getUserDb } from "./actions/user";

export default async function Home() {
  const user = await currentUser();
  const userDb = await getUserDb();

  if (!user) {
    const cookieStore = await cookies();
    const onboardingCompleted = cookieStore.get("onboarding_completed");

    if (!onboardingCompleted) {
      return redirect("/onboarding");
    }
    return redirect("/auth/sign-up");
  }

  if (!userDb || userDb.profileCompleted == false) {
    return redirect("/complete-profile");
  }

  return redirect("/homescreen");
}
