"use client";

import { PostWithAuthor } from "@/app/actions/posts";
import { useRef } from "react";
import { AddPost } from "./add-post";
import { Posts, PostsRef } from "./posts";

interface PostsPageClientProps {
  initialPosts: PostWithAuthor[];
  initialTotalPages: number;
  initialTotalCount: number;
}

export function PostsPageClient({
  initialPosts,
  initialTotalPages,
  initialTotalCount,
}: PostsPageClientProps) {
  const postsRef = useRef<PostsRef>(null);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Posty</h1>
        <p className="text-muted-foreground">Zarządzaj postami użytkowników</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Posts
            ref={postsRef}
            initialPosts={initialPosts}
            initialTotalPages={initialTotalPages}
            initialTotalCount={initialTotalCount}
          />
        </div>

        <div>
          <AddPost onPostCreated={() => postsRef.current?.refresh()} />
        </div>
      </div>
    </div>
  );
}
