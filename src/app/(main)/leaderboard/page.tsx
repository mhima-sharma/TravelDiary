import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getLeaderboard } from "@/lib/gamification";
import { getLevelData } from "@/lib/levels";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Zap, Coins, Medal } from "lucide-react";

export const metadata: Metadata = {
  title: "Leaderboard",
  description: "Top contributors on TravelDiary – see who has discovered and shared the most amazing places.",
  openGraph: {
    title: "Leaderboard | TravelDiary",
    description: "Top contributors on TravelDiary – see who has discovered and shared the most amazing places.",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Leaderboard | TravelDiary",
    description: "Top contributors on TravelDiary – see who has discovered and shared the most amazing places.",
  },
};
export const revalidate = 300;

async function LeaderboardTable({ period }: { period: "week" | "month" | "all" }) {
  const entries = await getLeaderboard(period);

  if (!entries.length) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <Trophy className="h-12 w-12 mx-auto mb-3 opacity-30" />
        <p>No data yet for this period.</p>
      </div>
    );
  }

  const rankIcon = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return `#${rank}`;
  };

  return (
    <div className="space-y-2">
      {entries.map((entry) => {
        const levelData = getLevelData(entry.level ?? (entry as any).stats?.level ?? 1);
        const user = (entry as any).user ?? entry;
        const xp = (entry as any).totalXp ?? (entry as any).stats?.totalXp ?? 0;
        const coins = (entry as any).coins ?? (entry as any).stats?.coins ?? 0;
        const badgeCount = (entry as any).badgeCount ?? 0;
        const level = (entry as any).level ?? (entry as any).stats?.level ?? 1;
        const userId = (entry as any).userId ?? user?.id;
        const userName = user?.name ?? "Anonymous";
        const userImage = user?.image;
        const username = user?.username;

        return (
          <div
            key={userId}
            className={`flex items-center gap-4 p-3 rounded-xl border transition-colors hover:bg-accent/50 ${
              entry.rank <= 3 ? "bg-gradient-to-r from-yellow-50/50 to-transparent dark:from-yellow-950/20" : "bg-card"
            }`}
          >
            <div className="w-10 text-center font-bold text-lg shrink-0">{rankIcon(entry.rank)}</div>

            <div className="relative h-10 w-10 rounded-full overflow-hidden shrink-0">
              {userImage ? (
                <Image src={userImage} alt={userName} fill className="object-cover" />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center font-bold text-sm text-muted-foreground">
                  {userName[0]?.toUpperCase()}
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <Link
                href={username ? `/profile/${username}` : `/profile/${userId}`}
                className="font-semibold text-sm hover:underline truncate block"
              >
                {userName}
              </Link>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Badge
                  className="text-xs px-1.5 py-0"
                  style={{ backgroundColor: levelData.color, color: "white" }}
                >
                  {levelData.emoji} Lv.{level}
                </Badge>
                {badgeCount > 0 && (
                  <span className="text-xs text-muted-foreground">🏅 {badgeCount}</span>
                )}
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-4 text-sm shrink-0">
              <div className="text-right">
                <p className="font-bold flex items-center gap-1">
                  <Zap className="h-3.5 w-3.5 text-yellow-500" />{xp.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">XP</p>
              </div>
              <div className="text-right">
                <p className="font-bold flex items-center gap-1">
                  <span className="text-amber-500">🪙</span>{coins.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">Coins</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default async function LeaderboardPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="text-center mb-10">
        <div className="text-5xl mb-3">🏆</div>
        <h1 className="text-4xl font-bold mb-2">Leaderboard</h1>
        <p className="text-muted-foreground">Top travel contributors ranked by XP and coins earned.</p>
      </div>

      <Tabs defaultValue="all">
        <TabsList className="w-full mb-6">
          <TabsTrigger value="week" className="flex-1">This Week</TabsTrigger>
          <TabsTrigger value="month" className="flex-1">This Month</TabsTrigger>
          <TabsTrigger value="all" className="flex-1">All Time</TabsTrigger>
        </TabsList>

        <TabsContent value="week">
          <LeaderboardTable period="week" />
        </TabsContent>
        <TabsContent value="month">
          <LeaderboardTable period="month" />
        </TabsContent>
        <TabsContent value="all">
          <LeaderboardTable period="all" />
        </TabsContent>
      </Tabs>

      <div className="mt-10 grid grid-cols-3 gap-3 text-center text-sm text-muted-foreground">
        {[
          { emoji: "⚡", label: "XP from approved places, reviews & more" },
          { emoji: "🪙", label: "Coins redeemable for real rewards" },
          { emoji: "🏅", label: "Badges for special achievements" },
        ].map((item) => (
          <div key={item.label} className="p-3 border rounded-lg">
            <p className="text-2xl mb-1">{item.emoji}</p>
            <p className="text-xs">{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
