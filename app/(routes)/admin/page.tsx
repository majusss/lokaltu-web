import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import prisma from "@/lib/prisma";
import { Bell, FileText, MapPin, Trophy, Users } from "lucide-react";

export default async function AdminPage() {
  const [
    postsCount,
    usersCount,
    placesCount,
    achievementsCount,
    notificationsCount,
  ] = await Promise.all([
    prisma.post.count(),
    prisma.user.count(),
    prisma.place.count(),
    prisma.achievement.count(),
    prisma.notification.count(),
  ]);

  const stats = [
    {
      label: "Posty",
      value: postsCount,
      icon: FileText,
      description: "Opublikowanych postów",
    },
    {
      label: "Użytkownicy",
      value: usersCount,
      icon: Users,
      description: "Zarejestrowanych użytkowników",
    },
    {
      label: "Miejsca",
      value: placesCount,
      icon: MapPin,
      description: "Miejsc na mapie",
    },
    {
      label: "Osiągnięcia",
      value: achievementsCount,
      icon: Trophy,
      description: "Dostępnych osiągnięć",
    },
    {
      label: "Powiadomienia",
      value: notificationsCount,
      icon: Bell,
      description: "Wysłanych powiadomień",
    },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Przegląd statystyk Lokaltu</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.label}
              </CardTitle>
              <stat.icon className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-muted-foreground text-xs">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
