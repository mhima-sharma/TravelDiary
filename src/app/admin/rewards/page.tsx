import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { adminGetRedemptions, getRewardMetrics } from "@/actions/rewards";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Truck, CheckCircle2, Clock } from "lucide-react";
import { RedemptionActionsClient } from "./redemption-actions";

export const dynamic = "force-dynamic";

export default async function AdminRewardsPage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/");

  const [metrics, redemptions] = await Promise.all([
    getRewardMetrics(),
    adminGetRedemptions(),
  ]);

  const STATUS_CFG = {
    PENDING:   { label: "Pending",   color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" },
    APPROVED:  { label: "Approved",  color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
    SHIPPED:   { label: "Shipped",   color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200" },
    DELIVERED: { label: "Delivered", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
    REJECTED:  { label: "Rejected",  color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" },
  } as const;

  const metricCards = [
    { label: "Total Redemptions", value: metrics?.total ?? 0,     icon: Package },
    { label: "Pending",           value: metrics?.pending ?? 0,   icon: Clock },
    { label: "Approved",          value: metrics?.approved ?? 0,  icon: CheckCircle2 },
    { label: "Shipped",           value: metrics?.shipped ?? 0,   icon: Truck },
    { label: "Delivered",         value: metrics?.delivered ?? 0, icon: CheckCircle2 },
  ];

  function filterByStatus(s?: string) {
    if (!s) return redemptions;
    return redemptions.filter((r) => r.status === s);
  }

  function RedemptionCard({ r }: { r: typeof redemptions[0] }) {
    const cfg = STATUS_CFG[r.status] ?? STATUS_CFG.PENDING;
    return (
      <Card>
        <CardContent className="p-4 space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xl">{r.reward.icon}</span>
              <div>
                <p className="font-semibold text-sm">{r.reward.name}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  {" · "}{r.coinsSpent.toLocaleString()} 🪙
                </p>
              </div>
            </div>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cfg.color}`}>{cfg.label}</span>
          </div>

          {/* User */}
          <div className="text-sm border-t pt-2">
            <p className="font-medium">{r.user.name} <span className="text-muted-foreground font-normal text-xs">({r.user.email})</span></p>
          </div>

          {/* Shipping Address */}
          <div className="text-xs text-muted-foreground space-y-0.5 bg-muted/40 rounded-lg p-3">
            <p className="font-medium text-foreground">{r.fullName}</p>
            <p>{r.phone} · {r.email}</p>
            <p>{[r.houseNumber, r.streetAddress].filter(Boolean).join(", ")}{r.landmark ? `, Near ${r.landmark}` : ""}</p>
            <p>{[r.area, r.city, r.district, r.state, r.postalCode].filter(Boolean).join(", ")}</p>
            <p>{r.country}</p>
            {r.deliveryInstructions && <p className="italic mt-1">"{r.deliveryInstructions}"</p>}
          </div>

          {r.trackingNumber && (
            <p className="text-xs">Tracking: <span className="font-medium">{r.trackingNumber}</span></p>
          )}
          {r.adminNotes && (
            <p className="text-xs italic text-muted-foreground">Note: {r.adminNotes}</p>
          )}

          {/* Admin actions */}
          <RedemptionActionsClient redemptionId={r.id} currentStatus={r.status} />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Reward Redemptions</h1>

      {/* Metrics */}
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 md:gap-3">
        {metricCards.map((m) => (
          <Card key={m.label}>
            <CardContent className="p-3 md:p-4">
              <m.icon className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground mb-1.5" />
              <p className="text-xl md:text-2xl font-bold">{m.value}</p>
              <p className="text-xs text-muted-foreground leading-tight">{m.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="all">
        <div className="overflow-x-auto pb-1">
          <TabsList className="w-max">
            <TabsTrigger value="all">All ({redemptions.length})</TabsTrigger>
            <TabsTrigger value="PENDING">Pending ({metrics?.pending ?? 0})</TabsTrigger>
            <TabsTrigger value="APPROVED">Approved ({metrics?.approved ?? 0})</TabsTrigger>
            <TabsTrigger value="SHIPPED">Shipped ({metrics?.shipped ?? 0})</TabsTrigger>
            <TabsTrigger value="DELIVERED">Delivered ({metrics?.delivered ?? 0})</TabsTrigger>
          </TabsList>
        </div>

        {["all", "PENDING", "APPROVED", "SHIPPED", "DELIVERED"].map((tab) => (
          <TabsContent key={tab} value={tab} className="pt-4">
            {filterByStatus(tab === "all" ? undefined : tab).length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>No redemptions found.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {filterByStatus(tab === "all" ? undefined : tab).map((r) => (
                  <RedemptionCard key={r.id} r={r} />
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
