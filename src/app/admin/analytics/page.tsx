import { db } from "@/lib/db";
import { BarChart3, Users, Eye, TrendingUp, Monitor, Smartphone, Tablet, Globe, Zap, ExternalLink } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Analytics" };

type PageSpeedCategory = { score: number | null };

async function fetchPageSpeed(url: string, strategy: "mobile" | "desktop") {
  const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=${strategy}&category=performance&category=accessibility&category=best-practices&category=seo`;
  try {
    const res = await fetch(apiUrl, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    const data = await res.json();
    const cats = data.lighthouseResult?.categories as Record<string, PageSpeedCategory> | undefined;
    return {
      performance: cats?.performance?.score != null ? Math.round(cats.performance.score * 100) : null,
      accessibility: cats?.accessibility?.score != null ? Math.round(cats.accessibility.score * 100) : null,
      bestPractices: cats?.["best-practices"]?.score != null ? Math.round(cats["best-practices"].score * 100) : null,
      seo: cats?.seo?.score != null ? Math.round(cats.seo.score * 100) : null,
    };
  } catch {
    return null;
  }
}

function scoreColor(score: number | null) {
  if (score === null) return "text-muted-foreground";
  if (score >= 90) return "text-green-600 dark:text-green-400";
  if (score >= 50) return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-400";
}

function scoreRingColor(score: number | null) {
  if (score === null) return "#94a3b8";
  if (score >= 90) return "#16a34a";
  if (score >= 50) return "#d97706";
  return "#dc2626";
}

function ScoreRing({ score, label }: { score: number | null; label: string }) {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const filled = score != null ? (score / 100) * circumference : 0;
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative w-[72px] h-[72px]">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 72 72">
          <circle cx="36" cy="36" r={radius} fill="none" stroke="currentColor" strokeWidth="6" className="text-muted/50" />
          <circle
            cx="36" cy="36" r={radius} fill="none"
            stroke={scoreRingColor(score)} strokeWidth="6"
            strokeDasharray={`${filled} ${circumference}`}
            strokeLinecap="round"
          />
        </svg>
        <span className={`absolute inset-0 flex items-center justify-center text-sm font-bold ${scoreColor(score)}`}>
          {score ?? "—"}
        </span>
      </div>
      <span className="text-xs text-muted-foreground text-center leading-tight">{label}</span>
    </div>
  );
}

async function PageSpeedSection({ siteUrl }: { siteUrl: string }) {
  const [mobile, desktop] = await Promise.all([
    fetchPageSpeed(siteUrl, "mobile"),
    fetchPageSpeed(siteUrl, "desktop"),
  ]);

  const psUrl = `https://pagespeed.web.dev/analysis?url=${encodeURIComponent(siteUrl)}`;

  return (
    <div className="bg-card border rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-primary" />
          <h2 className="font-semibold">PageSpeed Insights</h2>
          <span className="text-xs text-muted-foreground">— refreshed every hour</span>
        </div>
        <a
          href={psUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs text-primary hover:underline"
        >
          Open full report <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      {!mobile && !desktop ? (
        <p className="text-sm text-muted-foreground">Could not load PageSpeed data. The API may be rate-limited — try again in a minute.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { label: "Mobile", data: mobile },
            { label: "Desktop", data: desktop },
          ].map(({ label, data }) => (
            <div key={label}>
              <p className="text-sm font-medium mb-4 flex items-center gap-2">
                {label === "Mobile" ? <Smartphone className="h-4 w-4 text-muted-foreground" /> : <Monitor className="h-4 w-4 text-muted-foreground" />}
                {label}
              </p>
              <div className="grid grid-cols-4 gap-2">
                <ScoreRing score={data?.performance ?? null} label="Performance" />
                <ScoreRing score={data?.accessibility ?? null} label="Accessibility" />
                <ScoreRing score={data?.bestPractices ?? null} label="Best Practices" />
                <ScoreRing score={data?.seo ?? null} label="SEO" />
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 pt-4 border-t flex gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" />90–100 Good</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />50–89 Needs improvement</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" />0–49 Poor</span>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub }: { icon: React.ElementType; label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-card border rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-muted-foreground">{label}</p>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <p className="text-3xl font-bold">{typeof value === "number" ? value.toLocaleString() : value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </div>
  );
}

export default async function AnalyticsPage() {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(todayStart); weekStart.setDate(weekStart.getDate() - 6);
  const monthStart = new Date(todayStart); monthStart.setDate(monthStart.getDate() - 29);

  const [totalViews, todayViews, weekViews, monthViews, uniqueRaw, deviceCounts, topPages, dailyRaw] = await Promise.all([
    db.pageView.count(),
    db.pageView.count({ where: { createdAt: { gte: todayStart } } }),
    db.pageView.count({ where: { createdAt: { gte: weekStart } } }),
    db.pageView.count({ where: { createdAt: { gte: monthStart } } }),
    // COUNT(DISTINCT) via raw query — avoids loading all rows into JS memory
    db.$queryRaw<{ uniqueTotal: bigint; uniqueToday: bigint }[]>`
      SELECT
        COUNT(DISTINCT ipHash)                                    AS uniqueTotal,
        COUNT(DISTINCT CASE WHEN createdAt >= ${todayStart} THEN ipHash END) AS uniqueToday
      FROM page_views
    `,
    db.pageView.groupBy({ by: ["device"], _count: { _all: true } }),
    db.pageView.groupBy({ by: ["path"], _count: { _all: true }, orderBy: { _count: { path: "desc" } }, take: 10 }),
    // last 30 days daily counts
    db.$queryRaw<{ date: string; count: bigint }[]>`
      SELECT DATE(createdAt) as date, COUNT(*) as count
      FROM page_views
      WHERE createdAt >= ${monthStart.toISOString()}
      GROUP BY DATE(createdAt)
      ORDER BY date ASC
    `,
  ]);

  const uniqueTotal = Number(uniqueRaw[0]?.uniqueTotal ?? 0);
  const uniqueToday = Number(uniqueRaw[0]?.uniqueToday ?? 0);

  // Build a full 30-day array (fill missing days with 0)
  const dailyMap = new Map(dailyRaw.map((r) => [r.date, Number(r.count)]));
  const dailyData: { date: string; count: number; label: string }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(todayStart);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    dailyData.push({ date: key, count: dailyMap.get(key) ?? 0, label: d.toLocaleDateString("en-IN", { month: "short", day: "numeric" }) });
  }

  const maxDaily = Math.max(...dailyData.map((d) => d.count), 1);

  const deviceMap: Record<string, number> = {};
  for (const d of deviceCounts) deviceMap[d.device] = d._count._all;

  const deviceTotal = Object.values(deviceMap).reduce((a, b) => a + b, 0) || 1;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">Website visitor statistics</p>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Eye} label="Total Page Views" value={totalViews} sub="all time" />
        <StatCard icon={Users} label="Unique Visitors" value={uniqueTotal} sub="all time" />
        <StatCard icon={TrendingUp} label="Views Today" value={todayViews} sub={`${uniqueToday} unique`} />
        <StatCard icon={BarChart3} label="Views This Week" value={weekViews} sub="last 7 days" />
      </div>

      {/* Daily chart */}
      <div className="bg-card border rounded-xl p-6">
        <h2 className="font-semibold mb-6">Daily Views — Last 30 Days</h2>
        <div className="flex items-end gap-1 h-40">
          {dailyData.map((d) => (
            <div key={d.date} className="flex-1 flex flex-col items-center gap-1 group relative" title={`${d.label}: ${d.count} views`}>
              <div
                className="w-full bg-primary/80 hover:bg-primary rounded-sm transition-all cursor-default"
                style={{ height: `${Math.max((d.count / maxDaily) * 100, d.count > 0 ? 4 : 0)}%` }}
              />
              {/* tooltip on hover */}
              <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-center z-10 pointer-events-none">
                <div className="bg-popover border text-popover-foreground text-xs px-2 py-1 rounded shadow whitespace-nowrap">
                  {d.label}: <strong>{d.count}</strong>
                </div>
                <div className="w-1.5 h-1.5 bg-popover border-b border-r rotate-45 -mt-1" />
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-between text-xs text-muted-foreground mt-2">
          <span>{dailyData[0]?.label}</span>
          <span>{dailyData[14]?.label}</span>
          <span>{dailyData[29]?.label}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top pages */}
        <div className="bg-card border rounded-xl p-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2"><Globe className="h-4 w-4" /> Top Pages</h2>
          {topPages.length === 0 ? (
            <p className="text-sm text-muted-foreground">No data yet</p>
          ) : (
            <div className="space-y-3">
              {topPages.map((p) => {
                const pct = Math.round((p._count._all / (topPages[0]._count._all || 1)) * 100);
                return (
                  <div key={p.path}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="truncate font-mono text-xs text-muted-foreground max-w-[200px]">{p.path}</span>
                      <span className="font-medium ml-2 flex-shrink-0">{p._count._all.toLocaleString()}</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Device breakdown */}
        <div className="bg-card border rounded-xl p-6">
          <h2 className="font-semibold mb-4">Device Breakdown</h2>
          <div className="space-y-4">
            {[
              { key: "desktop", label: "Desktop", icon: Monitor },
              { key: "mobile", label: "Mobile", icon: Smartphone },
              { key: "tablet", label: "Tablet", icon: Tablet },
            ].map(({ key, label, icon: Icon }) => {
              const count = deviceMap[key] ?? 0;
              const pct = Math.round((count / deviceTotal) * 100);
              return (
                <div key={key}>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="flex items-center gap-2"><Icon className="h-4 w-4 text-muted-foreground" />{label}</span>
                    <span className="font-medium">{count.toLocaleString()} <span className="text-muted-foreground font-normal">({pct}%)</span></span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 pt-4 border-t grid grid-cols-2 gap-3 text-sm">
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold">{monthViews.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Views (30 days)</p>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold">{totalViews > 0 ? (totalViews / Math.max(uniqueTotal, 1)).toFixed(1) : "0"}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Pages / Visitor</p>
            </div>
          </div>
        </div>
      </div>

      {/* PageSpeed Insights */}
      <PageSpeedSection siteUrl={process.env.NEXT_PUBLIC_APP_URL ?? "https://travel-diary-ochre.vercel.app/"} />
    </div>
  );
}
