"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, HeartPulse } from "lucide-react";
import { Button } from "@/components/ui/button";
import { runHealthCheckNow } from "@/actions/ai-admin";

export function HealthCheckButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      await runHealthCheckNow();
      toast.success("Health check complete");
      router.refresh();
    });
  }

  return (
    <Button variant="outline" onClick={handleClick} disabled={isPending}>
      {isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <HeartPulse className="h-4 w-4 mr-2" />}
      Run Health Check Now
    </Button>
  );
}
