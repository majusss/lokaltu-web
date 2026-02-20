import { Progress } from "@/components/ui/progress";
import Image from "next/image";

import { amIAdmin } from "@/app/actions/admin";
import { getPosts } from "@/app/actions/posts";
import ecology from "@/app/assets/ecology.svg";
import poins from "@/app/assets/points.svg";
import { currentUser } from "@clerk/nextjs/server";
import { NearbyShops } from "./_components/nearby-shops";
import { PostsList } from "./_components/posts-list";

function StatsBar() {
  return (
    <div className="flex w-full justify-around rounded-t-2xl bg-white/10 px-6 py-2 pb-6 font-semibold text-white backdrop-blur-sm">
      <div className="inline-flex items-center gap-2">
        <Image src={poins} alt="points icon" width={32} height={32} />
        175 pkt lokalności
      </div>
      <div className="border-l border-white/20" />
      <div className="inline-flex items-center gap-2">
        <Image src={ecology} alt="ecology icon" width={26} height={26} />
        232 kg CO₂ mniej
      </div>
    </div>
  );
}

function UserChallanges() {
  return (
    <div>
      <h2 className="ml-1.5 text-2xl font-semibold">Aktualne wyzwania</h2>
      {/* fck carusel */}
      <div className="mt-3 grid grid-cols-2 gap-4 overflow-x-auto">
        <div className="flex flex-col rounded-2xl border-[0.5px] border-[#E1E1E1] p-4">
          <div className="w-fit rounded-md bg-[#FFF4E6] px-2">
            <span className="text-xs font-bold text-[#FCB351]">
              Zyskaj x5 punktów
            </span>
          </div>
          <p className="mt-2 h-full font-medium">
            Zrób zakupy w 5 sklepach w tym tygodniu
          </p>
          <div className="mt-4 inline-flex w-full items-center gap-4">
            <Progress value={60} className="h-2.5 w-full" />
            <span className="w-fit font-medium whitespace-nowrap text-[#475467]">
              3 z 5
            </span>
          </div>
        </div>
        <div className="flex flex-col rounded-2xl border-[0.5px] border-[#E1E1E1] p-4">
          <div className="w-fit rounded-md bg-[#FFF4E6] px-2">
            <span className="text-xs font-bold text-[#FCB351]">
              Zyskaj x3 punktów
            </span>
          </div>
          <p className="mt-2 h-full font-medium">
            Pierwsze 50 lokalnych zakupów
          </p>
          <div className="mt-4 inline-flex w-full items-center gap-4">
            <Progress value={88} className="h-2.5 w-full" />
            <span className="w-fit font-medium whitespace-nowrap text-[#475467]">
              44 z 50
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function HomescreenPage() {
  const user = await currentUser();
  const posts = await getPosts(1, 10);
  const isAdmin = !!(await amIAdmin());
  return (
    <div className="relative pt-24">
      <div className="absolute top-0 left-0 h-50 w-full bg-[linear-gradient(249.58deg,#61F681_0%,#49BF12_49.21%,#DBC443_97.83%)] pt-8">
        <div className="mb-2 px-6">
          <h1 className="break- truncate pt-6 text-2xl font-semibold text-[#E3F8D9]">
            Co dzisiaj nowego, {user?.fullName}?
          </h1>
        </div>
      </div>
      <StatsBar />
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
