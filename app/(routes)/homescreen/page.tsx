import { Progress } from "@/components/ui/progress";
import { MessageCircle } from "lucide-react";
import Image from "next/image";

import { getPosts, PostWithAuthor } from "@/app/actions/posts";
import dummyshop from "@/app/assets/dummy_shop.png";
import ecology from "@/app/assets/ecology.svg";
import poins from "@/app/assets/points.svg";
import { currentUser } from "@clerk/nextjs/server";

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

function UserPosts({ posts }: { posts: PostWithAuthor[] }) {
  return (
    <div>
      <h2 className="ml-1.5 text-2xl font-semibold">Co w trawie piszczy?</h2>
      <div className="mt-3 space-y-4">
        {/* fck cards */}
        {posts.map((post) => (
          <div
            className="rounded-2xl border-[0.5px] border-[#E1E1E1] p-4"
            key={post.id}
          >
            <div className="inline-flex w-fit items-center gap-2">
              <Image
                src={post.author.avatarUrl}
                width={28}
                height={28}
                alt="Katarzyna Nowak's profile pic"
                className="rounded-full"
              />
              <p className="text-lg font-medium">{post.author.name}</p>
            </div>
            <p className="mt-2 text-sm leading-[1.3] font-medium">
              {post.content}
            </p>
            <div className="mt-2 flex w-full justify-end">
              <MessageCircle className="fill-[#59CA34] text-[#59CA34]" />
            </div>
          </div>
        ))}
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

function LocalShops() {
  return (
    <div>
      <h2 className="ml-1.5 text-2xl font-semibold">
        Kupuj lokalnie w Jarosławiu
      </h2>
      <div className="mt-3 space-y-4">
        {[
          {
            name: "Plantacja na Adasach w Zapałowie",
            imageUrl: dummyshop.src,
          },
          {
            name: "Sklep owocowo-warzywny “Owocjusz”",
            imageUrl: dummyshop.src,
          },
          {
            name: "Piekarnia “U Wilusza”",
            imageUrl: dummyshop.src,
          },
          {
            name: "Piekarnia “Sztuka Chleba”",
            imageUrl: dummyshop.src,
          },
        ].map((shop) => (
          <div
            className="relative flex h-47 w-full flex-col justify-between"
            key={shop.name}
          >
            <Image
              src={shop.imageUrl}
              alt={shop.name}
              width={353}
              height={188}
              className="absolute -z-10 h-full w-full rounded-3xl object-cover"
            />
            <div className="m-4 inline-flex items-center">
              <Image
                src={poins}
                alt=""
                width={40}
                height={40}
                className="z-10"
              />
              <div className="flex h-fit -translate-x-3 items-center rounded-r-full bg-[#FFFCF8] px-4 py-0.5 text-center">
                <span className="font-medium text-[#59CA34]">Zobacz</span>
              </div>
            </div>
            <p className="m-4 text-3xl font-black text-[#FFF4E6]">
              {shop.name}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function HomescreenPage() {
  const user = await currentUser();
  const posts = await getPosts(1, 10);
  return (
    <div className="relative pt-18">
      <div className="absolute top-0 left-0 h-50 w-full bg-[linear-gradient(249.58deg,#61F681_0%,#49BF12_49.21%,#DBC443_97.83%)] pt-8">
        <div className="mb-2 px-6">
          <h1 className="text-2xl font-semibold text-[#E3F8D9]">
            Co dzisiaj nowego, {user?.fullName}?
          </h1>
        </div>
      </div>
      <StatsBar />
      <div className="h-full w-full -translate-y-4 space-y-4 rounded-t-2xl bg-white px-6 pt-4 pb-18">
        <UserPosts posts={posts.posts} />
        <UserChallanges />
        <LocalShops />
      </div>
    </div>
  );
}
