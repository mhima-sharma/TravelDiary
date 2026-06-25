"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckCheck, Bookmark, Eye } from "lucide-react";
import { VisitStatus } from "@prisma/client";
import { toggleVisitStatus } from "@/actions/visits";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const OPTIONS: { status: VisitStatus; label: string; icon: React.ReactNode; color: string }[] = [
  { status: VisitStatus.WANT_TO_VISIT, label: "Want to Visit", icon: <Bookmark className="h-4 w-4" />, color: "text-blue-500" },
  { status: VisitStatus.VISITED, label: "Visited", icon: <Eye className="h-4 w-4" />, color: "text-green-500" },
  { status: VisitStatus.VISITED_AGAIN, label: "Visited Again", icon: <CheckCheck className="h-4 w-4" />, color: "text-purple-500" },
];

interface VisitButtonProps {
  placeId: string;
  initialStatus: VisitStatus | null;
}

export function VisitButton({ placeId, initialStatus }: VisitButtonProps) {
  const [status, setStatus] = useState<VisitStatus | null>(initialStatus);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const active = OPTIONS.find((o) => o.status === status);

  function handleSelect(newStatus: VisitStatus) {
    startTransition(async () => {
      const result = await toggleVisitStatus(placeId, newStatus);
      if ("error" in result && result.error) {
        toast.error(result.error);
        router.push("/auth/login");
        return;
      }
      const next = result.success as VisitStatus | null;
      setStatus(next);
      if (next) {
        const opt = OPTIONS.find((o) => o.status === next);
        toast.success(`Marked as "${opt?.label}"`);
      } else {
        toast.success("Visit status removed");
      }
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={isPending}
          className={`gap-2 ${active ? active.color : "text-muted-foreground"}`}
        >
          {active ? active.icon : <Bookmark className="h-4 w-4" />}
          <span className="hidden sm:inline">{active ? active.label : "Mark Visit"}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {OPTIONS.map((opt) => (
          <DropdownMenuItem
            key={opt.status}
            onClick={() => handleSelect(opt.status)}
            className={`gap-2 cursor-pointer ${status === opt.status ? opt.color + " font-semibold" : ""}`}
          >
            {opt.icon}
            {opt.label}
            {status === opt.status && <span className="ml-auto text-xs opacity-60">(tap to remove)</span>}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
