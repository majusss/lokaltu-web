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
import { Loader2, MessageCircle, Send, Trash2 } from "lucide-react";
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
        <DrawerHeader className="border-b border-gray-100 pb-5">
          <DrawerTitle className="text-center text-lg font-black text-gray-900">
            Komentarze{commentCount > 0 && ` (${commentCount})`}
          </DrawerTitle>
        </DrawerHeader>

        {/* Comments list */}
        <div
          ref={listRef}
          className="flex-1 overflow-y-auto px-6 py-4"
          style={{ maxHeight: "55vh" }}
        >
          {isLoadingComments ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-[#49BF12]" />
            </div>
          ) : comments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-50 mb-4">
                <MessageCircle className="h-8 w-8 text-gray-200" />
              </div>
              <p className="text-base font-bold text-gray-900">
                Brak komentarzy
              </p>
              <p className="mt-1 text-sm font-medium text-gray-400">
                Bądź pierwszy! Napisz co o tym sądzisz.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full ring-2 ring-gray-50">
                    <Image
                      src={comment.author.avatarUrl}
                      fill
                      alt={comment.author.name}
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-900">
                          {comment.author.name}
                        </span>
                        <span className="text-[10px] font-bold text-gray-300 uppercase letter-spacing-tight">
                          • {timeAgo(comment.createdAt)}
                        </span>
                      </div>
                      {(comment.author.id === currentUserId || isAdmin) && (
                        <button
                          onClick={() => handleDelete(comment.id)}
                          disabled={isPending}
                          className="rounded-full p-1 text-gray-300 transition-colors hover:bg-red-50 hover:text-red-500 disabled:opacity-40"
                          aria-label="Usuń komentarz"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                    <p className="mt-1 text-sm leading-relaxed font-medium text-gray-700">
                      {comment.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Comment input */}
        <div className="border-t border-gray-100 bg-gray-50/30 px-6 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          <div className="flex items-center gap-3">
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
              className="flex-1 rounded-2xl border border-gray-200 bg-white px-5 py-3 text-sm font-medium transition-all outline-none focus:border-[#49BF12] focus:ring-4 focus:ring-[#49BF12]/5"
              disabled={isPending}
            />
            <button
              onClick={handleSubmit}
              disabled={!newComment.trim() || isPending}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#49BF12] text-white shadow-lg shadow-[#49BF12]/20 transition-all active:scale-95 disabled:opacity-40"
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
