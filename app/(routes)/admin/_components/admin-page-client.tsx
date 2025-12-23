"use client";

import { Post } from "@/generated/prisma/client";
import { useRef } from "react";
import { AddPost } from "./add-post";
import { Posts, PostsRef } from "./posts";

interface AdminPageClientProps {
  initialPosts: Post[];
  initialTotalPages: number;
}

export function AdminPageClient({
  initialPosts,
  initialTotalPages,
}: AdminPageClientProps) {
  const postsRef = useRef<PostsRef>(null);

  return (
    <div className="space-y-6">
      <Posts
        ref={postsRef}
        initialPosts={initialPosts}
        initialTotalPages={initialTotalPages}
      />
      <AddPost onPostCreated={() => postsRef.current?.refresh()} />
    </div>
  );
}
