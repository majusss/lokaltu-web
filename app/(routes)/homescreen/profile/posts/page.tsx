import { getUserPosts } from "@/app/actions/posts";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { MyPostsList } from "./_components/posts-list";

export const dynamic = "force-dynamic";

export default async function MyPostsPage() {
  const posts = await getUserPosts();

  return (
    <div className="relative min-h-screen bg-white pt-24">
      {/* Background Gradient Header */}
      <div className="absolute top-0 left-0 h-50 w-full bg-[linear-gradient(249.58deg,#61F681_0%,#49BF12_49.21%,#DBC443_97.83%)] pt-8">
        <div className="mb-2 flex items-center gap-2 px-6 pt-6">
          <Link href="/homescreen/profile">
            <ChevronLeft className="h-6 w-6 text-[#E3F8D9]" />
          </Link>
          <h1 className="truncate text-2xl font-semibold text-[#E3F8D9]">
            Moje posty
          </h1>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="relative h-full w-full space-y-6 rounded-t-2xl bg-white px-6 pt-10 pb-32 transition-all">
        <MyPostsList posts={posts} />
      </div>
    </div>
  );
}
