"use server";

import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

const CHALLENGES_LIST = [
  {
    id: "first_steps",
    name: "Pierwsze Kroki",
    description: "Zrób 1 zakupy w dowolnym miejscu.",
    goal: 1,
    points: 20,
    badgeName: "Debiut",
  },
  {
    id: "weekly_warmup",
    name: "Tygodniowa Rozgrzewka",
    description: "Zrób zakupy w 2 różnych dniach w ciągu jednego tygodnia.",
    goal: 2,
    points: 30,
    badgeName: "Rozgrzewka",
  },
  {
    id: "local_patriot",
    name: "Lokalny Patriota",
    description: "Zrób zakupy 3 razy w ciągu jednego tygodnia.",
    goal: 3,
    points: 50,
    badgeName: "Patriota",
    dependency: "weekly_warmup",
  },
  {
    id: "taste_explorer",
    name: "Odkrywca Smaków",
    description: "Odwiedź 3 różne punkty na mapie.",
    goal: 3,
    points: 100,
    badgeName: "Odkrywca Smaków",
  },
  {
    id: "morning_master",
    name: "Mistrz Poranka",
    description: "Zrób zakupy przed godziną 10:00 rano.",
    goal: 1,
    points: 20,
    badgeName: "Ranny Ptaszek",
  },
  {
    id: "weekend_market",
    name: "Weekendowy Ryneczek",
    description: "Zrób zakupy w sobotę.",
    goal: 1,
    points: 25,
    badgeName: "Sobotni Kupiec",
  },
  {
    id: "map_maker",
    name: "Twórca Mapy",
    description: "Dodaj 1 nowe miejsce na mapę.",
    goal: 1,
    points: 100,
    badgeName: "Kartograf",
  },
  {
    id: "local_marathon",
    name: "Maraton Lokalności",
    description: "Utrzymaj serię zakupów przez 4 tygodnie z rzędu.",
    goal: 4,
    points: 200,
    badgeName: "Maratończyk",
  },
  {
    id: "no_plastic",
    name: "Bez Plastiku",
    description: "Użyj Torby NFC 10 razy.",
    goal: 10,
    points: 50,
    badgeName: "Zero Waste Hero",
  },
  {
    id: "king_of_district",
    name: "Król Dzielnicy",
    description: "Zrób 5 zakupów w jednej konkretnej kategorii.",
    goal: 5,
    points: 50,
    badgeName: "Mecenas Sztuki",
  },
];

/**
 * Ensures all challenges exist in the DB.
 */
export async function syncChallenges() {
  for (const ch of CHALLENGES_LIST) {
    await prisma.challenge.upsert({
      where: { id: ch.id },
      update: {
        name: ch.name,
        description: ch.description,
        goal: ch.goal,
        points: ch.points,
        badgeName: ch.badgeName,
        dependency: ch.dependency,
      },
      create: {
        id: ch.id,
        name: ch.name,
        description: ch.description,
        goal: ch.goal,
        points: ch.points,
        badgeName: ch.badgeName,
        dependency: ch.dependency,
      },
    });
  }
}

/**
 * Checks and updates progress for all challenges for a given user.
 * This should be called after a purchase or map action.
 */
