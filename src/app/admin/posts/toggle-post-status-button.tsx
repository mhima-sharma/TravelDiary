"use client";

import { useTransition } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { PostStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { togglePostStatus } from "@/actions/posts";
import { useRouter } from "next/navigation";

export function TogglePostStatusButton({ id, currentStatus }: { id: string; currentStatus: PostStatus }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleToggle() {
    startTransition(async () => {
      const result = await togglePostStatus(id);
      if ("error" in result && result.error) { toast.error(result.error); return; }
      const next = result.success;
      toast.success(next === PostStatus.PUBLISHED ? "Post published" : "Post moved to draft");
      router.refresh();
    });
  }

  return (
    <Button variant="outline" size="icon" onClick={handleToggle} disabled={isPending}
      title={currentStatus === PostStatus.PUBLISHED ? "Unpublish" : "Publish"}
      className={currentStatus === PostStatus.PUBLISHED ? "text-green-600" : "text-muted-foreground"}>
      {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> :
        currentStatus === PostStatus.PUBLISHED ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
    </Button>
  );
}
