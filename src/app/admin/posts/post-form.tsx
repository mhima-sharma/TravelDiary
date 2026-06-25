"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { PostStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createPost, updatePost } from "@/actions/posts";

interface PostFormProps {
  post?: {
    id: string;
    title: string;
    excerpt: string;
    content: string;
    featuredImage: string | null;
    status: PostStatus;
  };
}

export function PostForm({ post }: PostFormProps) {
  const isEdit = !!post;
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const [title, setTitle] = useState(post?.title ?? "");
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [content, setContent] = useState(post?.content ?? "");
  const [featuredImage, setFeaturedImage] = useState(post?.featuredImage ?? "");
  const [status, setStatus] = useState<PostStatus>(post?.status ?? PostStatus.DRAFT);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !excerpt.trim() || !content.trim()) {
      toast.error("Title, excerpt and content are required");
      return;
    }

    startTransition(async () => {
      const data = { title, excerpt, content, featuredImage: featuredImage || undefined, status };

      if (isEdit) {
        const result = await updatePost(post.id, data);
        if (result.error) { toast.error(result.error); return; }
        toast.success("Post updated");
        router.push("/admin/posts");
      } else {
        const result = await createPost(data);
        if (!result.success) { toast.error("Failed to create post"); return; }
        toast.success("Post created");
        router.push("/admin/posts");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-3xl">
      <div className="space-y-1.5">
        <Label>Title *</Label>
        <Input
          placeholder="Post title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label>Featured Image URL</Label>
        <Input
          placeholder="https://images.unsplash.com/..."
          value={featuredImage}
          onChange={(e) => setFeaturedImage(e.target.value)}
        />
        {featuredImage && (
          <img
            src={featuredImage}
            alt="preview"
            className="mt-2 w-full max-h-52 object-cover rounded-lg border"
            onError={(e) => (e.currentTarget.style.display = "none")}
          />
        )}
      </div>

      <div className="space-y-1.5">
        <Label>Excerpt *</Label>
        <Textarea
          placeholder="Short description shown on blog list..."
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          rows={2}
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label>Content *</Label>
        <Textarea
          placeholder="Write your post content here. Use blank lines to separate paragraphs."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={16}
          required
          className="font-mono text-sm"
        />
        <p className="text-xs text-muted-foreground">Separate paragraphs with a blank line.</p>
      </div>

      <div className="space-y-1.5">
        <Label>Status</Label>
        <Select value={status} onValueChange={(v) => setStatus(v as PostStatus)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={PostStatus.DRAFT}>Draft</SelectItem>
            <SelectItem value={PostStatus.PUBLISHED}>Published</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {isEdit ? "Update Post" : "Create Post"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/admin/posts")} disabled={isPending}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
