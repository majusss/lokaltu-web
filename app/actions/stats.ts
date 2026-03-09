"use server";

import prisma from "@/lib/prisma";
import { getLevel } from "@/lib/utils/leveling";
import { currentUser } from "@clerk/nextjs/server";
import { startOfDay, subDays } from "date-fns";

export async function getUserActivity() {
  const user = await currentUser();
  if (!user) return [];

  // Get purchases for the last 7 days
  const today = startOfDay(new Date());
  const sevenDaysAgo = subDays(today, 6);

  const purchases = await prisma.purchase.findMany({
    where: {
      userId: user.id,
      createdAt: {
        gte: sevenDaysAgo,
      },
    },
    select: {
      createdAt: true,
    },
  });

  // Group by day
  const activityMap: Record<string, number> = {};

  // Initialize map with last 7 days
  for (let i = 0; i < 7; i++) {
    const date = subDays(today, i);
    const dateStr = date.toISOString().split("T")[0];
    activityMap[dateStr] = 0;
  }

  purchases.forEach((p) => {
    const dateStr = p.createdAt.toISOString().split("T")[0];
    if (activityMap[dateStr] !== undefined) {
      activityMap[dateStr]++;
    }
  });

  // Convert to array sorted by date
  return Object.entries(activityMap)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export async function getFriendsStats() {
  const user = await currentUser();
  if (!user) return null;

  // Fetch all accepted friendships
  const accepted = await prisma.friendRequest.findMany({
    where: {
      status: "ACCEPTED",
      OR: [{ senderId: user.id }, { receiverId: user.id }],
    },
    include: {
      sender: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
          lokaltuPoints: true,
          co2Saved: true,
          bagsSaved: true,
        },
      },
      receiver: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
          lokaltuPoints: true,
          co2Saved: true,
          bagsSaved: true,
        },
      },
    },
  });

  const friends = accepted.map((req) =>
    req.senderId === user.id ? req.receiver : req.sender,
  );

  const totalFriends = friends.length;

  if (totalFriends === 0) {
    return {
      totalFriends: 0,
      activeThisWeek: 0,
      combinedCO2: 0,
      combinedBags: 0,
      leaderboard: [],
      myRank: null,
    };
  }

  const friendIds = friends.map((f) => f.id);

  // Active this week = at least 1 purchase in last 7 days
  const sevenDaysAgo = subDays(startOfDay(new Date()), 6);

  const activeFriends = await prisma.purchase.findMany({
    where: {
      userId: { in: friendIds },
      createdAt: { gte: sevenDaysAgo },
    },
    select: { userId: true },
    distinct: ["userId"],
  });

  // Me for leaderboard
  const me = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      name: true,
      avatarUrl: true,
      lokaltuPoints: true,
    },
  });

  // Build leaderboard (friends + self)
  const allParticipants = me
    ? [
        ...friends.map((f) => ({
          ...f,
          co2Saved: undefined,
          bagsSaved: undefined,
        })),
        me,
      ]
    : friends;

  const leaderboard = [...allParticipants]
    .sort((a, b) => b.lokaltuPoints - a.lokaltuPoints)
    .slice(0, 10)
    .map((p, i) => ({
      rank: i + 1,
      id: p.id,
      name: p.name,
      avatarUrl: p.avatarUrl,
      lokaltuPoints: p.lokaltuPoints,
      level: getLevel(p.lokaltuPoints),
      isMe: p.id === user.id,
    }));

  const myRank = leaderboard.find((p) => p.isMe)?.rank ?? null;

  const combinedCO2 = friends.reduce((acc, f) => acc + (f.co2Saved ?? 0), 0);
  const combinedBags = friends.reduce((acc, f) => acc + (f.bagsSaved ?? 0), 0);

  return {
    totalFriends,
    activeThisWeek: activeFriends.length,
    combinedCO2,
    combinedBags,
    leaderboard,
    myRank,
  };
}
