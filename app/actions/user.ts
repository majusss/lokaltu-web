"use server";

import prisma from "@/lib/prisma";
import { clerkClient, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

function normalizeTagId(tagId: string) {
  return tagId.trim().toLowerCase();
}

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

export async function getUserPublicProfile(targetUserId: string) {
  const me = await currentUser();

  const targetUser = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: {
      id: true,
      name: true,
      avatarUrl: true,
      lokaltuPoints: true,
      co2Saved: true,
      bagsSaved: true,
      challenges: {
        where: { isCompleted: true },
        include: {
          challenge: {
            select: {
              badgeName: true,
              name: true,
              description: true,
              points: true,
            },
          },
        },
      },
    },
  });

  if (!targetUser) return null;

  const earnedBadges = targetUser.challenges
    .filter((cp) => cp.challenge.badgeName)
    .map((cp) => ({
      id: cp.challengeId,
      name: cp.challenge.badgeName!,
      description: cp.challenge.description,
      points: cp.challenge.points,
    }));

  // Guest / own profile — no friendship data needed
  if (!me || me.id === targetUserId) {
    return {
      id: targetUser.id,
      name: targetUser.name,
      avatarUrl: targetUser.avatarUrl,
      lokaltuPoints: targetUser.lokaltuPoints,
      co2Saved: targetUser.co2Saved,
      bagsSaved: targetUser.bagsSaved,
      earnedBadges,
      isMe: me?.id === targetUserId,
      friendStatus: "none" as const,
      requestId: null as string | null,
    };
  }

  const req = await prisma.friendRequest.findFirst({
    where: {
      OR: [
        { senderId: me.id, receiverId: targetUserId },
        { senderId: targetUserId, receiverId: me.id },
      ],
    },
  });

  let friendStatus: "none" | "sent" | "received" | "friends" = "none";
  let requestId: string | null = null;

  if (req) {
    requestId = req.id;
    if (req.status === "ACCEPTED") {
      friendStatus = "friends";
    } else if (req.status === "PENDING") {
      friendStatus = req.senderId === me.id ? "sent" : "received";
    }
  }

  return {
    id: targetUser.id,
    name: targetUser.name,
    avatarUrl: targetUser.avatarUrl,
    lokaltuPoints: targetUser.lokaltuPoints,
    co2Saved: targetUser.co2Saved,
    bagsSaved: targetUser.bagsSaved,
    earnedBadges,
    isMe: false,
    friendStatus,
    requestId,
  };
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

  const normalizedBagId = bagId ? normalizeTagId(bagId) : undefined;

  if (normalizedBagId) {
    await assignBagToCurrentUser(normalizedBagId);
  }

  await prisma.user.upsert({
    where: {
      id: user.id,
    },
    update: {
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
      bagId: normalizedBagId,
      profileCompleted: true,
    },
  });

  revalidatePath("/(routes)/homescreen", "layout");
}

export async function assignBagToCurrentUser(tagId: string) {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const normalizedTagId = normalizeTagId(tagId);
  if (!normalizedTagId) throw new Error("Nieprawidłowy identyfikator NFC.");

  const existingBag = await prisma.bag.findUnique({
    where: { nfcTagId: normalizedTagId },
  });

  if (!existingBag) {
    throw new Error("Nie znaleziono torby z tym tagiem NFC.");
  }

  if (existingBag.userId && existingBag.userId !== user.id) {
    throw new Error("Ta torba jest już przypisana do innego użytkownika.");
  }

  await prisma.$transaction(async (tx) => {
    const currentUserBag = await tx.bag.findFirst({
      where: { userId: user.id },
    });

    if (currentUserBag && currentUserBag.id !== existingBag.id) {
      await tx.bag.update({
        where: { id: currentUserBag.id },
        data: { userId: null, assignedAt: null },
      });
    }

    await tx.bag.update({
      where: { id: existingBag.id },
      data: { userId: user.id, assignedAt: new Date() },
    });

    await tx.user.upsert({
      where: { id: user.id },
      update: { bagId: normalizedTagId },
      create: {
        id: user.id,
        name: user.firstName || user.username || "Użytkownik",
        email: user.emailAddresses[0]?.emailAddress || "",
        avatarUrl: user.imageUrl || "",
        bagId: normalizedTagId,
      },
    });
  });

  revalidatePath("/(routes)/homescreen", "layout");
  revalidatePath("/complete-profile/scan");
  revalidatePath("/homescreen/profile");
}

export async function detachCurrentUserBag() {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  await prisma.$transaction(async (tx) => {
    const bag = await tx.bag.findFirst({ where: { userId: user.id } });

    if (bag) {
      await tx.bag.update({
        where: { id: bag.id },
        data: { userId: null, assignedAt: null },
      });
    }

    await tx.user.upsert({
      where: { id: user.id },
      update: { bagId: null },
      create: {
        id: user.id,
        name: user.firstName || user.username || "Użytkownik",
        email: user.emailAddresses[0]?.emailAddress || "",
        avatarUrl: user.imageUrl || "",
        bagId: null,
      },
    });
  });

  revalidatePath("/(routes)/homescreen", "layout");
  revalidatePath("/homescreen/profile");
}

export async function getCurrentUserBag() {
  const user = await currentUser();
  if (!user) return null;

  return prisma.bag.findFirst({
    where: { userId: user.id },
    select: {
      id: true,
      nfcTagId: true,
      assignedAt: true,
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
