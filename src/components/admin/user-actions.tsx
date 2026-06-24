"use client";
import { useTransition } from "react";
import { Ban, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { banUser, unbanUser } from "@/actions/admin";
import { toast } from "sonner";

export function AdminUserActions({ userId, isBanned }: { userId: string; isBanned: boolean }) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      try {
        const result = isBanned ? await unbanUser(userId) : await banUser(userId);
        toast.success(result.success);
      } catch {
        toast.error("Action failed");
      }
    });
  };

  return (
    <Button size="sm" variant={isBanned ? "outline" : "destructive"} onClick={handleToggle} disabled={isPending}>
      {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : isBanned ? <><CheckCircle className="h-4 w-4 mr-1" />Unban</> : <><Ban className="h-4 w-4 mr-1" />Ban</>}
    </Button>
  );
}
