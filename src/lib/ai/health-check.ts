import { db } from "@/lib/db";
import { ApiServiceKey } from "@prisma/client";

const PING_TIMEOUT_MS = 8000;

interface HealthCheckResult {
  key: ApiServiceKey;
  status: "ONLINE" | "OFFLINE";
  error?: string;
}

async function pingWithTimeout(url: string, init?: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PING_TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function ping(key: ApiServiceKey, run: () => Promise<Response>): Promise<HealthCheckResult> {
  try {
    const res = await run();
    return res.ok ? { key, status: "ONLINE" } : { key, status: "OFFLINE", error: `HTTP ${res.status}` };
  } catch (err) {
    return { key, status: "OFFLINE", error: err instanceof Error ? err.message : "Unknown error" };
  }
}

function pingGemini(): Promise<HealthCheckResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return Promise.resolve({ key: "GEMINI", status: "OFFLINE", error: "GEMINI_API_KEY is not configured" });

  return ping("GEMINI", () =>
    pingWithTimeout(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: "ping" }] }] }),
    })
  );
}

function pingGeoapify(): Promise<HealthCheckResult> {
  const apiKey = process.env.GEOAPIFY_API_KEY;
  if (!apiKey) return Promise.resolve({ key: "GEOAPIFY", status: "OFFLINE", error: "GEOAPIFY_API_KEY is not configured" });

  return ping("GEOAPIFY", () =>
    pingWithTimeout(`https://api.geoapify.com/v1/geocode/search?text=London&limit=1&apiKey=${apiKey}`)
  );
}

function pingOpenMeteo(): Promise<HealthCheckResult> {
  return ping("OPEN_METEO", () =>
    pingWithTimeout("https://api.open-meteo.com/v1/forecast?latitude=28.6&longitude=77.2&current_weather=true")
  );
}

function pingOsrm(): Promise<HealthCheckResult> {
  return ping("OSRM", () =>
    pingWithTimeout("https://router.project-osrm.org/route/v1/driving/77.2,28.6;77.3,28.7?overview=false")
  );
}

function pingCountriesNow(): Promise<HealthCheckResult> {
  return ping("COUNTRIES_NOW", () => pingWithTimeout("https://countriesnow.space/api/v0.1/countries/positions"));
}

/**
 * Pings each service directly, bypassing callExternalApi's logging/limits (health pings
 * shouldn't count against user-facing quota). Clears a FAILURES-caused autoDisabled when a
 * probe succeeds - the only self-healing path for that cause besides a manual admin re-enable.
 */
export async function runHealthCheck(): Promise<HealthCheckResult[]> {
  const results = await Promise.all([pingGemini(), pingGeoapify(), pingOpenMeteo(), pingOsrm(), pingCountriesNow()]);

  await Promise.all(
    results.map(async (result) => {
      const now = new Date();
      const service = await db.apiService.upsert({
        where: { key: result.key },
        update: {},
        create: { key: result.key, name: result.key },
      });

      const clearsFailureDisable = result.status === "ONLINE" && service.autoDisabledCause === "FAILURES";

      await db.apiService.update({
        where: { key: result.key },
        data: {
          status: result.status,
          lastCheckedAt: now,
          ...(result.status === "ONLINE"
            ? { lastSuccessAt: now, lastError: null, consecutiveFailures: 0 }
            : { lastError: result.error, lastErrorAt: now }),
          ...(clearsFailureDisable ? { autoDisabled: false, autoDisabledCause: null, autoDisabledReason: null } : {}),
        },
      });
    })
  );

  return results;
}

export async function pruneOldRequestLogs(retentionDays = 90): Promise<number> {
  const cutoff = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
  const { count } = await db.apiRequestLog.deleteMany({ where: { createdAt: { lt: cutoff } } });
  return count;
}
