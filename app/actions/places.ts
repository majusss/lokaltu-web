"use server";

import prisma from "@/lib/prisma";
import { amIAdmin } from "./admin";

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
  imageUrl: string;
}) {
  if (!(await amIAdmin())) {
    throw new Error("Unauthorized");
  }

  return prisma.place.create({ data });
}

export async function deletePlace(id: number) {
  if (!(await amIAdmin())) {
    throw new Error("Unauthorized");
  }

  return prisma.place.delete({ where: { id } });
}
