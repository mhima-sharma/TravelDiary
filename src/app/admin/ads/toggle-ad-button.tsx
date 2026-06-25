"use client";

import { useTransition } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { toggleAdStatus } from "@/actions/ads";
import { useRouter } from "next/navigation";

export function ToggleAdButton({ id, isActive }: { id: string; isActive: boolean }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleToggle() {
    startTransition(async () => {
      await toggleAdStatus(id);
      toast.success(isActive ? "Ad deactivated" : "Ad activated");
      router.refresh();
    });
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={handleToggle}
      disabled={isPending}
      title={isActive ? "Deactivate" : "Activate"}
      className={isActive ? "text-green-600" : "text-muted-foreground"}
    >
      {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> :
        isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
    </Button>
  );
}
