import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { redirect, RedirectType } from "next/navigation";

export default async function HomeScreenSubPage({
  params,
}: {
  params: Promise<{ path: string[] }>;
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

  const { path } = await params;

  return (
    <div>
      <h1>{path}</h1>
    </div>
  );
}
