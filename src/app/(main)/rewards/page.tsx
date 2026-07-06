"use client";
import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getAvailableRewards } from "@/actions/rewards";
import { getMyStats } from "@/actions/gamification";
import { RedemptionForm } from "@/components/gamification/redemption-form";
import { LevelProgress } from "@/components/gamification/level-progress";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Coins, Leaf, ArrowRight, Lock, CheckCircle2 } from "lucide-react";
import { useSession } from "next-auth/react";

type Reward = {
  id: string; name: string; description: string; icon: string;
  coinCost: number; canAfford: boolean; userCoins: number;
};

export default function RewardsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
  }, [status, router]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [myStats, setMyStats] = useState<any>(null);
  const [selected, setSelected] = useState<Reward | null>(null);
  const [redeemed, setRedeemed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAvailableRewards(), session ? getMyStats() : null]).then(([r, s]) => {
      setRewards(r);
      setMyStats(s);
      setLoading(false);
    });
  }, [session]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="grid sm:grid-cols-2 gap-4 animate-pulse">
          {[1, 2].map((i) => <div key={i} className="h-48 rounded-xl bg-muted" />)}
        </div>
      </div>
    );
  }

  const userCoins = myStats?.stats?.coins ?? 0;
  const THRESHOLD = rewards[0]?.coinCost ?? 2000;
  const progressPct = Math.min(100, Math.floor((userCoins / THRESHOLD) * 100));

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center mb-10">
        <div className="text-5xl mb-3">🌱</div>
        <h1 className="text-4xl font-bold mb-2">Rewards</h1>
        <p className="text-muted-foreground text-lg">
          Earn coins by contributing to Tripzify and redeem them for real rewards.
        </p>
      </div>

      {/* Coin progress */}
      <Card className="mb-8 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/40 dark:to-yellow-950/40 border-amber-200 dark:border-amber-800">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center text-2xl">🪙</div>
              <div>
                <p className="text-2xl font-bold">{userCoins.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Your coins</p>
              </div>
            </div>
            {myStats?.stats && (
              <div className="text-right text-sm text-muted-foreground">
                <p>⚡ {myStats.stats.xp.toLocaleString()} XP</p>
                <p>Level {myStats.stats.level}</p>
              </div>
            )}
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{userCoins.toLocaleString()} / {THRESHOLD.toLocaleString()} coins for next reward</span>
              <span className="font-medium">{progressPct}%</span>
            </div>
            <div className="h-3 bg-amber-100 dark:bg-amber-900 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full transition-all duration-700"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            {userCoins < THRESHOLD && (
              <p className="text-xs text-muted-foreground">{(THRESHOLD - userCoins).toLocaleString()} more coins needed</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* How to earn */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-3">How to Earn Coins</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { action: "Place Approved", coins: "+100", emoji: "📍" },
            { action: "First Contribution", coins: "+50 bonus", emoji: "🌟" },
            { action: "Hidden Gem Selected", coins: "+100", emoji: "💎" },
            { action: "Review Written", coins: "+20", emoji: "✍️" },
            { action: "Place Featured", coins: "+50", emoji: "⭐" },
            { action: "Daily Login Streak", coins: "+5 to +100", emoji: "🔥" },
          ].map((item) => (
            <div key={item.action} className="flex items-center gap-2 p-3 rounded-lg border bg-card text-sm">
              <span className="text-xl">{item.emoji}</span>
              <div>
                <p className="font-medium text-xs leading-tight">{item.action}</p>
                <p className="text-amber-600 font-bold text-xs">{item.coins} 🪙</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reward cards */}
      <h2 className="text-lg font-semibold mb-4">Available Rewards</h2>
      <div className="grid sm:grid-cols-2 gap-6">
        {rewards.map((reward) => (
          <Card
            key={reward.id}
            className={`relative overflow-hidden transition-all ${
              reward.canAfford
                ? "border-green-300 dark:border-green-700 shadow-md hover:shadow-lg"
                : "opacity-90"
            }`}
          >
            {reward.canAfford && (
              <div className="absolute top-3 right-3">
                <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">Ready to Redeem!</span>
              </div>
            )}
            <CardContent className="p-6">
              <div className="text-5xl mb-4">{reward.icon}</div>
              <h3 className="text-xl font-bold mb-2">{reward.name}</h3>
              <p className="text-muted-foreground text-sm mb-4 leading-relaxed">{reward.description}</p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-amber-600">🪙 {reward.coinCost.toLocaleString()}</span>
                  <span className="text-sm text-muted-foreground">coins</span>
                </div>

                {!session ? (
                  <Button variant="outline" size="sm" asChild>
                    <a href="/login">Login to Redeem</a>
                  </Button>
                ) : reward.canAfford ? (
                  <Button
                    className="bg-green-600 hover:bg-green-700 gap-2"
                    onClick={() => { setSelected(reward); setRedeemed(false); }}
                  >
                    <Leaf className="h-4 w-4" /> Redeem
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" disabled>
                    <Lock className="h-3 w-3 mr-1" />
                    {(reward.coinCost - userCoins).toLocaleString()} more
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Redemption dialog */}
      <Dialog open={!!selected} onOpenChange={(o) => { if (!o) setSelected(null); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selected?.icon} Redeem {selected?.name}
            </DialogTitle>
          </DialogHeader>
          {selected && !redeemed && (
            <RedemptionForm
              reward={selected}
              userCoins={userCoins}
              userEmail={session?.user?.email ?? ""}
              onSuccess={() => { setRedeemed(true); setSelected(null); }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
