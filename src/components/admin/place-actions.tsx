"use client";
import { useTransition } from "react";
import { Check, X, Star, Gem, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { adminApprovePlace, adminRejectPlace, adminFeaturePlace, adminMarkHiddenGem } from "@/actions/admin";
import { toast } from "sonner";

export function AdminPlaceActions({ placeId, showExtras = false }: { placeId: string; showExtras?: boolean }) {
  const [isPending, startTransition] = useTransition();

  function run(action: () => Promise<{ success?: string; error?: string; reward?: string | null }>) {
    startTransition(async () => {
      const result = await action();
      if (result.error) toast.error(result.error);
      else {
        toast.success(result.success ?? "Done");
        if (result.reward) toast.success(result.reward, { description: "Reward sent to contributor" });
      }
    });
  }

  return (
    <div className="flex gap-2 flex-wrap">
      <Button size="sm" onClick={() => run(() => adminApprovePlace(placeId))} disabled={isPending} className="bg-green-600 hover:bg-green-700">
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Check className="h-4 w-4 mr-1" />Approve</>}
      </Button>
      <Button size="sm" variant="destructive" onClick={() => run(() => adminRejectPlace(placeId))} disabled={isPending}>
        <X className="h-4 w-4 mr-1" />Reject
      </Button>
      {showExtras && (
        <>
          <Button size="sm" variant="outline" onClick={() => run(() => adminFeaturePlace(placeId))} disabled={isPending} title="Mark as Featured (+50 XP/Coins)">
            <Star className="h-4 w-4 mr-1" />Feature
          </Button>
          <Button size="sm" variant="outline" onClick={() => run(() => adminMarkHiddenGem(placeId))} disabled={isPending} title="Mark as Hidden Gem (+100 XP/Coins)">
            <Gem className="h-4 w-4 mr-1" />Hidden Gem
          </Button>
        </>
      )}
    </div>
  );
}
