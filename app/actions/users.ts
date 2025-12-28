"use server";

import prisma from "@/lib/prisma";
import { amIAdmin } from "./admin";

export async function getUsers(page: number = 1, limit: number = 10) {
  if (!(await amIAdmin())) {
    throw new Error("Unauthorized");
  }

  const skip = (page - 1) * limit;

  const [users, totalCount, admins] = await Promise.all([
    prisma.user.findMany({
      skip,
      take: limit,
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: {
            posts: true,
            achievements: true,
          },
        },
      },
    }),
    prisma.user.count(),
    prisma.admin.findMany(),
  ]);

  const adminIds = new Set(admins.map((a) => a.userId));

  return {
    users: users.map((user) => ({
      ...user,
      isAdmin: adminIds.has(user.id),
    })),
    totalPages: Math.ceil(totalCount / limit),
    totalCount,
  };
}

export async function toggleAdmin(userId: string) {
  if (!(await amIAdmin())) {
    throw new Error("Unauthorized");
  }

  const existingAdmin = await prisma.admin.findUnique({
    where: { userId },
  });

  if (existingAdmin) {
    await prisma.admin.delete({
      where: { userId },
    });
    return { isAdmin: false };
  } else {
    await prisma.admin.create({
      data: { userId },
    });
    return { isAdmin: true };
  }
}

export async function deleteUser(userId: string) {
  if (!(await amIAdmin())) {
    throw new Error("Unauthorized");
  }

  await prisma.$transaction([
    prisma.notification.deleteMany({ where: { userId } }),
    prisma.post.deleteMany({ where: { authorId: userId } }),
    prisma.admin.deleteMany({ where: { userId } }),
    prisma.user.delete({ where: { id: userId } }),
  ]);

  return { success: true };
}
