import Link from "next/link";
import { db } from "@/lib/db";
import { PostStatus } from "@prisma/client";
import { Plus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DeletePostButton } from "./delete-post-button";
import { TogglePostStatusButton } from "./toggle-post-status-button";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Posts" };

export default async function AdminPostsPage() {
  const posts = await db.post.findMany({
    orderBy: { createdAt: "desc" },
    include: { author: { select: { name: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Posts</h1>
        <Button asChild>
          <Link href="/admin/posts/new">
            <Plus className="h-4 w-4 mr-2" />New Post
          </Link>
        </Button>
      </div>

      {posts.length === 0 ? (
        <div className="border rounded-xl py-16 text-center text-muted-foreground">
          <p>No posts yet. Create your first post!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <div key={post.id} className="flex items-center justify-between gap-4 p-4 border rounded-xl bg-card">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium truncate">{post.title}</p>
                  <Badge variant={post.status === PostStatus.PUBLISHED ? "default" : "secondary"}>
                    {post.status === PostStatus.PUBLISHED ? "Published" : "Draft"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{post.excerpt}</p>
                <p className="text-xs text-muted-foreground">
                  By {post.author.name} · {new Date(post.createdAt).toLocaleDateString("en-IN")}
                  {post.publishedAt && ` · Published ${new Date(post.publishedAt).toLocaleDateString("en-IN")}`}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <TogglePostStatusButton id={post.id} currentStatus={post.status} />
                <Button variant="outline" size="icon" asChild title="Edit">
                  <Link href={`/admin/posts/${post.id}`}>
                    <Pencil className="h-4 w-4" />
                  </Link>
                </Button>
                <DeletePostButton id={post.id} title={post.title} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
