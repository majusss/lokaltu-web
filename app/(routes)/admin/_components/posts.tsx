"use client";

import { getAdminPosts } from "@/app/actions/admin";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { Post } from "@/generated/prisma/client";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
  useTransition,
} from "react";

export interface PostsRef {
  refresh: () => void;
}

interface PostsProps {
  initialPosts: Post[];
  initialTotalPages: number;
}

export const Posts = forwardRef<PostsRef, PostsProps>(
  ({ initialPosts, initialTotalPages }, ref) => {
    const [posts, setPosts] = useState<Post[]>(initialPosts);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(initialTotalPages);
    const [isPending, startTransition] = useTransition();
    const [isInitial, setIsInitial] = useState(true);

    const fetchPosts = (page: number) => {
      startTransition(async () => {
        const data = await getAdminPosts(page, 10);
        setPosts(data.posts);
        setTotalPages(data.totalPages);
      });
    };

    useImperativeHandle(ref, () => ({
      refresh: () => fetchPosts(currentPage),
    }));

    useEffect(() => {
      if (isInitial && currentPage === 1) {
        setIsInitial(false);
        return;
      }
      setIsInitial(false);
      fetchPosts(currentPage);
    }, [currentPage]);

    const handlePageChange = (page: number) => {
      setCurrentPage(page);
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
      <div className="space-y-6">
        <div className={`grid gap-4 ${isPending ? "opacity-50" : ""}`}>
          {posts.map((post) => (
            <Card key={post.id}>
              <CardHeader>
                <CardTitle>{post.title}</CardTitle>
                <CardDescription>
                  {new Date(post.createdAt).toLocaleDateString("pl-PL")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>{post.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => handlePageChange(currentPage - 1)}
                className={
                  currentPage === 1
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>

            {[...Array(totalPages)].map((_, i) => (
              <PaginationItem key={i + 1}>
                <PaginationLink
                  onClick={() => handlePageChange(i + 1)}
                  isActive={currentPage === i + 1}
                  className="cursor-pointer"
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                onClick={() => handlePageChange(currentPage + 1)}
                className={
                  currentPage === totalPages
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    );
  },
);

Posts.displayName = "Posts";
