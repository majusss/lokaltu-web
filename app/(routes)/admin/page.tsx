import { getAdminPosts } from "@/app/actions/admin";
import { AdminPageClient } from "./_components/admin-page-client";

export default async function AdminPage() {
  const { posts, totalPages } = await getAdminPosts(1, 10);

  return (
    <AdminPageClient initialPosts={posts} initialTotalPages={totalPages} />
  );
}
