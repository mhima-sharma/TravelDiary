"use client";

import { useState } from "react";
import { ImageIcon, Loader2, Pencil } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateCategoryImage } from "@/actions/admin";
import { useRouter } from "next/navigation";

export function EditCategoryImage({ id, currentImage }: { id: string; currentImage?: string | null }) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState(currentImage ?? "");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSave() {
    setLoading(true);
    const result = await updateCategoryImage(id, url);
    setLoading(false);
    if (result.success) {
      toast.success(result.success);
      setOpen(false);
      router.refresh();
    }
  }

  return (
    <>
      <Button variant="ghost" size="icon" onClick={() => setOpen(true)} title="Set image">
        <ImageIcon className="h-4 w-4" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Category Image</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label>Image URL</Label>
              <Input
                placeholder="https://images.unsplash.com/photo-..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Paste any Unsplash or Cloudinary image URL.</p>
            </div>
            {url && (
              <img
                src={url}
                alt="preview"
                className="w-full h-36 object-cover rounded-lg border"
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>Cancel</Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
