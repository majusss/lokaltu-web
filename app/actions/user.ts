"use server";

import prisma from "@/lib/prisma";
import { clerkClient, currentUser } from "@clerk/nextjs/server";

export async function getUserDb() {
  const user = await currentUser();

  if (!user) {
    return null;
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

  const email = user.emailAddresses[0]?.emailAddress || "";
  const name =
    user.firstName || user.username || email.split("@")[0] || "Użytkownik";
  const avatarUrl = user.imageUrl || "";

  await prisma.user.upsert({
    where: {
      id: user.id,
    },
    update: {
      bagId,
      profileCompleted: true,
      name,
      email,
      avatarUrl,
    },
    create: {
      id: user.id,
      name,
      email,
      avatarUrl,
      bagId,
      profileCompleted: true,
    },
  });
}

export async function updateUserName(name: string) {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  // Update Prisma
  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: { name },
  });

  // Update Clerk
  try {
    const client = await clerkClient();
    await client.users.updateUser(user.id, {
      firstName: name,
    });
  } catch (error) {
    console.error("Error updating Clerk user:", error);
    // Even if Clerk update fails, we already updated Prisma
  }

  return updatedUser;
}
