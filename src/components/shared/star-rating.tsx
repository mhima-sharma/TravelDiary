"use client";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onRate?: (rating: number) => void;
}

export function StarRating({ rating, max = 5, size = "md", interactive = false, onRate }: StarRatingProps) {
  const sizes = { sm: "h-3 w-3", md: "h-4 w-4", lg: "h-5 w-5" };
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }, (_, i) => (
        <Star
          key={i}
          className={cn(
            sizes[size],
            i < rating ? "fill-yellow-400 text-yellow-400" : "fill-none text-muted-foreground",
            interactive && "cursor-pointer hover:fill-yellow-300 hover:text-yellow-300 transition-colors"
          )}
          onClick={() => interactive && onRate?.(i + 1)}
        />
      ))}
    </div>
  );
}
