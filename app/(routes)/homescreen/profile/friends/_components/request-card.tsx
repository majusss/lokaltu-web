"use client";

import {
  acceptFriendRequest,
  cancelFriendRequest,
  rejectFriendRequest,
} from "@/app/actions/friends";
import { getLevel } from "@/lib/utils/leveling";
import { Check, X } from "lucide-react";
import Image from "next/image";
import { useTransition } from "react";
import { cn } from "@/lib/utils";

type ReceivedRequest = {
  id: string;
  sender: {
    id: string;
    name: string;
    avatarUrl: string;
    lokaltuPoints: number;
  };
};

type SentRequest = {
  id: string;
  receiver: {
    id: string;
    name: string;
    avatarUrl: string;
  };
};

// ─── Received request card ────────────────────────────────────────────────────

export function ReceivedRequestCard({ request }: { request: ReceivedRequest }) {
  const [isPending, startTransition] = useTransition();
  const level = getLevel(request.sender.lokaltuPoints);

  function handleAccept() {
    startTransition(() => acceptFriendRequest(request.id));
  }
  function handleReject() {
    startTransition(() => rejectFriendRequest(request.id));
  }

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-opacity",
        isPending && "opacity-50",
      )}
    >
      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-gray-200">
        <Image
          src={request.sender.avatarUrl}
          alt={request.sender.name}
          fill
          className="object-cover"
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate font-semibold text-gray-800">
          {request.sender.name}
        </span>
        <span className="text-xs text-gray-400">
          Poziom {level.level} · {request.sender.lokaltuPoints} pkt
        </span>
      </div>

      <div className="flex shrink-0 gap-2">
        <button
          onClick={handleAccept}
          disabled={isPending}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-[#49BF12] text-white shadow-sm active:opacity-70 disabled:opacity-50"
          aria-label="Zaakceptuj"
        >
          <Check size={16} strokeWidth={3} />
        </button>
        <button
          onClick={handleReject}
          disabled={isPending}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-500 active:opacity-70 disabled:opacity-50"
          aria-label="Odrzuć"
        >
          <X size={16} strokeWidth={3} />
        </button>
      </div>
    </div>
  );
}

// ─── Sent request card ────────────────────────────────────────────────────────

export function SentRequestCard({ request }: { request: SentRequest }) {
  const [isPending, startTransition] = useTransition();

  function handleCancel() {
    startTransition(() => cancelFriendRequest(request.id));
  }

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-opacity",
        isPending && "opacity-50",
      )}
    >
      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-gray-200">
        <Image
          src={request.receiver.avatarUrl}
          alt={request.receiver.name}
          fill
          className="object-cover"
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate font-semibold text-gray-800">
          {request.receiver.name}
        </span>
        <span className="text-xs text-gray-400">Oczekuje na akceptację...</span>
      </div>

      <button
        onClick={handleCancel}
        disabled={isPending}
        className="shrink-0 rounded-full border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-500 active:bg-gray-100 disabled:opacity-50"
      >
        Cofnij
      </button>
    </div>
  );
}
