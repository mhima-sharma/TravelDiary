"use client";
import { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toggleFavorite } from "@/actions/favorites";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface FavoriteButtonProps {
  placeId: string;
  initialSaved: boolean;
}

export function FavoriteButton({ placeId, initialSaved }: FavoriteButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [saved, setSaved] = useState(initialSaved);
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    if (!session) { router.push("/login"); return; }
    startTransition(async () => {
      const result = await toggleFavorite(placeId);
      if ("error" in result) { toast.error(result.error); return; }
      setSaved(result.saved);
      toast.success(result.saved ? "Saved to favorites!" : "Removed from favorites");
    });
  };

  return (
    <Button variant="outline" size="icon" onClick={handleClick} disabled={isPending} className={saved ? "text-red-500 border-red-200 hover:text-red-500" : ""}>
      <Heart className={`h-4 w-4 ${saved ? "fill-red-500" : ""}`} />
    </Button>
  );
}
