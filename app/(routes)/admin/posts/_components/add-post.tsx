"use client";

import { createAdminPost } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState, useTransition } from "react";

export function AddPost({ onPostCreated }: { onPostCreated?: () => void }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    startTransition(async () => {
      try {
        await createAdminPost(title, content);
        setTitle("");
        setContent("");
        setSuccess(true);
        onPostCreated?.();
        setTimeout(() => setSuccess(false), 3000);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Wystąpił błąd");
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dodaj nowy post</CardTitle>
        <CardDescription>
          Utwórz nowy post, który zostanie opublikowany dla użytkowników
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Tytuł</Label>
            <Input
              id="title"
              placeholder="Wpisz tytuł posta..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isPending}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Treść</Label>
            <Textarea
              id="content"
              placeholder="Wpisz treść posta..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={isPending}
              rows={5}
              required
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          {success && (
            <p className="text-sm text-green-500">Post został dodany!</p>
          )}

          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? "Dodawanie..." : "Dodaj post"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
