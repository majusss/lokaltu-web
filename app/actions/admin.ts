"use server";

import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";

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
