import { getUsers } from "@/app/actions/users";
import { auth } from "@clerk/nextjs/server";
import { UsersClient } from "./_components/users-client";

export default async function UsersPage() {
  const { userId } = await auth();

  const initialData = await getUsers(1, 10);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Użytkownicy</h1>
        <p className="text-muted-foreground">
          Zarządzaj użytkownikami aplikacji
        </p>
      </div>

      <UsersClient initialData={initialData} currentUserId={userId!} />
    </div>
  );
}
