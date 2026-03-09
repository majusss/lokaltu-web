"use client";

import {
  acceptFriendRequest,
  cancelFriendRequest,
  removeFriend,
  sendFriendRequest,
} from "@/app/actions/friends";
import { Check, Clock, UserMinus, UserPlus, Users } from "lucide-react";
import { useState, useTransition } from "react";

type FriendStatus = "none" | "sent" | "received" | "friends";

type Props = {
  userId: string;
  initialStatus: FriendStatus;
  initialRequestId: string | null;
};

export default function FriendshipButton({
  userId,
  initialStatus,
  initialRequestId,
}: Props) {
  const [status, setStatus] = useState(initialStatus);
  const [requestId, setRequestId] = useState(initialRequestId);
  const [isPending, startTransition] = useTransition();

  function handleAdd() {
    startTransition(async () => {
      await sendFriendRequest(userId);
      setStatus("sent");
    });
  }

  function handleCancel() {
    if (!requestId) return;
    startTransition(async () => {
      await cancelFriendRequest(requestId);
      setStatus("none");
      setRequestId(null);
    });
  }

  function handleRemove() {
    startTransition(async () => {
      await removeFriend(userId);
      setStatus("none");
      setRequestId(null);
    });
  }

  function handleAccept() {
    if (!requestId) return;
    startTransition(async () => {
      await acceptFriendRequest(requestId);
      setStatus("friends");
    });
  }

  if (status === "friends") {
    return (
      <button
        onClick={handleRemove}
        disabled={isPending}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-[#49BF12]/30 bg-[#F1F9D1] py-3 text-sm font-semibold text-[#49BF12] transition-all active:opacity-70 disabled:opacity-50"
      >
        <Users size={16} />
        Znajomi · Usuń
      </button>
    );
  }

  if (status === "sent") {
    return (
      <button
        onClick={handleCancel}
        disabled={isPending}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-gray-200 py-3 text-sm font-semibold text-gray-500 active:bg-gray-100 disabled:opacity-50"
      >
        <Check size={16} />
        Zaproszenie wysłane · Cofnij
      </button>
    );
  }

  if (status === "received") {
    return (
      <button
        onClick={handleAccept}
        disabled={isPending}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-50 py-3 text-sm font-semibold text-amber-600 active:opacity-70 disabled:opacity-50"
      >
        <Clock size={16} />
        Akceptuj zaproszenie
      </button>
    );
  }

  return (
    <button
      onClick={handleAdd}
      disabled={isPending}
      className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#49BF12] py-3 text-sm font-semibold text-white shadow-sm active:opacity-70 disabled:opacity-50"
    >
      <UserPlus size={16} />
      Dodaj znajomego
    </button>
  );
}
