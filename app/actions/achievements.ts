"use server";

import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { amIAdmin } from "./admin";
import { syncChallenges } from "./challenges";

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

export async function getUserAchievements() {
  const user = await currentUser();
  if (!user) return [];

  // Sync challenges to ensure all badge names are in DB
  await syncChallenges();

  // Get all challenges that can have a badge
  const allBadgeChallenges = await prisma.challenge.findMany({
    where: {
      badgeName: { not: null },
    },
  });

  // Get user's progress for these challenges
  const userProgress = await prisma.userChallengeProgress.findMany({
    where: {
      userId: user.id,
    },
  });

  return allBadgeChallenges.map((ch) => {
    const progress = userProgress.find((p) => p.challengeId === ch.id);
    return {
      id: ch.id,
      name: ch.badgeName || ch.name,
      description: ch.description,
      points: ch.points,
      isEarned: progress?.isCompleted || false,
    };
  });
}
