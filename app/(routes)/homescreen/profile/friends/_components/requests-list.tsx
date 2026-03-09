import { ReceivedRequestCard, SentRequestCard } from "./request-card";
import { InboxIcon } from "lucide-react";

type ReceivedRequest = {
  id: string;
  sender: {
    id: string;
    name: string;
    avatarUrl: string;
    lokaltuPoints: number;
  };
};

type SentRequest = {
  id: string;
  receiver: {
    id: string;
    name: string;
    avatarUrl: string;
  };
};

type Props = {
  receivedRequests: ReceivedRequest[];
  sentRequests: SentRequest[];
};

export default function RequestsList({
  receivedRequests,
  sentRequests,
}: Props) {
  const hasAny = receivedRequests.length > 0 || sentRequests.length > 0;

  if (!hasAny) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <InboxIcon size={48} className="mb-4 text-gray-200" />
        <p className="font-semibold text-gray-500">Brak zaproszeń</p>
        <p className="mt-1 text-sm text-gray-400">
          Tutaj pojawią się zaproszenia do znajomych.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {receivedRequests.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            Otrzymane ({receivedRequests.length})
          </p>
          {receivedRequests.map((req) => (
            <ReceivedRequestCard key={req.id} request={req} />
          ))}
        </div>
      )}

      {sentRequests.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            Wysłane ({sentRequests.length})
          </p>
          {sentRequests.map((req) => (
            <SentRequestCard key={req.id} request={req} />
          ))}
        </div>
      )}
    </div>
  );
}
