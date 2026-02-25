import { Progress } from "@/components/ui/progress";
import Image from "next/image";

import { amIAdmin } from "@/app/actions/admin";
import { getPosts } from "@/app/actions/posts";
import { getUserDb } from "@/app/actions/user";
import ecology from "@/app/assets/ecology.svg";
import poins from "@/app/assets/points.svg";
import { currentUser } from "@clerk/nextjs/server";
import { NearbyShops } from "./_components/nearby-shops";
import { PostsList } from "./_components/posts-list";

function StatsBar({
  lokaltuPoints,
  co2Saved,
}: {
  lokaltuPoints: number;
  co2Saved: number;
}) {
  return (
    <div className="flex w-full justify-around rounded-t-2xl bg-white/10 px-6 py-2 pb-6 font-semibold text-white backdrop-blur-sm">
      <div className="inline-flex items-center gap-2">
        <Image src={poins} alt="points icon" width={32} height={32} />
        {lokaltuPoints || 0} pkt lokalności
      </div>
      <div className="border-l border-white/20" />
      <div className="inline-flex items-center gap-2">
        <Image src={ecology} alt="ecology icon" width={26} height={26} />
        {co2Saved || 0} kg CO₂ mniej
      </div>
    </div>
  );
}

function UserChallanges() {
  return (
    <div className="pt-2">
      <div className="mb-4 flex items-center justify-between px-1.5">
        <h2 className="text-xl font-bold text-gray-900">Aktualne wyzwania</h2>
        <span className="text-xs font-bold text-[#49BF12]">Wszystkie</span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="group flex flex-col rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:shadow-md">
          <div className="w-fit rounded-lg bg-[#FFF4E6] px-2.5 py-1">
            <span className="text-[10px] font-black tracking-tight text-[#FCB351] uppercase">
              Zyskaj x5 punktów
            </span>
          </div>
          <p className="mt-3 text-sm leading-tight font-bold text-gray-800">
            Zrób zakupy w 5 sklepach w tym tygodniu
          </p>
          <div className="mt-auto pt-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[10px] font-bold text-gray-400 uppercase">
                Postęp
              </span>
              <span className="text-xs font-black text-gray-700">3 z 5</span>
            </div>
            <Progress value={60} className="h-1.5 w-full bg-gray-50" />
          </div>
        </div>

        <div className="group flex flex-col rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:shadow-md">
          <div className="w-fit rounded-lg bg-[#49BF12]/10 px-2.5 py-1">
            <span className="text-[10px] font-black tracking-tight text-[#49BF12] uppercase">
              Zyskaj x3 punktów
            </span>
          </div>
          <p className="mt-3 text-sm leading-tight font-bold text-gray-800">
            Pierwsze 50 lokalnych zakupów
          </p>
          <div className="mt-auto pt-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[10px] font-bold text-gray-400 uppercase">
                Postęp
              </span>
              <span className="text-xs font-black text-gray-700">44 z 50</span>
            </div>
            <Progress value={88} className="h-1.5 w-full bg-gray-50" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function HomescreenPage() {
  const user = await currentUser();
  const { lokaltuPoints, co2Saved } = (await getUserDb()) ?? {
    lokaltuPoints: 0,
    co2Saved: 0,
  };
  const posts = await getPosts(1, 10);
  const isAdmin = !!(await amIAdmin());

  return (
    <div className="relative pt-24">
      <div className="absolute top-0 left-0 h-50 w-full bg-[linear-gradient(249.58deg,#61F681_0%,#49BF12_49.21%,#DBC443_97.83%)] pt-8">
        <div className="mb-2 px-6">
          <h1 className="break- truncate pt-6 text-2xl font-semibold text-[#E3F8D9]">
            Co dzisiaj nowego, {user?.username}?
          </h1>
        </div>
      </div>
      <StatsBar lokaltuPoints={lokaltuPoints} co2Saved={co2Saved} />
      <div className="h-full w-full -translate-y-4 space-y-4 rounded-t-2xl bg-white px-6 pt-4 pb-18">
        <PostsList
          posts={posts.posts}
          currentUserId={user?.id ?? ""}
          isAdmin={isAdmin}
        />
        <UserChallanges />
        <NearbyShops />
      </div>
    </div>
  );
}
