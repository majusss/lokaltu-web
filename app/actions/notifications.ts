"use server";

import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { amIAdmin } from "./admin";

export async function getMyNotifications() {
  const user = await currentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  return prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
}

export async function getAllNotifications(
  page: number = 1,
  limit: number = 10,
) {
  if (!(await amIAdmin())) {
    throw new Error("Unauthorized");
  }

  const skip = (page - 1) * limit;

  const [notifications, totalCount] = await Promise.all([
    prisma.notification.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    }),
    prisma.notification.count(),
  ]);

  return {
    notifications,
    totalPages: Math.ceil(totalCount / limit),
    totalCount,
  };
}

export async function createNotification(data: {
  userId: string;
  title?: string;
  message: string;
}) {
  if (!(await amIAdmin())) {
    throw new Error("Unauthorized");
  }

  return prisma.notification.create({
    data: {
      userId: data.userId,
      title: data.title || "Powiadomienie",
      message: data.message,
    },
  });
}

export async function deleteNotification(id: number) {
  if (!(await amIAdmin())) {
    throw new Error("Unauthorized");
  }

  return prisma.notification.delete({ where: { id } });
}

export async function getUnreadNotificationsCount() {
  const user = await currentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  return prisma.notification.count({
    where: { userId: user.id, read: false },
  });
}

export async function markNotificationAsRead(notificationId: number) {
  const user = await currentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
  });

  if (!notification || notification.userId !== user.id) {
    throw new Error("Notification not found");
  }

  return prisma.notification.update({
    where: { id: notificationId },
    data: { read: true },
  });
}

export async function markAllNotificationsAsRead() {
  const user = await currentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  return prisma.notification.updateMany({
    where: { userId: user.id, read: false },
    data: { read: true },
  });
}
