import { getUserDb } from "@/app/actions/user";
import { getLevel } from "@/lib/utils/leveling";
import { currentUser } from "@clerk/nextjs/server";
import {
  Award,
  ChevronRight,
  FilePlus2,
  Flag,
  List,
  Settings,
  UserCircle2,
} from "lucide-react";
import Image from "next/image";

export default async function ProfilePage() {
  const user = await currentUser();
  const userDb = await getUserDb();

  const points = userDb?.lokaltuPoints ?? 0;
  const level = getLevel(points);

  const menuItems = [
    {
      label: "Zdobyte odznaki",
      icon: <Award className="h-6 w-6 text-gray-800" />,
      href: "#",
    },
    {
      label: "Moje zgłoszenia",
      icon: <Flag className="h-6 w-6 text-gray-800" />,
      href: "#",
    },
    {
      label: "Moje posty",
      icon: <FilePlus2 className="h-6 w-6 text-gray-800" />,
      href: "#",
    },
    {
      label: "Wyzwania",
      icon: <List className="h-6 w-6 text-gray-800" />,
      href: "#",
    },
    {
      label: "Ustawienia aplikacji",
      icon: <Settings className="h-6 w-6 text-gray-800" />,
      href: "#",
    },
  ];

  return (
    <div className="relative min-h-screen bg-white">
      <div className="absolute top-0 left-0 h-48 w-full bg-[linear-gradient(249.58deg,#61F681_0%,#49BF12_49.21%,#DBC443_97.83%)] pt-8">
        <div className="mb-2 px-6">
          <h1 className="truncate pt-10 text-3xl font-bold tracking-tight text-white">
            Cześć, {user?.firstName || userDb?.name || "Użytkowniku"}
          </h1>
        </div>
      </div>

      <div className="relative flex flex-col pt-36">
        <div className="min-h-[calc(100vh-144px)] w-full flex-1 rounded-t-[40px] bg-white px-6 pt-12 pb-32 shadow-[0_-8px_30px_rgb(0,0,0,0.04)] transition-all">
          <div className="mb-12 flex items-center gap-6">
            <div className="relative h-28 w-28 overflow-hidden rounded-full border-4 border-white bg-gray-100 shadow-md">
              {user?.imageUrl ? (
                <Image
                  src={user.imageUrl}
                  alt="Profile"
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-[#E5E7EB]">
                  <UserCircle2 className="h-16 w-16 text-gray-400" />
                </div>
              )}
            </div>
            <div className="flex flex-col justify-center">
              <span className="text-lg leading-tight font-medium text-gray-400">
                Poziom {level.level}:
              </span>
              <span className="text-2xl font-bold tracking-tight text-gray-800">
                {level.name}
              </span>
            </div>
          </div>

          <div className="flex flex-col divide-y divide-gray-50">
            {menuItems.map((item, index) => (
              <div
                key={index}
                className="group flex cursor-pointer items-center justify-between py-6 transition-all active:opacity-60"
              >
                <div className="flex items-center gap-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl transition-colors group-active:bg-gray-50">
                    {item.icon}
                  </div>
                  <span className="text-lg font-semibold tracking-tight text-gray-700">
                    {item.label}
                  </span>
                </div>
                <ChevronRight className="h-7 w-7 stroke-[2.5px] text-[#84cc16]" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
