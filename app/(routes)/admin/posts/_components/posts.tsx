"use client";

import { deletePost } from "@/app/actions/admin";
import { getPosts, PostWithAuthor } from "@/app/actions/posts";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  forwardRef,
  useImperativeHandle,
  useState,
  useTransition,
} from "react";

export interface PostsRef {
  refresh: () => void;
}

interface PostsProps {
  initialPosts: PostWithAuthor[];
  initialTotalPages: number;
  initialTotalCount: number;
}

const PAGE_SIZES = [5, 10, 20, 50, 100];

export const Posts = forwardRef<PostsRef, PostsProps>(
  ({ initialPosts, initialTotalPages, initialTotalCount }, ref) => {
    const [posts, setPosts] = useState<PostWithAuthor[]>(initialPosts);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(initialTotalPages);
    const [totalCount, setTotalCount] = useState(initialTotalCount);
    const [pageSize, setPageSize] = useState(10);
    const [isPending, startTransition] = useTransition();

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [postToDelete, setPostToDelete] = useState<PostWithAuthor | null>(
      null,
    );
    const [deleteReason, setDeleteReason] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchPosts = (page: number, limit: number) => {
      startTransition(async () => {
        const data = await getPosts(page, limit);
        setPosts(data.posts);
        setTotalPages(data.totalPages);
        setTotalCount(data.totalCount);
        setCurrentPage(page);
      });
    };

    useImperativeHandle(ref, () => ({
      refresh: () => fetchPosts(currentPage, pageSize),
    }));

    const handlePageSizeChange = (value: string) => {
      const newSize = parseInt(value);
      setPageSize(newSize);
      fetchPosts(1, newSize);
    };

    const openDeleteDialog = (post: PostWithAuthor) => {
      setPostToDelete(post);
      setDeleteReason("");
      setDeleteDialogOpen(true);
    };

    const handleDelete = async () => {
      if (!postToDelete || !deleteReason.trim()) return;

      setIsDeleting(true);
      try {
        await deletePost(postToDelete.id, deleteReason);
        setDeleteDialogOpen(false);
        setPostToDelete(null);
        setDeleteReason("");
        fetchPosts(currentPage, pageSize);
      } finally {
        setIsDeleting(false);
      }
    };

    if (isPending && posts.length === 0) {
      return (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    return (
      <>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground text-sm">
              Łącznie {totalCount} postów
            </p>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-sm">Na stronie:</span>
              <Select
                value={pageSize.toString()}
                onValueChange={handlePageSizeChange}
              >
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAGE_SIZES.map((size) => (
                    <SelectItem key={size} value={size.toString()}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className={`grid gap-4 ${isPending ? "opacity-50" : ""}`}>
            {posts.map((post) => (
              <Card key={post.id}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <img
                      src={post.author.avatarUrl}
                      alt={post.author.name}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                    <div>
                      <CardTitle>{post.title}</CardTitle>
                      <CardDescription>
                        {post.author.name} •{" "}
                        {new Date(post.createdAt).toLocaleDateString("pl-PL")}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p>{post.content}</p>
                </CardContent>
                <CardFooter>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => openDeleteDialog(post)}
                  >
                    Usuń
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground text-sm">
                Strona {currentPage} z {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchPosts(currentPage - 1, pageSize)}
                  disabled={currentPage === 1 || isPending}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchPosts(currentPage + 1, pageSize)}
                  disabled={currentPage === totalPages || isPending}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Usuń post</DialogTitle>
              <DialogDescription>
                Post &quot;{postToDelete?.title}&quot; zostanie usunięty, a
                autor otrzyma powiadomienie z podanym powodem.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              <Label htmlFor="reason">Powód usunięcia</Label>
              <Input
                id="reason"
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                placeholder="Podaj powód usunięcia posta..."
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteDialogOpen(false)}
              >
                Anuluj
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={!deleteReason.trim() || isDeleting}
              >
                {isDeleting ? "Usuwanie..." : "Usuń"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  },
);

Posts.displayName = "Posts";
