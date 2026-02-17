"use client";

import { useState } from "react";

import { PostWithAuthor } from "@/app/actions/posts";
import { MessageCircle } from "lucide-react";
import Image from "next/image";
import { CommentsSheet } from "./comments-sheet";

export function PostsList({
  posts,
  currentUserId,
  isAdmin = false,
}: {
  posts: PostWithAuthor[];
  currentUserId: string;
  isAdmin?: boolean;
}) {
  const [openPostId, setOpenPostId] = useState<number | null>(null);

  return (
    <div>
      <h2 className="ml-1.5 text-2xl font-semibold">Co w trawie piszczy?</h2>
      <div className="mt-3 space-y-4">
        {posts.map((post) => (
          <div
            className="rounded-2xl border-[0.5px] border-[#E1E1E1] p-4"
            key={post.id}
          >
            <div className="inline-flex w-fit items-center gap-2">
              <Image
                src={post.author.avatarUrl}
                width={28}
                height={28}
                alt={`${post.author.name}'s profile pic`}
                className="rounded-full"
              />
              <p className="text-lg font-medium">{post.author.name}</p>
            </div>
            <p className="mt-2 text-sm leading-[1.3] font-medium">
              {post.content}
            </p>
            <div className="mt-2 flex w-full items-center justify-end gap-1.5">
              {post._count.comments > 0 && (
                <span className="text-xs font-medium text-gray-400">
                  {post._count.comments}
                </span>
              )}
              <button
                onClick={() => setOpenPostId(post.id)}
                className="transition-transform active:scale-90"
                aria-label="Otwórz komentarze"
              >
                <MessageCircle className="fill-[#59CA34] text-[#59CA34]" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {openPostId !== null && (
        <CommentsSheet
          postId={openPostId}
          commentCount={
            posts.find((p) => p.id === openPostId)?._count.comments ?? 0
          }
          currentUserId={currentUserId}
          isAdmin={isAdmin}
          open={true}
          onOpenChange={(open) => {
            if (!open) setOpenPostId(null);
          }}
        />
      )}
    </div>
  );
}
