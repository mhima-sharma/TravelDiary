import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { getMyRedemptions } from "@/actions/rewards";
import { getMyStats } from "@/actions/gamification";
import { getAllBadgeDefinitions } from "@/actions/gamification";
import { LevelProgress } from "@/components/gamification/level-progress";
import { BadgeCard } from "@/components/gamification/badge-card";
import { StatsOverview } from "@/components/gamification/stats-overview";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Coins, Zap, ArrowRight, Package, Truck, CheckCircle2, XCircle, Clock } from "lucide-react";

const STATUS_CONFIG = {
  PENDING:   { label: "Pending Review", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200", icon: Clock },
  APPROVED:  { label: "Approved",       color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",         icon: CheckCircle2 },
  SHIPPED:   { label: "Shipped",        color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200", icon: Truck },
  DELIVERED: { label: "Delivered",      color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",     icon: CheckCircle2 },
  REJECTED:  { label: "Rejected",       color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",             icon: XCircle },
} as const;

export default async function DashboardRewardsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const [myStats, redemptions, allBadges] = await Promise.all([
    getMyStats(),
    getMyRedemptions(),
    getAllBadgeDefinitions(),
  ]);

  const stats = myStats?.stats;
  const coinTxns = myStats?.coinTxns ?? [];
  const xpTxns = myStats?.xpTxns ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Rewards & Progress</h1>
          <p className="text-muted-foreground text-sm">Track your XP, coins, badges, and redemptions.</p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/rewards">
            <Coins className="h-4 w-4 mr-2" /> Redeem Coins
          </Link>
        </Button>
      </div>

      {/* Stats summary */}
      {stats ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "XP",     value: stats.xp.toLocaleString(),    icon: "⚡", color: "text-yellow-500" },
              { label: "Coins",  value: stats.coins.toLocaleString(),  icon: "🪙", color: "text-amber-500" },
              { label: "Level",  value: `Lv.${stats.level}`,           icon: "🎯", color: "text-blue-500" },
              { label: "Streak", value: `${stats.streak}d`,            icon: "🔥", color: "text-red-500" },
            ].map((s) => (
              <Card key={s.label}>
                <CardContent className="p-4 flex items-center gap-3">
                  <span className="text-2xl">{s.icon}</span>
                  <div>
                    <p className="font-bold text-lg">{s.value}</p>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <LevelProgress totalXp={stats.totalXp} level={stats.level} />
        </>
      ) : (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            <p>Start contributing to earn XP and coins!</p>
            <Button asChild className="mt-3" size="sm">
              <Link href="/places/new">Add a Place</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="badges">
        <TabsList>
          <TabsTrigger value="badges">Badges</TabsTrigger>
          <TabsTrigger value="redemptions">Redemptions ({redemptions.length})</TabsTrigger>
          <TabsTrigger value="transactions">Coin History</TabsTrigger>
        </TabsList>

        {/* Badges */}
        <TabsContent value="badges" className="pt-4">
          <div className="space-y-4">
            <h3 className="font-semibold">Explorer Badges</h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {allBadges.filter((b) => b.type === "EXPLORER").map((b) => (
                <BadgeCard key={b.id} name={b.name} description={b.description}
                  icon={b.icon} type={b.type} rarity={b.rarity}
                  earned={b.earned} earnedAt={b.earnedAt} />
              ))}
            </div>

            <h3 className="font-semibold mt-4">Community Badges</h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {allBadges.filter((b) => b.type === "COMMUNITY").map((b) => (
                <BadgeCard key={b.id} name={b.name} description={b.description}
                  icon={b.icon} type={b.type} rarity={b.rarity}
                  earned={b.earned} earnedAt={b.earnedAt} />
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Redemptions */}
        <TabsContent value="redemptions" className="pt-4">
          {redemptions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>No redemptions yet.</p>
              <Button asChild variant="outline" size="sm" className="mt-3">
                <Link href="/rewards">Redeem Coins</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {redemptions.map((r) => {
                const cfg = STATUS_CONFIG[r.status] ?? STATUS_CONFIG.PENDING;
                const StatusIcon = cfg.icon;
                return (
                  <Card key={r.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{r.reward.icon}</span>
                          <div>
                            <p className="font-semibold">{r.reward.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                              {" · "}{r.coinsSpent.toLocaleString()} 🪙
                            </p>
                          </div>
                        </div>
                        <span className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${cfg.color}`}>
                          <StatusIcon className="h-3 w-3" /> {cfg.label}
                        </span>
                      </div>

                      {/* Tracking */}
                      {r.trackingNumber && (
                        <p className="text-xs mt-2 text-muted-foreground">
                          Tracking: <span className="font-medium">{r.trackingNumber}</span>
                        </p>
                      )}
                      {r.adminNotes && (
                        <p className="text-xs mt-1 text-muted-foreground italic">"{r.adminNotes}"</p>
                      )}

                      {/* Shipping address */}
                      <details className="mt-2">
                        <summary className="text-xs text-primary cursor-pointer">View shipping address</summary>
                        <div className="mt-1 text-xs text-muted-foreground space-y-0.5 pl-2">
                          <p>{r.fullName} · {r.phone}</p>
                          <p>{[r.houseNumber, r.streetAddress].filter(Boolean).join(", ")}</p>
                          <p>{[r.area, r.city, r.district, r.state, r.postalCode].filter(Boolean).join(", ")}</p>
                          <p>{r.country}</p>
                        </div>
                      </details>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Coin Transactions */}
        <TabsContent value="transactions" className="pt-4">
          {coinTxns.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground text-sm">No transactions yet.</p>
          ) : (
            <div className="space-y-2">
              {coinTxns.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg border bg-card text-sm">
                  <div>
                    <p className="font-medium">{tx.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(tx.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </p>
                  </div>
                  <span className={`font-bold ${tx.amount > 0 ? "text-green-600" : "text-red-500"}`}>
                    {tx.amount > 0 ? "+" : ""}{tx.amount} 🪙
                  </span>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
