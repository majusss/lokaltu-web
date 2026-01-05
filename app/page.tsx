import { redirect } from "next/navigation";
import { getUserDb } from "./actions/user";

export default async function Home() {
  const user = await getUserDb();

  if (!user) {
    return redirect("/onboarding");
  }

  if (user.profileCompleted == false) {
    return redirect("/complete-profile");
  }

  return redirect("/homescreen");
}
