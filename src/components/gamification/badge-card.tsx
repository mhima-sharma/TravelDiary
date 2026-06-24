import { cn } from "@/lib/utils";
import { RARITY_COLORS, RARITY_TEXT } from "@/lib/badges";
import { Lock } from "lucide-react";

type BadgeCardProps = {
  name: string;
  description: string;
  icon: string;
  type: string;
  rarity: string;
  earned?: boolean;
  earnedAt?: Date | null;
  size?: "sm" | "md" | "lg";
};

export function BadgeCard({ name, description, icon, type, rarity, earned = true, earnedAt, size = "md" }: BadgeCardProps) {
  const rarityStyle = RARITY_COLORS[rarity] ?? RARITY_COLORS.COMMON;
  const rarityText = RARITY_TEXT[rarity] ?? RARITY_TEXT.COMMON;

  return (
    <div
      className={cn(
        "relative rounded-xl border-2 p-3 transition-all hover:scale-105",
        rarityStyle,
        !earned && "opacity-50 grayscale",
        size === "sm" && "p-2",
        size === "lg" && "p-5"
      )}
    >
      {!earned && (
        <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-background/50 backdrop-blur-[1px]">
          <Lock className="h-5 w-5 text-muted-foreground" />
        </div>
      )}

      <div className={cn("flex flex-col items-center text-center gap-1", size === "sm" && "gap-0.5")}>
        <span className={cn("text-3xl", size === "sm" && "text-2xl", size === "lg" && "text-5xl")}>{icon}</span>
        <p className={cn("font-semibold text-xs leading-tight mt-1", size === "lg" && "text-sm")}>{name}</p>
        {size !== "sm" && (
          <>
            <p className={cn("text-xs font-medium capitalize", rarityText)}>{rarity.toLowerCase()}</p>
            <p className="text-xs text-muted-foreground leading-tight line-clamp-2">{description}</p>
          </>
        )}
        {earnedAt && size !== "sm" && (
          <p className="text-xs text-muted-foreground mt-1">
            {new Date(earnedAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
          </p>
        )}
      </div>
    </div>
  );
}

export function BadgeGrid({ badges }: { badges: BadgeCardProps[] }) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
      {badges.map((b) => (
        <BadgeCard key={b.name} {...b} size="md" />
      ))}
    </div>
  );
}
