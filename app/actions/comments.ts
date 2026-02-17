"use server";

import {
  CommentDefaultArgs,
  CommentGetPayload,
} from "@/generated/prisma/models/Comment";
import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";

export type CommentWithAuthor = CommentGetPayload<typeof commentWithAuthor>;

const commentWithAuthor = {
  include: {
    author: {
      select: {
        id: true,
        name: true,
        avatarUrl: true,
      },
    },
  },
} satisfies CommentDefaultArgs;

export async function getComments(
  postId: number,
  page: number = 1,
  limit: number = 20,
): Promise<{
  comments: CommentWithAuthor[];
  totalCount: number;
  hasMore: boolean;
}> {
  const skip = (page - 1) * limit;

  const [comments, totalCount] = await Promise.all([
    prisma.comment.findMany({
      where: { postId },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      ...commentWithAuthor,
    }),
    prisma.comment.count({ where: { postId } }),
  ]);

  return {
    comments,
    totalCount,
    hasMore: skip + comments.length < totalCount,
  };
}

export async function addComment(
  postId: number,
  content: string,
): Promise<CommentWithAuthor> {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const comment = await prisma.comment.create({
    data: {
      content,
      postId,
      authorId: user.id,
    },
    ...commentWithAuthor,
  });

  return comment;
}

export async function deleteComment(commentId: number): Promise<void> {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: { authorId: true },
  });

  if (!comment) throw new Error("Komentarz nie istnieje");

  const isAdmin = await prisma.admin.findUnique({
    where: { userId: user.id },
  });

  if (comment.authorId !== user.id && !isAdmin) {
    throw new Error("Nie możesz usunąć tego komentarza");
  }

  await prisma.comment.delete({ where: { id: commentId } });
}
