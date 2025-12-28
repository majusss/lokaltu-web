import { getPlaces } from "@/app/actions/places";
import { PlacesClient } from "./_components/places-client";

export default async function PlacesPage() {
  const initialData = await getPlaces(1, 10);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Miejsca</h1>
        <p className="text-muted-foreground">Zarządzaj miejscami na mapie</p>
      </div>

      <PlacesClient initialData={initialData} />
    </div>
  );
}
