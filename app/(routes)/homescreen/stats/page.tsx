import { getUserActivity } from "@/app/actions/stats";
import { getUserDb } from "@/app/actions/user";
import ecologySvg from "@/app/assets/ecology.svg";
import pointsSvg from "@/app/assets/points.svg";
import { cn } from "@/lib/utils";
import { getBagsContext, getCO2Context, getLevel } from "@/lib/utils/leveling";
import { ShoppingBag } from "lucide-react";
import Image from "next/image";

export default async function StatsPage() {
  const userDb = await getUserDb();
  const activity = await getUserActivity();

  if (!userDb) return null;

  const points = userDb.lokaltuPoints || 0;
  const level = getLevel(points);
  const co2Saved = userDb.co2Saved || 0;
  const bagsSaved = userDb.bagsSaved || 0;

  const co2Comment = getCO2Context(co2Saved);
  const bagsComment = getBagsContext(bagsSaved);

  // Activity data processing
  const maxVisits = Math.max(...activity.map((a) => a.count), 1);
  const totalVisits = activity.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <div className="relative min-h-screen bg-[#F8F9FA] pt-24">
      {/* Header with Gradient - Match Home Screen pt-8 and absolute positioning */}
      <div className="absolute top-0 left-0 h-50 w-full bg-[linear-gradient(249.58deg,#61F681_0%,#49BF12_49.21%,#DBC443_97.83%)] pt-8">
        <div className="mb-2 px-6">
          <h1 className="truncate pt-6 text-2xl font-semibold text-[#E3F8D9]">
            Sprawdź swoje postępy!
          </h1>
        </div>
      </div>

      {/* Main Content Card - Match Home Screen Container style */}
      <div className="relative h-full w-full space-y-4 rounded-t-2xl bg-white px-6 pt-8 pb-32 transition-all">
        {/* Points Section */}
        <div className="mb-8 flex items-center justify-center gap-4 pt-4">
          <div className="relative h-20 w-20 flex-shrink-0">
            <Image
              src={pointsSvg}
              alt="points"
              fill
              className="object-contain"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-7xl leading-none font-bold tracking-tight text-[#FCB351]">
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

        {/* Level Pill */}
        <div className="mb-10 w-full rounded-full border-2 border-[#D4E84D] bg-[#F1F9D1]/30 py-4 text-center">
          <span className="text-xl font-medium text-[#424242]">
            Poziom {level.level}: {level.name}
          </span>
        </div>

        {/* Environmental Impact Section */}
        <div className="space-y-4">
          <h2 className="px-1 text-xl font-bold text-gray-900">
            Twój wpływ na planetę
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {/* CO2 Card */}
            <div className="flex flex-col rounded-[24px] border border-gray-100 bg-white p-5 shadow-sm">
              <div className="mb-4 flex h-24 w-full items-center justify-center">
                <Image
                  src={ecologySvg}
                  alt="CO2"
                  width={80}
                  height={80}
                  className="brightness-0 hue-rotate-[65deg] invert-[.4] saturate-[20]"
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

            {/* Bags Card */}
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

        {/* Activity Section */}
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
      </div>
    </div>
  );
}
