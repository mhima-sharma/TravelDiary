import type { Metadata } from "next";
import { db } from "@/lib/db";
import { getAiSettings, getApiServices } from "@/lib/ai/settings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GlobalSettingsForm } from "./global-settings-form";
import { ServiceCard } from "./service-card";
import { HealthCheckButton } from "./health-check-button";
import { ApiServiceKey } from "@prisma/client";

export const metadata: Metadata = { title: "AI Services" };

function utcDayStart(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function utcMonthStart(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

async function getServiceUsage(key: ApiServiceKey, dayStart: Date, monthStart: Date) {
  const [todayTotal, todayFailed, monthTotal, monthFailed] = await Promise.all([
    db.apiRequestLog.count({ where: { service: key, createdAt: { gte: dayStart } } }),
    db.apiRequestLog.count({ where: { service: key, createdAt: { gte: dayStart }, success: false } }),
    db.apiRequestLog.count({ where: { service: key, createdAt: { gte: monthStart } } }),
    db.apiRequestLog.count({ where: { service: key, createdAt: { gte: monthStart }, success: false } }),
  ]);
  return {
    todayTotal,
    todaySuccess: todayTotal - todayFailed,
    todayFailed,
    monthTotal,
    monthFailed,
  };
}

const STATUS_LABEL: Record<string, string> = {
  ONLINE: "Online",
  OFFLINE: "Offline",
  DEGRADED: "Degraded",
  UNKNOWN: "Unknown",
};

export default async function AiServicesPage() {
  const now = new Date();
  const dayStart = utcDayStart(now);
  const monthStart = utcMonthStart(now);

  const [settings, services] = await Promise.all([getAiSettings(), getApiServices()]);

  const [todayTotalAll, todayFailedAll, usageEntries, nonExpiredCacheCount] = await Promise.all([
    db.apiRequestLog.count({ where: { createdAt: { gte: dayStart } } }),
    db.apiRequestLog.count({ where: { createdAt: { gte: dayStart }, success: false } }),
    Promise.all(services.map(async (s) => [s.key, await getServiceUsage(s.key, dayStart, monthStart)] as const)),
    db.aiItineraryCache.count({ where: { expiresAt: { gt: now } } }),
  ]);

  const usageMap = Object.fromEntries(usageEntries);
  const serviceByKey = (key: ApiServiceKey) => services.find((s) => s.key === key);

  const totalCacheAttempts = settings.totalCacheHits + settings.totalCacheMisses + settings.totalForceRegenerations;
  const estimatedUsageSavedPct =
    totalCacheAttempts > 0 ? Math.round((settings.totalCacheHits / totalCacheAttempts) * 100) : 0;

  const statusCards = [
    { label: "AI Trip Planner Status", value: settings.tripPlannerEnabled ? "Enabled" : "Disabled" },
    { label: "Gemini Status", value: STATUS_LABEL[serviceByKey("GEMINI")?.status ?? "UNKNOWN"] },
    { label: "Geoapify Status", value: STATUS_LABEL[serviceByKey("GEOAPIFY")?.status ?? "UNKNOWN"] },
    { label: "Weather API (Open-Meteo) Status", value: STATUS_LABEL[serviceByKey("OPEN_METEO")?.status ?? "UNKNOWN"] },
    { label: "Routing API (OSRM) Status", value: STATUS_LABEL[serviceByKey("OSRM")?.status ?? "UNKNOWN"] },
    { label: "Total API Requests Today", value: String(todayTotalAll) },
    { label: "Total Failed Requests Today", value: String(todayFailedAll) },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">AI Services</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Monitor, rate-limit, and control the AI Trip Planner and chatbot
          </p>
        </div>
        <HealthCheckButton />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statusCards.map((c) => (
          <Card key={c.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{c.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold">{c.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cache Stats</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Cache Hits</p>
            <p className="text-lg font-semibold">{settings.totalCacheHits}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Cache Misses</p>
            <p className="text-lg font-semibold">{settings.totalCacheMisses}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Requests Saved</p>
            <p className="text-lg font-semibold">{settings.totalCacheHits}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Estimated Usage Saved</p>
            <p className="text-lg font-semibold">{estimatedUsageSavedPct}%</p>
          </div>
          <div>
            <p className="text-muted-foreground">Cached Itineraries</p>
            <p className="text-lg font-semibold">{nonExpiredCacheCount}</p>
          </div>
        </CardContent>
      </Card>

      <GlobalSettingsForm settings={settings} />

      <div>
        <h2 className="text-lg font-semibold mb-3">API Services</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {services.map((service) => (
            <ServiceCard key={service.key} service={service} usage={usageMap[service.key]} />
          ))}
        </div>
      </div>
    </div>
  );
}
