"use client";

import { cancelFriendRequest, searchUsers, sendFriendRequest } from "@/app/actions/friends";
import { getLevel } from "@/lib/utils/leveling";
import { cn } from "@/lib/utils";
import { Check, Clock, Search, UserPlus, Users } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";

type SearchResult = {
  id: string;
  name: string;
  avatarUrl: string;
  lokaltuPoints: number;
  friendStatus: "none" | "sent" | "received" | "friends";
  requestId: string | null;
};

function SearchResultCard({
  user,
  onStatusChange,
}: {
  user: SearchResult;
  onStatusChange: (id: string, status: SearchResult["friendStatus"], requestId: string | null) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const level = getLevel(user.lokaltuPoints);

  function handleAdd() {
    startTransition(async () => {
      await sendFriendRequest(user.id);
      onStatusChange(user.id, "sent", null);
    });
  }

  function handleCancel() {
    if (!user.requestId) return;
    startTransition(async () => {
      await cancelFriendRequest(user.requestId!);
      onStatusChange(user.id, "none", null);
    });
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
          src={user.avatarUrl}
          alt={user.name}
          fill
          className="object-cover"
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate font-semibold text-gray-800">{user.name}</span>
        <span className="text-xs text-gray-400">
          Poziom {level.level} · {user.lokaltuPoints} pkt
        </span>
      </div>

      {user.friendStatus === "friends" && (
        <span className="flex shrink-0 items-center gap-1 rounded-full bg-[#F1F9D1] px-3 py-1.5 text-xs font-semibold text-[#49BF12]">
          <Users size={12} />
          Znajomi
        </span>
      )}

      {user.friendStatus === "received" && (
        <span className="flex shrink-0 items-center gap-1 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-600">
          <Clock size={12} />
          Czeka
        </span>
      )}

      {user.friendStatus === "sent" && (
        <button
          onClick={handleCancel}
          disabled={isPending}
          className="flex shrink-0 items-center gap-1 rounded-full border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-500 active:bg-gray-100 disabled:opacity-50"
        >
          <Check size={12} />
          Wysłano
        </button>
      )}

      {user.friendStatus === "none" && (
        <button
          onClick={handleAdd}
          disabled={isPending}
          className="flex shrink-0 items-center gap-1 rounded-full bg-[#49BF12] px-3 py-1.5 text-xs font-semibold text-white shadow-sm active:opacity-70 disabled:opacity-50"
        >
          <UserPlus size={12} />
          Dodaj
        </button>
      )}
    </div>
  );
}

export default function SearchUsers() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    try {
      const res = await searchUsers(q);
      setResults(res);
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) {
      setResults([]);
      return;
    }
    debounceRef.current = setTimeout(() => doSearch(query), 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, doSearch]);

  function handleStatusChange(
    id: string,
    status: SearchResult["friendStatus"],
    requestId: string | null,
  ) {
    setResults((prev) =>
      prev.map((u) => (u.id === id ? { ...u, friendStatus: status, requestId } : u)),
    );
  }

  return (
    <div className="space-y-4">
      {/* Search input */}
      <div className="relative">
        <Search
          size={16}
          className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Wpisz imię lub nazwę użytkownika..."
          className="w-full rounded-xl border border-gray-200 bg-white py-3 pr-4 pl-9 text-sm outline-none ring-0 placeholder:text-gray-400 focus:border-[#49BF12] focus:ring-1 focus:ring-[#49BF12]/30"
        />
      </div>

      {/* States */}
      {!query.trim() && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Search size={40} className="mb-3 text-gray-200" />
          <p className="text-sm text-gray-400">
            Wyszukaj użytkowników po nazwie
          </p>
        </div>
      )}

      {query.trim() && isSearching && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4"
            >
              <div className="h-12 w-12 animate-pulse rounded-full bg-gray-100" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 w-32 animate-pulse rounded-full bg-gray-100" />
                <div className="h-3 w-20 animate-pulse rounded-full bg-gray-100" />
              </div>
            </div>
          ))}
        </div>
      )}

      {query.trim() && !isSearching && results.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="font-semibold text-gray-500">Brak wyników</p>
          <p className="mt-1 text-sm text-gray-400">
            Nie znaleziono użytkowników dla &quot;{query}&quot;
          </p>
        </div>
      )}

      {!isSearching && results.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            {results.length} {results.length === 1 ? "wynik" : "wyników"}
          </p>
          {results.map((user) => (
            <SearchResultCard
              key={user.id}
              user={user}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}
    </div>
  );
}
