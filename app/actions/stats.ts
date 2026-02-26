"use server";

import prisma from "@/lib/prisma";
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
