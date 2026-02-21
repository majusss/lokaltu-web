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
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1.5 mb-4">
        <h2 className="text-xl font-black text-gray-900">Co w trawie piszczy?</h2>
        <span className="text-xs font-bold text-[#49BF12]">Więcej</span>
      </div>
      
      <div className="space-y-4">
        {posts.map((post) => (
          <div
            className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:border-[#49BF12]/20"
            key={post.id}
          >
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-3">
                <div className="relative h-9 w-9 overflow-hidden rounded-full ring-2 ring-gray-50">
                  <Image
                    src={post.author.avatarUrl}
                    fill
                    alt={`${post.author.name}'s profile pic`}
                    className="object-cover"
                  />
                </div>
                <p className="text-base font-bold text-gray-900">{post.author.name}</p>
              </div>
              <div className="text-[10px] font-bold text-gray-400 uppercase">Dzisiaj</div>
            </div>
            
            <p className="mt-4 text-[15px] leading-relaxed font-medium text-gray-700">
              {post.content}
            </p>
            
            <div className="mt-5 flex w-full items-center justify-between border-t border-gray-50 pt-4">
              <div className="flex items-center gap-1.5 text-gray-400">
                <MessageCircle className="h-4 w-4 fill-gray-100 text-gray-300" />
                <span className="text-xs font-bold">
                  {post._count.comments || 0} komentarzy
                </span>
              </div>
              
              <button
                onClick={() => setOpenPostId(post.id)}
                className="flex items-center gap-1.5 rounded-full bg-[#49BF12]/5 px-3 py-1.5 text-[11px] font-black tracking-tight text-[#49BF12] uppercase transition-all hover:bg-[#49BF12]/10 active:scale-95"
              >
                Komentuj
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