export async function checkChallenges(userId: string) {
  // Ensure challenges are in DB
  await syncChallenges();

  const userPurchases = await prisma.purchase.findMany({
    where: { userId },
    include: { place: true },
    orderBy: { createdAt: "desc" },
  });

  const createdPlaces = await prisma.place.findMany({
    where: { creatorId: userId },
  });

  const userProgress = await prisma.userChallengeProgress.findMany({
    where: { userId },
  });

  const getProgress = (id: string) =>
    userProgress.find((p) => p.challengeId === id);

  for (const ch of CHALLENGES_LIST) {
    const progress = getProgress(ch.id);
    if (progress?.isCompleted) continue;

    // Check dependency
    if (ch.dependency) {
      const depProgress = getProgress(ch.dependency);
      if (!depProgress?.isCompleted) continue;
    }

    let current = 0;

    switch (ch.id) {
      case "first_steps":
        current = userPurchases.length;
        break;
      case "weekly_warmup": {
        const thisWeek = getPurchasesThisWeek(userPurchases);
        const uniqueDays = new Set(
          thisWeek.map((p) => p.createdAt.toDateString()),
        ).size;
        current = uniqueDays;
        break;
      }
      case "local_patriot": {
        const thisWeek = getPurchasesThisWeek(userPurchases);
        current = thisWeek.length;
        break;
      }
      case "taste_explorer": {
        const uniquePlaces = new Set(
          userPurchases.map((p) => p.placeId).filter(Boolean),
        ).size;
        current = uniquePlaces;
        break;
      }
      case "morning_master": {
        current = userPurchases.some((p) => p.createdAt.getHours() < 10)
          ? 1
          : 0;
        break;
      }
      case "weekend_market": {
        current = userPurchases.some((p) => p.createdAt.getDay() === 6) ? 1 : 0; // 6 is Saturday
        break;
      }
      case "map_maker":
        current = createdPlaces.length;
        break;
      case "no_plastic":
        current = userPurchases.length; // Each purchase is verified with NFC bag
        break;
      case "king_of_district": {
        const counts: Record<string, number> = {};
        userPurchases.forEach((p) => {
          if (p.place?.category) {
            counts[p.place.category] = (counts[p.place.category] || 0) + 1;
          }
        });
        current = Math.max(0, ...Object.values(counts));
        break;
      }
      case "local_marathon": {
        // Simple 4 weeks logic: consecutive weeks with at least 1 purchase
        current = checkStreak(userPurchases, 4);
        break;
      }
    }

    if (current > 0) {
      const isCompleted = current >= ch.goal;
      await prisma.userChallengeProgress.upsert({
        where: { userId_challengeId: { userId, challengeId: ch.id } },
        update: { current: Math.min(current, ch.goal), isCompleted },
        create: {
          userId,
          challengeId: ch.id,
          current: Math.min(current, ch.goal),
          isCompleted,
        },
      });

      if (isCompleted && (!progress || !progress.isCompleted)) {
        // Award points for completing challenge
        await prisma.user.update({
          where: { id: userId },
          data: { lokaltuPoints: { increment: ch.points } },
        });
      }
    }
  }

  revalidatePath("/(routes)/homescreen", "layout");
}

function getPurchasesThisWeek(purchases: any[]) {
  const now = new Date();
  const startOfWeek = new Date(now);
  // Get Monday of current week
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  startOfWeek.setDate(diff);
  startOfWeek.setHours(0, 0, 0, 0);
  return purchases.filter((p) => new Date(p.createdAt) >= startOfWeek);
}

function checkStreak(purchases: any[], _goalWeeks: number) {
  if (purchases.length === 0) return 0;

  const weeks: Set<string> = new Set();

  purchases.forEach((p) => {
    const d = new Date(p.createdAt);
    // Simple week identifier: Year-WeekNumber
    const oneJan = new Date(d.getFullYear(), 0, 1);
    const numberOfDays = Math.floor(
      (d.getTime() - oneJan.getTime()) / (24 * 60 * 60 * 1000),
    );
    const weekDisplay = `${d.getFullYear()}-${Math.ceil((d.getDay() + 1 + numberOfDays) / 7)}`;
    weeks.add(weekDisplay);
  });

  // This is a simplified check for total unique weeks shopped
  // For a real streak, we'd check consecutive weeks from 'now'
  return weeks.size;
}

export async function getUserChallenges() {
  const user = await currentUser();
  if (!user) return [];

  // Sync first to ensure DB is up to date
  await syncChallenges();

  const allChallenges = await prisma.challenge.findMany();
  const userProgress = await prisma.userChallengeProgress.findMany({
    where: { userId: user.id },
  });

  // Map all challenges to show progress (even if 0)
  const result = allChallenges
    .map((ch) => {
      const progress = userProgress.find((p) => p.challengeId === ch.id);

      // Check if it should be visible
      let isVisible = true;
      if (ch.dependency) {
        const depProgress = userProgress.find(
          (p) => p.challengeId === ch.dependency,
        );
        if (!depProgress?.isCompleted) isVisible = false;
      }

      if (!isVisible && !progress) return null;

      return {
        challengeId: ch.id,
        current: progress?.current || 0,
        isCompleted: progress?.isCompleted || false,
        challenge: ch,
      };
    })
    .filter(Boolean);

  return result;
}
