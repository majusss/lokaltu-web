import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserDb } from "./actions/user";

export default async function Home() {
  const user = await currentUser();
  const userDb = await getUserDb();

  if (!user) {
    return redirect("/onboarding");
  }

  if (!userDb || userDb.profileCompleted == false) {
    return redirect("/complete-profile");
  }

  return redirect("/homescreen");
}
