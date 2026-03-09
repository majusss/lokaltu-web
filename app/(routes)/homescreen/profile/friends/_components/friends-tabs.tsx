"use client";

import { useState } from "react";
import FriendsList from "./friends-list";
import RequestsList from "./requests-list";
import SearchUsers from "./search-users";
import { cn } from "@/lib/utils";

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

type ReceivedRequest = {
  id: string;
  senderId: string;
  receiverId: string;
  status: string;
  createdAt: Date;
  sender: {
    id: string;
    name: string;
    avatarUrl: string;
    lokaltuPoints: number;
  };
};

type SentRequest = {
  id: string;
  senderId: string;
  receiverId: string;
  status: string;
  createdAt: Date;
  receiver: {
    id: string;
    name: string;
    avatarUrl: string;
  };
};

type Props = {
  friends: Friend[];
  receivedRequests: ReceivedRequest[];
  sentRequests: SentRequest[];
};

type Tab = "friends" | "requests" | "search";

export default function FriendsTabs({
  friends,
  receivedRequests,
  sentRequests,
}: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("friends");

  const tabs: { id: Tab; label: string; badge?: number }[] = [
    { id: "friends", label: "Znajomi", badge: friends.length || undefined },
    {
      id: "requests",
      label: "Zaproszenia",
      badge: receivedRequests.length || undefined,
    },
    { id: "search", label: "Szukaj" },
  ];

  return (
    <div>
      {/* Tab bar */}
      <div className="flex border-b border-gray-100 px-6 pt-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "relative flex flex-1 items-center justify-center gap-1.5 pb-3 text-sm font-semibold transition-colors",
              activeTab === tab.id
                ? "text-[#49BF12]"
                : "text-gray-400 active:text-gray-600",
            )}
          >
            {tab.label}
            {tab.badge !== undefined && tab.badge > 0 && (
              <span
                className={cn(
                  "flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[10px] font-bold",
                  activeTab === tab.id
                    ? "bg-[#49BF12] text-white"
                    : "bg-gray-200 text-gray-500",
                )}
              >
                {tab.badge}
              </span>
            )}
            {activeTab === tab.id && (
              <span className="absolute bottom-0 left-0 h-0.5 w-full rounded-full bg-[#49BF12]" />
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="px-6 pt-6">
        {activeTab === "friends" && <FriendsList friends={friends} />}
        {activeTab === "requests" && (
          <RequestsList
            receivedRequests={receivedRequests}
            sentRequests={sentRequests}
          />
        )}
        {activeTab === "search" && <SearchUsers />}
      </div>
    </div>
  );
}
