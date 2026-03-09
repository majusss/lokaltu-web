import { getFriendsStats, getUserActivity } from "@/app/actions/stats";
import { getUserDb } from "@/app/actions/user";
import ecologySvg from "@/app/assets/ecology.svg";
import pointsSvg from "@/app/assets/points.svg";
import { cn } from "@/lib/utils";
import { getBagsContext, getCO2Context, getLevel } from "@/lib/utils/leveling";
import { ShoppingBag, Trophy, Users } from "lucide-react";
import Image from "next/image";

export default async function StatsPage() {
  const userDb = await getUserDb();
  const activity = await getUserActivity();
  const friendsStats = await getFriendsStats();

  if (!userDb) return null;

  const points = userDb.lokaltuPoints || 0;
  const level = getLevel(points);
  const co2Saved = userDb.co2Saved || 0;
  const bagsSaved = userDb.bagsSaved || 0;

  const co2Comment = getCO2Context(co2Saved);
  const bagsComment = getBagsContext(bagsSaved);

  const maxVisits = Math.max(...activity.map((a) => a.count), 1);
  const totalVisits = activity.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <div className="relative min-h-screen bg-white pt-24">
      <div className="absolute top-0 left-0 h-50 w-full bg-[linear-gradient(249.58deg,#61F681_0%,#49BF12_49.21%,#DBC443_97.83%)] pt-8">
        <div className="mb-2 px-6">
          <h1 className="truncate pt-6 text-2xl font-semibold text-[#E3F8D9]">
            Sprawdź swoje postępy!
          </h1>
        </div>
      </div>

      <div className="relative h-full w-full space-y-4 rounded-t-2xl bg-white px-6 pt-8 pb-32 shadow-sm transition-all">
        <div className="mb-8 flex items-center justify-center gap-4 pt-4">
          <div className="relative h-20 w-20 shrink-0">
            <Image
              src={pointsSvg}
              alt="points"
              fill
              className="object-contain"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-7xl font-bold tracking-tight text-[#FCB351]">
              {points}
            </span>
            <div className="-mt-1 flex flex-col">
              <span className="text-lg leading-tight font-bold text-[#FCB351]">
                punktów
              </span>
              <span className="text-lg leading-tight font-bold text-[#FCB351]">
                lokalności
              </span>
            </div>
          </div>
        </div>

        <div className="mb-10 w-full rounded-full border-2 border-[#D4E84D] bg-[#F1F9D1]/30 py-4 text-center">
          <span className="text-xl font-medium text-[#424242]">
            Poziom {level.level}: {level.name}
          </span>
        </div>

        <div className="space-y-4">
          <h2 className="px-1 text-xl font-bold text-gray-900">
            Twój wpływ na planetę
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col rounded-[24px] border border-gray-100 bg-white p-5 shadow-sm">
              <div className="mb-4 flex h-24 w-full items-center justify-center">
                <Image
                  src={ecologySvg}
                  alt="CO2"
                  width={80}
                  height={80}
                  className="brightness-0 hue-rotate-65 invert-[.4] saturate-[20]"
                />
              </div>
              <h3 className="text-sm font-bold text-gray-800">
                Zaoszczędzone CO₂
              </h3>
              <span className="text-sm font-bold text-[#FCB351]">
                {co2Saved.toFixed(1)} kg
              </span>
              <p className="mt-2 text-[11px] leading-tight font-medium text-[#4CAF50]">
                {co2Comment}
              </p>
            </div>

            <div className="flex flex-col rounded-[24px] border border-gray-100 bg-white p-5 shadow-sm">
              <div className="mb-4 flex h-24 w-full items-center justify-center">
                <ShoppingBag
                  size={64}
                  className="fill-[#4CAF50]/10 text-[#4CAF50]"
                  strokeWidth={1.5}
                />
              </div>
              <h3 className="text-sm font-bold text-gray-800">
                Uniknięte torby
              </h3>
              <span className="text-sm font-bold text-[#FCB351]">
                {bagsSaved} sztuki
              </span>
              <p className="mt-2 text-[11px] leading-tight font-medium text-[#4CAF50]">
                {bagsComment}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 mb-4">
          <h2 className="mb-6 px-1 text-xl font-bold text-gray-900">
            Twoja Aktywność
          </h2>

          <div className="flex h-24 items-end justify-between gap-4 px-2">
            {activity.map((day, idx) => {
              const height = (day.count / maxVisits) * 100;
              return (
                <div
                  key={day.date}
                  className="flex h-full flex-1 flex-col items-center justify-end"
                >
                  <div
                    className={cn(
                      "w-full rounded-t-lg transition-all duration-500",
                      idx === activity.length - 1
                        ? "bg-[#D4E84D]"
                        : "bg-[#F1F7F9]",
                    )}
                    style={{ height: `${Math.max(height, 5)}%` }}
                  />
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex items-center justify-between text-xs font-bold text-gray-400">
            <span className="rounded-full bg-[#F1F7F9] px-3 py-1">
              {totalVisits} zakupów
            </span>
          </div>
        </div>

        {/* ── Friends Stats ─────────────────────────────────────────── */}
        {friendsStats && (
          <div className="mt-12 space-y-4">
            <div className="flex items-center gap-2 px-1">
              <Users size={20} className="text-[#49BF12]" />
              <h2 className="text-xl font-bold text-gray-900">
                Twoi znajomi
              </h2>
            </div>

            {friendsStats.totalFriends === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-[24px] border border-gray-100 bg-[#F9FDF5] py-10 text-center">
                <Users size={40} className="mb-3 text-[#49BF12]/40" />
                <p className="font-semibold text-gray-500">
                  Nie masz jeszcze znajomych
                </p>
                <p className="mt-1 text-sm text-gray-400">
                  Dodaj znajomych w zakładce Konto → Znajomi
                </p>
              </div>
            ) : (
              <>
                {/* Quick stats grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col rounded-[24px] border border-gray-100 bg-white p-4 shadow-sm">
                    <span className="text-3xl font-bold text-[#49BF12]">
                      {friendsStats.totalFriends}
                    </span>
                    <span className="mt-1 text-xs font-semibold text-gray-500">
                      znajomych
                    </span>
                  </div>

                  <div className="flex flex-col rounded-[24px] border border-gray-100 bg-white p-4 shadow-sm">
                    <span className="text-3xl font-bold text-[#49BF12]">
                      {friendsStats.activeThisWeek}
                    </span>
                    <span className="mt-1 text-xs font-semibold text-gray-500">
                      aktywnych w tym tygodniu
                    </span>
                  </div>

                  <div className="flex flex-col rounded-[24px] border border-gray-100 bg-white p-4 shadow-sm">
                    <span className="text-3xl font-bold text-[#FCB351]">
                      {friendsStats.combinedCO2.toFixed(1)}
                      <span className="text-base font-semibold"> kg</span>
                    </span>
                    <span className="mt-1 text-xs font-semibold text-gray-500">
                      CO₂ razem z grupą
                    </span>
                  </div>

                  <div className="flex flex-col rounded-[24px] border border-gray-100 bg-white p-4 shadow-sm">
                    <span className="text-3xl font-bold text-[#FCB351]">
                      {friendsStats.combinedBags}
                    </span>
                    <span className="mt-1 text-xs font-semibold text-gray-500">
                      toreb razem z grupą
                    </span>
                  </div>
                </div>

                {/* Leaderboard */}
                <div className="mt-2 rounded-[24px] border border-gray-100 bg-white p-5 shadow-sm">
                  <div className="mb-4 flex items-center gap-2">
                    <Trophy size={16} className="text-[#FCB351]" />
                    <h3 className="font-bold text-gray-800">
                      Ranking wśród znajomych
                    </h3>
                    {friendsStats.myRank !== null && (
                      <span className="ml-auto rounded-full bg-[#F1F9D1] px-2 py-0.5 text-xs font-bold text-[#49BF12]">
                        #{friendsStats.myRank} miejsce
                      </span>
                    )}
                  </div>

                  <div className="space-y-3">
                    {friendsStats.leaderboard.map((entry) => (
                      <div
                        key={entry.id}
                        className={cn(
                          "flex items-center gap-3 rounded-2xl px-3 py-2",
                          entry.isMe
                            ? "bg-[#F1F9D1] ring-1 ring-[#D4E84D]"
                            : "bg-gray-50",
                        )}
                      >
                        <span
                          className={cn(
                            "w-5 text-center text-sm font-bold",
                            entry.rank === 1
                              ? "text-[#FFD700]"
                              : entry.rank === 2
                                ? "text-[#C0C0C0]"
                                : entry.rank === 3
                                  ? "text-[#CD7F32]"
                                  : "text-gray-400",
                          )}
                        >
                          {entry.rank === 1
                            ? "🥇"
                            : entry.rank === 2
                              ? "🥈"
                              : entry.rank === 3
                                ? "🥉"
                                : `#${entry.rank}`}
                        </span>

                        <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full bg-gray-200">
                          <Image
                            src={entry.avatarUrl}
                            alt={entry.name}
                            fill
                            className="object-cover"
                          />
                        </div>

                        <div className="flex min-w-0 flex-1 flex-col">
                          <span className="truncate text-sm font-semibold text-gray-800">
                            {entry.isMe ? "Ty" : entry.name}
                          </span>
                          <span className="text-[11px] text-gray-400">
                            {entry.level.name}
                          </span>
                        </div>

                        <span className="shrink-0 text-sm font-bold text-[#FCB351]">
                          {entry.lokaltuPoints} pkt
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
