import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import Image from "next/image";

import { amIAdmin } from "@/app/actions/admin";
import { getUserChallenges } from "@/app/actions/challenges";
import { getPosts } from "@/app/actions/posts";
import { getUserDb } from "@/app/actions/user";
import ecology from "@/app/assets/ecology.svg";
import poins from "@/app/assets/points.svg";
import {
  getBagsContext,
  getCO2Context,
  getLevel,
  getProgressToNextLevel,
} from "@/lib/utils/leveling";
import { currentUser } from "@clerk/nextjs/server";
import { NearbyShops } from "./_components/nearby-shops";
import { PostsList } from "./_components/posts-list";

function StatsBar({
  lokaltuPoints,
  co2Saved,
  bagsSaved,
}: {
  lokaltuPoints: number;
  co2Saved: number;
  bagsSaved: number;
}) {
  const level = getLevel(lokaltuPoints);
  const co2Comment = getCO2Context(co2Saved);
  const bagsComment = getBagsContext(bagsSaved);

  return (
    <div className="flex w-full flex-col">
      <div className="flex w-full justify-around rounded-t-2xl bg-white/10 px-6 py-2 pb-6 font-semibold text-white backdrop-blur-sm">
        <div className="inline-flex items-center gap-2">
          <Image src={poins} alt="points icon" width={32} height={32} />
          {lokaltuPoints || 0} pkt
        </div>
        <div className="border-l border-white/20" />
        <div className="inline-flex items-center gap-2">
          <Image src={ecology} alt="ecology icon" width={26} height={26} />
          {co2Saved.toFixed(1)} kg CO₂
        </div>
      </div>

      <div className="mx-6 -mt-3 mb-2 rounded-xl bg-white/20 px-4 py-2 text-center text-[11px] font-bold text-white backdrop-blur-md">
        Poziom {level.level}: {level.name} (
        {getProgressToNextLevel(lokaltuPoints)}%)
      </div>
    </div>
  );
}

function UserChallanges({ challenges }: { challenges: any[] }) {
  if (challenges.length === 0) return null;

  return (
    <div className="pt-2">
      <div className="mb-4 flex items-center justify-between px-1.5">
        <h2 className="text-xl font-bold text-gray-900">Twoje wyzwania</h2>
        <span className="text-xs font-bold text-[#49BF12]">Wszystkie</span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {challenges.slice(0, 4).map((ch) => (
          <div
            key={ch.challengeId}
            className="group flex flex-col rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:shadow-md"
          >
            <div
              className={cn(
                "w-fit rounded-lg px-2.5 py-1",
                ch.isCompleted ? "bg-[#49BF12]/10" : "bg-[#FFF4E6]",
              )}
            >
              <span
                className={cn(
                  "text-[10px] font-black tracking-tight uppercase",
                  ch.isCompleted ? "text-[#49BF12]" : "text-[#FCB351]",
                )}
              >
                {ch.isCompleted
                  ? "Ukończone"
                  : `Nagroda: ${ch.challenge.points} pkt`}
              </span>
            </div>
            <p className="mt-3 text-sm leading-tight font-bold text-gray-800">
              {ch.challenge.name}
            </p>
            <p className="mt-1 text-[11px] font-medium text-gray-400">
              {ch.challenge.description}
            </p>
            <div className="mt-auto pt-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[10px] font-bold text-gray-400 uppercase">
                  Postęp
                </span>
                <span className="text-xs font-black text-gray-700">
                  {ch.current} z {ch.challenge.goal}
                </span>
              </div>
              <Progress
                value={(ch.current / ch.challenge.goal) * 100}
                className="h-1.5 w-full bg-gray-50"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function HomescreenPage() {
  const user = await currentUser();
  const userDb = await getUserDb();

  const points = userDb?.lokaltuPoints ?? 0;
  const co2 = userDb?.co2Saved ?? 0;
  const bags = userDb?.bagsSaved ?? 0;

  const posts = await getPosts(1, 10);
  const isAdmin = !!(await amIAdmin());
  const challenges = await getUserChallenges();

  return (
    <div className="relative pt-24">
      <div className="absolute top-0 left-0 h-50 w-full bg-[linear-gradient(249.58deg,#61F681_0%,#49BF12_49.21%,#DBC443_97.83%)] pt-8">
        <div className="mb-2 px-6">
          <h1 className="truncate pt-6 text-2xl font-semibold text-[#E3F8D9]">
            Co dzisiaj nowego,{" "}
            {user?.firstName || userDb?.name || "Użytkowniku"}?
          </h1>
        </div>
      </div>

      <StatsBar lokaltuPoints={points} co2Saved={co2} bagsSaved={bags} />

      <div className="h-full w-full -translate-y-4 space-y-4 rounded-t-2xl bg-white px-6 pt-4 pb-18 transition-all">
        <PostsList
          posts={posts.posts}
          currentUserId={user?.id ?? ""}
          isAdmin={isAdmin}
        />
        <UserChallanges challenges={challenges} />
        <NearbyShops />
      </div>
    </div>
  );
}
