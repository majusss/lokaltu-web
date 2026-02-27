import { getUserAchievements } from "@/app/actions/achievements";
import { cn } from "@/lib/utils";
import { ChevronLeft, Lock, Trophy } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function BadgesPage() {
  const achievements = await getUserAchievements();

  return (
    <div className="relative min-h-screen bg-white pt-24">
      <div className="absolute top-0 left-0 h-50 w-full bg-[linear-gradient(249.58deg,#61F681_0%,#49BF12_49.21%,#DBC443_97.83%)] pt-8">
        <div className="mb-2 flex items-center gap-2 px-6 pt-6">
          <Link href="/homescreen/profile">
            <ChevronLeft className="h-6 w-6 text-[#E3F8D9]" />
          </Link>
          <h1 className="truncate text-2xl font-semibold text-[#E3F8D9]">
            Twoje odznaki
          </h1>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="relative h-full w-full space-y-6 rounded-t-2xl bg-white px-6 pt-10 pb-32 transition-all">
        <div className="grid grid-cols-2 gap-4">
          {achievements.map((badge) => (
            <div
              key={badge.id}
              className={cn(
                "group relative flex flex-col items-center overflow-hidden rounded-[2rem] border p-6 text-center transition-all",
                badge.isEarned
                  ? "border-amber-100 bg-white shadow-sm hover:shadow-md"
                  : "border-gray-50 bg-gray-50/50 opacity-60 grayscale",
              )}
            >
              <div
                className={cn(
                  "relative mb-4 flex h-20 w-20 items-center justify-center rounded-full transition-all",
                  badge.isEarned ? "bg-[#F1F9D1]" : "bg-gray-200",
                )}
              >
                {badge.isEarned ? (
                  <>
                    <div className="absolute inset-0 animate-pulse rounded-full bg-[#D4E84D]/20" />
                    <Trophy className="relative z-10 h-10 w-10 text-[#FCB351]" />
                  </>
                ) : (
                  <Lock className="h-8 w-8 text-gray-400" />
                )}
              </div>
              <h3
                className={cn(
                  "text-sm font-bold",
                  badge.isEarned ? "text-gray-800" : "text-gray-500",
                )}
              >
                {badge.name}
              </h3>
              <p className="mt-1 text-[10px] leading-tight font-medium text-gray-400">
                {badge.description}
              </p>
              {badge.isEarned ? (
                <div className="mt-3 rounded-full bg-amber-50 px-3 py-1 text-[10px] font-bold text-amber-600">
                  +{badge.points} pkt
                </div>
              ) : (
                <div className="mt-3 rounded-full bg-gray-100 px-3 py-1 text-[10px] font-bold text-gray-400">
                  Zablokowane
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
