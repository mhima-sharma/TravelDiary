"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createAd, updateAd } from "@/actions/ads";

interface AdFormProps {
  ad?: {
    id: string;
    title: string;
    description: string | null;
    image: string | null;
    linkUrl: string | null;
    linkText: string | null;
    isActive: boolean;
  };
}

export function AdForm({ ad }: AdFormProps) {
  const isEdit = !!ad;
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const [title, setTitle] = useState(ad?.title ?? "");
  const [description, setDescription] = useState(ad?.description ?? "");
  const [image, setImage] = useState(ad?.image ?? "");
  const [linkUrl, setLinkUrl] = useState(ad?.linkUrl ?? "");
  const [linkText, setLinkText] = useState(ad?.linkText ?? "Learn More");
  const [isActive, setIsActive] = useState(ad?.isActive ?? true);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) { toast.error("Title is required"); return; }

    startTransition(async () => {
      const data = {
        title,
        description: description || undefined,
        image: image || undefined,
        linkUrl: linkUrl || undefined,
        linkText: linkText || undefined,
        isActive,
      };

      if (isEdit) {
        await updateAd(ad.id, data);
        toast.success("Ad updated");
      } else {
        await createAd(data);
        toast.success("Ad created");
      }
      router.push("/admin/ads");
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl">
      <div className="space-y-1.5">
        <Label>Title *</Label>
        <Input placeholder="Ad headline" value={title} onChange={(e) => setTitle(e.target.value)} required />
      </div>

      <div className="space-y-1.5">
        <Label>Description</Label>
        <Textarea
          placeholder="Short ad description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
        />
      </div>

      <div className="space-y-1.5">
        <Label>Image URL</Label>
        <Input
          placeholder="https://images.unsplash.com/..."
          value={image}
          onChange={(e) => setImage(e.target.value)}
        />
        {image && (
          <img
            src={image}
            alt="preview"
            className="mt-2 w-full max-h-44 object-cover rounded-lg border"
            onError={(e) => (e.currentTarget.style.display = "none")}
          />
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Link URL</Label>
          <Input
            placeholder="https://example.com"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Button Text</Label>
          <Input
            placeholder="Learn More"
            value={linkText}
            onChange={(e) => setLinkText(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Status</Label>
        <Select value={isActive ? "active" : "inactive"} onValueChange={(v) => setIsActive(v === "active")}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {isEdit ? "Update Ad" : "Create Ad"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/admin/ads")} disabled={isPending}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
