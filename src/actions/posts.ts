"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { PostStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") throw new Error("Unauthorized");
  return session;
}

function toSlug(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}

export async function createPost(data: {
  title: string;
  excerpt: string;
  content: string;
  featuredImage?: string;
  status: PostStatus;
}) {
  const session = await requireAdmin();

  const baseSlug = toSlug(data.title);
  const existing = await db.post.findUnique({ where: { slug: baseSlug } });
  const slug = existing ? `${baseSlug}-${Date.now()}` : baseSlug;

  const post = await db.post.create({
    data: {
      title: data.title,
      slug,
      excerpt: data.excerpt,
      content: data.content,
      featuredImage: data.featuredImage || null,
      status: data.status,
      publishedAt: data.status === PostStatus.PUBLISHED ? new Date() : null,
      authorId: session.user.id,
    },
  });

  revalidatePath("/blog");
  revalidatePath("/admin/posts");
  return { success: true, slug: post.slug };
}

export async function updatePost(
  id: string,
  data: {
    title: string;
    excerpt: string;
    content: string;
    featuredImage?: string;
    status: PostStatus;
  }
) {
  await requireAdmin();

  const existing = await db.post.findUnique({ where: { id } });
  if (!existing) return { error: "Post not found" };

  await db.post.update({
    where: { id },
    data: {
      title: data.title,
      excerpt: data.excerpt,
      content: data.content,
      featuredImage: data.featuredImage || null,
      status: data.status,
      publishedAt:
        data.status === PostStatus.PUBLISHED && !existing.publishedAt
          ? new Date()
          : existing.publishedAt,
    },
  });

  revalidatePath("/blog");
  revalidatePath(`/blog/${existing.slug}`);
  revalidatePath("/admin/posts");
  return { success: true };
}

export async function deletePost(id: string) {
  await requireAdmin();
  const post = await db.post.findUnique({ where: { id } });
  if (!post) return { error: "Not found" };
  await db.post.delete({ where: { id } });
  revalidatePath("/blog");
  revalidatePath("/admin/posts");
  return { success: true };
}

export async function togglePostStatus(id: string) {
  await requireAdmin();
  const post = await db.post.findUnique({ where: { id } });
  if (!post) return { error: "Not found" };

  const newStatus =
    post.status === PostStatus.PUBLISHED ? PostStatus.DRAFT : PostStatus.PUBLISHED;

  await db.post.update({
    where: { id },
    data: {
      status: newStatus,
      publishedAt:
        newStatus === PostStatus.PUBLISHED && !post.publishedAt ? new Date() : post.publishedAt,
    },
  });

  revalidatePath("/blog");
  revalidatePath("/admin/posts");
  return { success: newStatus };
}
