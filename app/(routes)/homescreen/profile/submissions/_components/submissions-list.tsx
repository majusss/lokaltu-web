"use client";

import { deleteMySubmission } from "@/app/actions/places";
import { cn } from "@/lib/utils";
import { CheckCircle2, Clock, MapPin, Trash2, XCircle } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

interface Submission {
  id: string;
  name: string;
  address: string;
  category: string;
  description: string | null;
  image: string | null;
  verified: boolean;
  rejected: boolean;
  createdAt: Date;
}

export function SubmissionsList({
  submissions,
}: {
  submissions: Submission[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("Czy na pewno chcesz usunąć to zgłoszenie?")) return;

    setDeletingId(id);
    startTransition(async () => {
      try {
        await deleteMySubmission(id);
        router.refresh();
      } catch (error) {
        alert(
          error instanceof Error
            ? error.message
            : "Wystąpił błąd podczas usuwania.",
        );
      } finally {
        setDeletingId(null);
      }
    });
  };

  if (submissions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gray-50 text-gray-200">
          <MapPin className="h-12 w-12" />
        </div>
        <h2 className="text-xl font-bold text-gray-800">Brak zgłoszeń</h2>
        <p className="mt-2 text-sm font-medium text-gray-500">
          Nie dodałeś jeszcze żadnych miejsc na mapę.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {submissions.map((item) => {
        const canDelete = !item.verified || item.rejected;
        const status = item.verified
          ? {
              label: "Zaakceptowano",
              color: "text-green-600 bg-green-50 border-green-100",
              icon: <CheckCircle2 className="h-3 w-3" />,
            }
          : item.rejected
            ? {
                label: "Odrzucono",
                color: "text-red-600 bg-red-50 border-red-100",
                icon: <XCircle className="h-3 w-3" />,
              }
            : {
                label: "Oczekiwanie",
                color: "text-amber-600 bg-amber-50 border-amber-100",
                icon: <Clock className="h-3 w-3" />,
              };

        return (
          <div
            key={item.id}
            className="group relative flex flex-col gap-4 overflow-hidden rounded-3xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:shadow-md"
          >
            <div className="flex gap-4">
              {/* Image Preview */}
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-gray-100 shadow-inner">
                {item.image ? (
                  <Image
                    src={`${process.env.NEXT_PUBLIC_CDN_URL}/${item.image}`}
                    alt={item.name}
                    fill
                    className="object-cover transition-transform group-hover:scale-110"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <MapPin className="h-10 w-10 text-gray-300" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex flex-1 flex-col justify-center">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="line-clamp-1 text-lg font-black tracking-tight text-gray-800">
                      {item.name}
                    </h3>
                    <div className="mt-0.5 flex items-center gap-1 text-gray-400">
                      <MapPin className="h-3 w-3" />
                      <p className="line-clamp-1 text-xs leading-none font-bold">
                        {item.address}
                      </p>
                    </div>
                  </div>

                  {canDelete && (
                    <button
                      onClick={() => handleDelete(item.id)}
                      disabled={isPending && deletingId === item.id}
                      className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-500 transition-all hover:bg-red-500 hover:text-white active:scale-90 disabled:opacity-50"
                    >
                      <Trash2
                        className={cn(
                          "h-4.5 w-4.5",
                          isPending &&
                            deletingId === item.id &&
                            "animate-pulse",
                        )}
                      />
                    </button>
                  )}
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <div className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-black tracking-tight text-blue-600 uppercase">
                    {item.category}
                  </div>
                  <div
                    className={cn(
                      "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-black tracking-tight uppercase",
                      status.color,
                    )}
                  >
                    {status.icon}
                    {status.label}
                  </div>
                </div>
              </div>
            </div>

            {item.description && (
              <div className="rounded-2xl bg-gray-50/50 p-3 italic">
                <p className="text-xs leading-relaxed font-medium text-gray-500">
                  &quot;{item.description}&quot;
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
