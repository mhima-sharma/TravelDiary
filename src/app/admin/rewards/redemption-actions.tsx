"use client";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { adminUpdateRedemptionStatus } from "@/actions/rewards";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Props = {
  redemptionId: string;
  currentStatus: string;
};

const TRANSITIONS: Record<string, { label: string; next: "APPROVED" | "SHIPPED" | "DELIVERED" | "REJECTED" }[]> = {
  PENDING:   [{ label: "Approve", next: "APPROVED" }, { label: "Reject", next: "REJECTED" }],
  APPROVED:  [{ label: "Mark Shipped", next: "SHIPPED" }, { label: "Reject", next: "REJECTED" }],
  SHIPPED:   [{ label: "Mark Delivered", next: "DELIVERED" }],
  DELIVERED: [],
  REJECTED:  [],
};

export function RedemptionActionsClient({ redemptionId, currentStatus }: Props) {
  const [tracking, setTracking] = useState("");
  const [notes, setNotes] = useState("");
  const [isPending, startTransition] = useTransition();

  const actions = TRANSITIONS[currentStatus] ?? [];
  if (!actions.length) return <p className="text-xs text-muted-foreground text-center py-1">No further actions available.</p>;

  function update(status: "APPROVED" | "SHIPPED" | "DELIVERED" | "REJECTED") {
    startTransition(async () => {
      const result = await adminUpdateRedemptionStatus(
        redemptionId, status,
        tracking || undefined,
        notes || undefined
      );
      if (result.error) toast.error(result.error);
      else toast.success(result.success);
    });
  }

  return (
    <div className="space-y-2 border-t pt-3">
      {currentStatus === "APPROVED" && (
        <Input
          placeholder="Tracking number (optional)"
          value={tracking}
          onChange={(e) => setTracking(e.target.value)}
          className="text-xs h-8"
        />
      )}
      <Input
        placeholder="Admin notes (optional)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className="text-xs h-8"
      />
      <div className="flex gap-2">
        {actions.map((a) => (
          <Button
            key={a.next}
            size="sm"
            variant={a.next === "REJECTED" ? "destructive" : "default"}
            onClick={() => update(a.next)}
            disabled={isPending}
            className="flex-1 text-xs"
          >
            {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : a.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
