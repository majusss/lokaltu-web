import { getAllNotifications } from "@/app/actions/notifications";
import { NotificationsClient } from "./_components/notifications-client";

export default async function NotificationsPage() {
  const initialData = await getAllNotifications(1, 10);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Powiadomienia</h1>
        <p className="text-muted-foreground">Historia wysłanych powiadomień</p>
      </div>

      <NotificationsClient initialData={initialData} />
    </div>
  );
}
