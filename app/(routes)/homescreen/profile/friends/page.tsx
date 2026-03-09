import {
  getMyFriends,
  getReceivedRequests,
  getSentRequests,
} from "@/app/actions/friends";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import FriendsTabs from "./_components/friends-tabs";

export default async function FriendsPage() {
  const [friends, receivedRequests, sentRequests] = await Promise.all([
    getMyFriends(),
    getReceivedRequests(),
    getSentRequests(),
  ]);

  return (
    <div className="relative min-h-screen bg-white pt-24">
      <div className="absolute top-0 left-0 h-50 w-full bg-[linear-gradient(249.58deg,#61F681_0%,#49BF12_49.21%,#DBC443_97.83%)] pt-8">
        <div className="mb-2 flex items-center gap-2 px-6 pt-6">
          <Link href="/homescreen/profile">
            <ChevronLeft className="h-6 w-6 text-[#E3F8D9]" />
          </Link>
          <h1 className="truncate text-2xl font-semibold text-[#E3F8D9]">
            Znajomi
          </h1>
          {receivedRequests.length > 0 && (
            <span className="ml-auto flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs font-bold text-[#49BF12]">
              {receivedRequests.length}
            </span>
          )}
        </div>
      </div>

      <div className="relative h-full w-full rounded-t-2xl bg-white pb-32 transition-all">
        <FriendsTabs
          friends={friends}
          receivedRequests={receivedRequests}
          sentRequests={sentRequests}
        />
      </div>
    </div>
  );
}
