import { Coins, Zap, MapPin, Star, Camera, Flame, Trophy, Gem } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

type Stat = { label: string; value: number | string; icon: React.ReactNode; color: string };

type Props = {
  xp: number;
  coins: number;
  level: number;
  approvedPlaces: number;
  totalReviews: number;
  totalPhotos: number;
  totalLikes: number;
  hiddenGems: number;
  streak: number;
  leaderboardRank?: number | null;
};

export function StatsOverview(props: Props) {
  const stats: Stat[] = [
    { label: "Total XP",        value: props.xp.toLocaleString(),            icon: <Zap className="h-5 w-5" />,      color: "text-yellow-500" },
    { label: "Coins",           value: props.coins.toLocaleString(),          icon: <Coins className="h-5 w-5" />,    color: "text-amber-500" },
    { label: "Approved Places", value: props.approvedPlaces,                  icon: <MapPin className="h-5 w-5" />,   color: "text-blue-500" },
    { label: "Reviews",         value: props.totalReviews,                    icon: <Star className="h-5 w-5" />,     color: "text-purple-500" },
    { label: "Photos",          value: props.totalPhotos,                     icon: <Camera className="h-5 w-5" />,   color: "text-pink-500" },
    { label: "Likes Received",  value: props.totalLikes,                      icon: <Trophy className="h-5 w-5" />,   color: "text-orange-500" },
    { label: "Hidden Gems",     value: props.hiddenGems,                      icon: <Gem className="h-5 w-5" />,      color: "text-cyan-500" },
    { label: "Day Streak",      value: props.streak,                          icon: <Flame className="h-5 w-5" />,    color: "text-red-500" },
  ];

  if (props.leaderboardRank != null) {
    stats.push({ label: "Rank", value: `#${props.leaderboardRank}`, icon: <Trophy className="h-5 w-5" />, color: "text-yellow-600" });
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      {stats.map((s) => (
        <Card key={s.label} className="bg-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className={`${s.color} shrink-0`}>{s.icon}</div>
            <div className="min-w-0">
              <p className="font-bold text-lg leading-tight truncate">{s.value}</p>
              <p className="text-xs text-muted-foreground truncate">{s.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
