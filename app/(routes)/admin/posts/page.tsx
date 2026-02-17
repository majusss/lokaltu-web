import { getPosts } from "@/app/actions/posts";
import { PostsPageClient } from "./_components/posts-client";

export default async function PostsPage() {
  const { posts, totalPages, totalCount } = await getPosts(1, 10);

  return (
    <PostsPageClient
      initialPosts={posts}
      initialTotalPages={totalPages}
      initialTotalCount={totalCount}
    />
  );
}
