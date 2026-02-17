"use client";

import { useEffect, useRef, useState, useTransition } from "react";

import {
  addComment,
  CommentWithAuthor,
  deleteComment,
  getComments,
} from "@/app/actions/comments";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Loader2, Send, Trash2 } from "lucide-react";
import Image from "next/image";

function timeAgo(date: Date): string {
  const now = new Date();
  const seconds = Math.floor((now.getTime() - new Date(date).getTime()) / 1000);

  if (seconds < 60) return "teraz";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min temu`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} godz. temu`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} dn. temu`;
  return new Date(date).toLocaleDateString("pl-PL");
}

export function CommentsSheet({
  postId,
  commentCount: initialCount,
  currentUserId,
  isAdmin = false,
  open,
  onOpenChange,
}: {
  postId: number;
  commentCount: number;
  currentUserId: string;
  isAdmin?: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [comments, setComments] = useState<CommentWithAuthor[]>([]);
  const [commentCount, setCommentCount] = useState(initialCount);
  const [newComment, setNewComment] = useState("");
  const [isPending, startTransition] = useTransition();
  const [isLoadingComments, startLoadTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      startLoadTransition(async () => {
        const data = await getComments(postId);
        setComments(data.comments);
        setCommentCount(data.totalCount);
      });
    }
  }, [open, postId]);

  const handleSubmit = () => {
    const content = newComment.trim();
    if (!content || isPending) return;

    startTransition(async () => {
      const comment = await addComment(postId, content);
      setComments((prev) => [comment, ...prev]);
      setCommentCount((prev) => prev + 1);
      setNewComment("");
      inputRef.current?.focus();
    });
  };

  const handleDelete = (commentId: number) => {
    startTransition(async () => {
      await deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      setCommentCount((prev) => prev - 1);
    });
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="border-b pb-3">
          <DrawerTitle className="text-center">
            Komentarze{commentCount > 0 && ` (${commentCount})`}
          </DrawerTitle>
        </DrawerHeader>

        {/* Comments list */}
        <div
          ref={listRef}
          className="flex-1 overflow-y-auto px-4 py-3"
          style={{ maxHeight: "55vh" }}
        >
          {isLoadingComments ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-[#59CA34]" />
            </div>
          ) : comments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-lg font-medium text-gray-400">
                Brak komentarzy
              </p>
              <p className="mt-1 text-sm text-gray-300">
                Bądź pierwszy! Napisz komentarz poniżej.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <Image
                    src={comment.author.avatarUrl}
                    width={36}
                    height={36}
                    alt={comment.author.name}
                    className="h-9 w-9 shrink-0 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm font-semibold">
                          {comment.author.name}
                        </span>
                        <span className="text-xs text-gray-400">
                          {timeAgo(comment.createdAt)}
                        </span>
                      </div>
                      {(comment.author.id === currentUserId || isAdmin) && (
                        <button
                          onClick={() => handleDelete(comment.id)}
                          disabled={isPending}
                          className="rounded-full p-1 text-gray-300 transition-colors hover:bg-red-50 hover:text-red-400 disabled:opacity-40"
                          aria-label="Usuń komentarz"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                    <p className="mt-0.5 text-sm leading-snug text-gray-700">
                      {comment.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Comment input */}
        <div className="border-t px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              placeholder="Napisz komentarz..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              className="flex-1 rounded-full border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm transition-colors outline-none focus:border-[#59CA34] focus:bg-white"
              disabled={isPending}
            />
            <button
              onClick={handleSubmit}
              disabled={!newComment.trim() || isPending}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#59CA34] text-white transition-all disabled:opacity-40"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
