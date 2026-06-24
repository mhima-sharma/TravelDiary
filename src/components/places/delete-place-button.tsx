"use client";
import { useTransition } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deletePlace } from "@/actions/places";
import { toast } from "sonner";

export function DeletePlaceButton({ placeId }: { placeId: string }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!confirm("Are you sure you want to delete this place?")) return;
    startTransition(async () => {
      const result = await deletePlace(placeId);
      if (result.error) toast.error(result.error);
      else toast.success(result.success);
    });
  };

  return (
    <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive" onClick={handleDelete} disabled={isPending}>
      {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
    </Button>
  );
}
