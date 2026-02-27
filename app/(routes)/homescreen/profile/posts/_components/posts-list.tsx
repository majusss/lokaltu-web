"use client";

import { deleteMyPost } from "@/app/actions/posts";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { FileText, MessageSquare, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

interface Post {
  id: number;
  title: string;
  content: string;
  createdAt: Date;
  _count: {
    comments: number;
  };
}

export function MyPostsList({ posts }: { posts: Post[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDelete = async (id: number) => {
    if (!confirm("Czy na pewno chcesz usunąć ten post?")) return;

    setDeletingId(id);
    startTransition(async () => {
      try {
        await deleteMyPost(id);
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

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gray-50 text-gray-200">
          <FileText className="h-12 w-12" />
        </div>
        <h2 className="text-xl font-bold text-gray-800">Brak postów</h2>
        <p className="mt-2 text-sm font-medium text-gray-500">
          Nie dodałeś jeszcze żadnych postów na tablicę.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <div
          key={post.id}
          className="group relative flex flex-col gap-3 overflow-hidden rounded-[2.5rem] border border-gray-100 bg-white p-6 shadow-sm transition-all hover:shadow-md"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="line-clamp-2 text-xl font-black tracking-tight text-gray-800">
                {post.title}
              </h3>
              <p className="mt-1 text-xs font-bold tracking-tight text-[#84cc16] uppercase">
                {format(new Date(post.createdAt), "d MMMM yyyy", {
                  locale: pl,
                })}
              </p>
            </div>
            <button
              onClick={() => handleDelete(post.id)}
              disabled={isPending && deletingId === post.id}
              className="ml-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-red-50 text-red-500 transition-all hover:bg-red-500 hover:text-white active:scale-95 disabled:opacity-50"
            >
              <Trash2
                className={cn(
                  "h-5 w-5",
                  isPending && deletingId === post.id && "animate-pulse",
                )}
              />
            </button>
          </div>

          <div className="rounded-3xl bg-gray-50/50 p-4">
            <p className="line-clamp-3 text-sm leading-relaxed font-medium text-gray-600">
              {post.content}
            </p>
          </div>

          <div className="flex items-center gap-2 px-1">
            <div className="flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-black tracking-tight text-blue-600 uppercase">
              <MessageSquare className="h-3.5 w-3.5" />
              {post._count.comments} Komentarzy
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
