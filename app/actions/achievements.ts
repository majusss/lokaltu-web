"use server";

import prisma from "@/lib/prisma";
import { amIAdmin } from "./admin";

export async function getAchievements(page: number = 1, limit: number = 10) {
  if (!(await amIAdmin())) {
    throw new Error("Unauthorized");
  }

  const skip = (page - 1) * limit;

  const [achievements, totalCount] = await Promise.all([
    prisma.achievement.findMany({
      skip,
      take: limit,
      orderBy: { points: "desc" },
      include: {
        _count: {
          select: { users: true },
        },
      },
    }),
    prisma.achievement.count(),
  ]);

  return {
    achievements,
    totalPages: Math.ceil(totalCount / limit),
    totalCount,
  };
}

export async function createAchievement(data: {
  name: string;
  description: string;
  iconUrl: string;
  points: number;
}) {
  if (!(await amIAdmin())) {
    throw new Error("Unauthorized");
  }

  return prisma.achievement.create({ data });
}

export async function deleteAchievement(id: number) {
  if (!(await amIAdmin())) {
    throw new Error("Unauthorized");
  }

  return prisma.achievement.delete({ where: { id } });
}
