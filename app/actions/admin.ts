"use server";

import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

function normalizeTagId(tagId: string) {
  return tagId.trim().toLowerCase();
}

export async function amIAdmin() {
  const user = await currentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  const admin = await prisma.admin.findUnique({
    where: {
      userId: user.id,
    },
  });
  return admin ?? false;
}

export async function createAdminPost(title: string, content: string) {
  const admin = await amIAdmin();

  if (!admin) {
    throw new Error("Unauthorized");
  }

  const post = await prisma.post.create({
    data: {
      title,
      content,
      allowed: true,
      authorId: admin.userId,
    },
  });

  return post;
}

export async function deletePost(postId: number, reason: string) {
  if (!(await amIAdmin())) {
    throw new Error("Unauthorized");
  }

  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: { author: true },
  });

  if (!post) {
    throw new Error("Post not found");
  }

  await prisma.$transaction([
    prisma.notification.create({
      data: {
        userId: post.authorId,
        title: "Post usunięty",
        message: `Twój post "${post.title}" został usunięty. Powód: ${reason}`,
      },
    }),
    prisma.post.delete({
      where: { id: postId },
    }),
  ]);

  return { success: true };
}

export async function getAdminBagPool() {
  if (!(await amIAdmin())) {
    throw new Error("Unauthorized");
  }

  return prisma.bag.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      nfcTagId: true,
      assignedAt: true,
      user: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
}

export async function addBagToPool(tagId: string) {
  if (!(await amIAdmin())) {
    throw new Error("Unauthorized");
  }

  const normalizedTagId = normalizeTagId(tagId);
  if (!normalizedTagId) {
    throw new Error("Nieprawidłowy identyfikator NFC.");
  }

  const exists = await prisma.bag.findUnique({
    where: { nfcTagId: normalizedTagId },
  });

  if (exists) {
    throw new Error("Torba z tym tagiem NFC już istnieje.");
  }

  const bag = await prisma.bag.create({
    data: {
      nfcTagId: normalizedTagId,
    },
    select: {
      id: true,
      nfcTagId: true,
      assignedAt: true,
      user: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  revalidatePath("/homescreen/profile");
  revalidatePath("/homescreen/profile/bag-admin");

  return bag;
}

export async function removeBagFromPool(bagId: string) {
  if (!(await amIAdmin())) {
    throw new Error("Unauthorized");
  }

  const bag = await prisma.bag.findUnique({
    where: { id: bagId },
    select: {
      id: true,
      userId: true,
      nfcTagId: true,
    },
  });

  if (!bag) {
    throw new Error("Nie znaleziono torby.");
  }

  await prisma.$transaction(async (tx) => {
    if (bag.userId) {
      await tx.user.update({
        where: { id: bag.userId },
        data: { bagId: null },
      });
    }

    await tx.bag.delete({ where: { id: bag.id } });
  });

  revalidatePath("/homescreen/profile");
  revalidatePath("/homescreen/profile/bag-admin");

  return { success: true };
}
