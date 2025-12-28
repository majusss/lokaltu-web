import { getAchievements } from "@/app/actions/achievements";
import { AchievementsClient } from "./_components/achievements-client";

export default async function AchievementsPage() {
  const initialData = await getAchievements(1, 10);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Osiągnięcia</h1>
        <p className="text-muted-foreground">
          Zarządzaj osiągnięciami użytkowników
        </p>
      </div>

      <AchievementsClient initialData={initialData} />
    </div>
  );
}
