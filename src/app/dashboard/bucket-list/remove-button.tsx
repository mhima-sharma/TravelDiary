"use client";

import { useTransition } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { VisitStatus } from "@prisma/client";
import { toggleVisitStatus } from "@/actions/visits";
import { Button } from "@/components/ui/button";

export function RemoveFromBucketList({ placeId }: { visitId: string; placeId: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleRemove() {
    startTransition(async () => {
      await toggleVisitStatus(placeId, VisitStatus.WANT_TO_VISIT);
      toast.success("Removed from bucket list");
      router.refresh();
    });
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleRemove}
      disabled={isPending}
      className="shrink-0 text-muted-foreground hover:text-destructive"
      title="Remove from bucket list"
    >
      {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
    </Button>
  );
}
