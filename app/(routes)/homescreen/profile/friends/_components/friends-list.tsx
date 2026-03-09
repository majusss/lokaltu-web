import FriendCard from "./friend-card";
import { Users } from "lucide-react";
import Link from "next/link";

type Friend = {
  requestId: string;
  friend: {
    id: string;
    name: string;
    avatarUrl: string;
    lokaltuPoints: number;
    co2Saved: number;
    bagsSaved: number;
  };
};

export default function FriendsList({ friends }: { friends: Friend[] }) {
  if (friends.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Users size={48} className="mb-4 text-gray-200" />
        <p className="font-semibold text-gray-500">Brak znajomych</p>
        <p className="mt-1 text-sm text-gray-400">
          Przejdź do zakładki{" "}
          <span className="font-semibold text-[#49BF12]">Szukaj</span>, aby
          znaleźć znajomych.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
        {friends.length} {friends.length === 1 ? "znajomy" : friends.length < 5 ? "znajomych" : "znajomych"}
      </p>
      {friends.map(({ requestId, friend }) => (
        <FriendCard key={requestId} requestId={requestId} friend={friend} />
      ))}
    </div>
  );
}
