"use client";

import { removeFriend } from "@/app/actions/friends";
import { getLevel } from "@/lib/utils/leveling";
import { cn } from "@/lib/utils";
import { MoreVertical, UserMinus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState, useTransition } from "react";

type Friend = {
  id: string;
  name: string;
  avatarUrl: string;
  lokaltuPoints: number;
  co2Saved: number;
  bagsSaved: number;
};

type Props = {
  requestId: string;
  friend: Friend;
};

export default function FriendCard({ requestId, friend }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const menuRef = useRef<HTMLDivElement>(null);
  const level = getLevel(friend.lokaltuPoints);

  function handleRemove() {
    setMenuOpen(false);
    startTransition(async () => {
      await removeFriend(friend.id);
    });
  }

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-opacity",
        isPending && "opacity-50",
      )}
    >
      {/* Avatar + Info — tappable link to profile */}
      <Link
        href={`/homescreen/profile/${friend.id}`}
        className="flex min-w-0 flex-1 items-center gap-3"
      >
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-gray-200">
          <Image
            src={friend.avatarUrl}
            alt={friend.name}
            fill
            className="object-cover"
          />
        </div>

        <div className="flex min-w-0 flex-col">
          <span className="truncate font-semibold text-gray-800">
            {friend.name}
          </span>
          <span className="text-xs text-gray-400">
            Poziom {level.level} · {friend.lokaltuPoints} pkt
          </span>
          <div className="mt-1 flex gap-3 text-[11px] text-gray-400">
            <span>{friend.co2Saved.toFixed(1)} kg CO₂</span>
            <span>·</span>
            <span>{friend.bagsSaved} toreb</span>
          </div>
        </div>
      </Link>

      {/* Three-dot menu */}
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 active:bg-gray-100"
          aria-label="Opcje"
        >
          <MoreVertical size={18} />
        </button>

        {menuOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setMenuOpen(false)}
            />
            {/* Dropdown */}
            <div className="absolute right-0 z-20 mt-1 w-44 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg">
              <button
                onClick={handleRemove}
                className="flex w-full items-center gap-2 px-4 py-3 text-sm font-medium text-red-500 active:bg-red-50"
              >
                <UserMinus size={16} />
                Usuń znajomego
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
