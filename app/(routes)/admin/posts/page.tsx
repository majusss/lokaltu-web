import { getAdminPosts } from "@/app/actions/admin";
import { PostsPageClient } from "./_components/posts-client";

export default async function PostsPage() {
  const { posts, totalPages, totalCount } = await getAdminPosts(1, 10);

  return (
    <PostsPageClient
      initialPosts={posts}
      initialTotalPages={totalPages}
      initialTotalCount={totalCount}
    />
  );
}
