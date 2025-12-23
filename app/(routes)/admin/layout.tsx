import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const admin = await prisma.admin.findUnique({
    where: {
      userId: userId,
    },
  });

  if (!admin) {
    return notFound();
  }

  return <>{children}</>;
}
