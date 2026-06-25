import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { PostForm } from "../post-form";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Edit Post" };

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await db.post.findUnique({ where: { id } });
  if (!post) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Edit Post</h1>
      <PostForm post={post} />
    </div>
  );
}
