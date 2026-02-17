"use server";

import {
  PostDefaultArgs,
  PostGetPayload,
} from "@/generated/prisma/models/Post";
import prisma from "@/lib/prisma";

export type PostWithAuthor = PostGetPayload<typeof postWithAuthor>;

const postWithAuthor = {
  include: {
    author: {
      select: {
        id: true,
        name: true,
        avatarUrl: true,
      },
    },
    _count: {
      select: {
        comments: true,
      },
    },
  },
} satisfies PostDefaultArgs;

export async function getPosts(
  page: number = 1,
  limit: number = 10,
): Promise<{
  posts: PostWithAuthor[];
  totalPages: number;
  currentPage: number;
  totalCount: number;
}> {
  const skip = (page - 1) * limit;

  const [posts, totalCount] = await Promise.all([
    prisma.post.findMany({
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      ...postWithAuthor,
    }),
    prisma.post.count(),
  ]);

  return {
    posts,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: page,
    totalCount,
  };
}
