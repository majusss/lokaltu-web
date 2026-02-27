"use server";

import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { amIAdmin } from "./admin";

export async function getMapPlaces() {
  const user = await currentUser();

  return prisma.place.findMany({
    where: {
      OR: [{ verified: true }, { creatorId: user?.id || "anonymous" }],
    },
    select: {
      id: true,
      name: true,
      address: true,
      latitude: true,
      longitude: true,
      category: true,
      image: true,
      description: true,
      verified: true,
      creatorId: true,
    },
  });
}

export async function getPlaces(page: number = 1, limit: number = 10) {
  if (!(await amIAdmin())) {
    throw new Error("Unauthorized");
  }

  const skip = (page - 1) * limit;

  const [places, totalCount] = await Promise.all([
    prisma.place.findMany({
      skip,
      take: limit,
      orderBy: { name: "asc" },
    }),
    prisma.place.count(),
  ]);

  return {
    places,
    totalPages: Math.ceil(totalCount / limit),
    totalCount,
  };
}

export async function createPlace(data: {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  category: string;
  image: string;
  description?: string;
}) {
  const user = await currentUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  return prisma.place.create({
    data: {
      ...data,
      creatorId: user.id,
    },
  });
}

export async function updatePlace(
  id: string,
  data: {
    name?: string;
    address?: string;
    latitude?: number;
    longitude?: number;
    category?: string;
    image?: string;
    description?: string;
  },
) {
  if (!(await amIAdmin())) {
    throw new Error("Unauthorized");
  }

  return prisma.place.update({
    where: { id },
    data,
  });
}

export async function deletePlace(id: string) {
  if (!(await amIAdmin())) {
    throw new Error("Unauthorized");
  }

  return prisma.place.delete({ where: { id } });
}

export async function verifyPlace(id: string, verified: boolean) {
  if (!(await amIAdmin())) {
    throw new Error("Unauthorized");
  }

  return prisma.place.update({
    where: { id },
    data: { verified },
  });
}
