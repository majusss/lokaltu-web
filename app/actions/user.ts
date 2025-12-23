"use server";

import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";

export async function getUserDb() {
  const user = await currentUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const userDb = await prisma.user.findFirst({
    where: {
      id: user.id,
    },
  });
  return userDb;
}

export async function completeProfile(bagId?: string) {
  const user = await currentUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      bagId,
      profileCompleted: true,
    },
  });
}
