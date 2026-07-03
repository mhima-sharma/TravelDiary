import { db } from "@/lib/db";
import { ApiServiceKey, AiFeature, AutoDisabledCause, ApiService } from "@prisma/client";

export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; reason: "disabled" | "limit" | "error"; message: string };

const TIMEOUT_MS = 8000;
const DEFAULT_UNAVAILABLE_MESSAGE = "This service is temporarily unavailable.";

function utcDayStart(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function utcMonthStart(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

async function countSince(key: ApiServiceKey, since: Date) {
  return db.apiRequestLog.count({ where: { service: key, createdAt: { gte: since } } });
}

/** Re-checks whether usage has dropped back under the limit that caused the current auto-disable (period rollover). */
async function isBackUnderLimit(service: ApiService): Promise<boolean> {
  const now = new Date();
  if (service.autoDisabledCause === "DAILY_LIMIT") {
    if (service.dailyLimit == null) return true;
    return (await countSince(service.key, utcDayStart(now))) < service.dailyLimit;
  }
  if (service.autoDisabledCause === "MONTHLY_LIMIT") {
    if (service.monthlyLimit == null) return true;
    return (await countSince(service.key, utcMonthStart(now))) < service.monthlyLimit;
  }
  return true;
}

async function disableForCause(key: ApiServiceKey, cause: AutoDisabledCause, reason: string) {
  await db.apiService.updateMany({
    where: { key, autoDisabled: false },
    data: { autoDisabled: true, autoDisabledCause: cause, autoDisabledReason: reason },
  });
}

/** Checks configured daily/monthly limits against current usage; auto-disables and returns true if a limit is hit. */
async function checkAndHandleLimits(service: ApiService): Promise<boolean> {
  const now = new Date();

  if (service.dailyLimit != null) {
    const count = await countSince(service.key, utcDayStart(now));
    if (count >= service.dailyLimit) {
      await disableForCause(service.key, "DAILY_LIMIT", `Daily limit of ${service.dailyLimit} requests reached.`);
      return true;
    }
  }

  if (service.monthlyLimit != null) {
    const count = await countSince(service.key, utcMonthStart(now));
    if (count >= service.monthlyLimit) {
      await disableForCause(service.key, "MONTHLY_LIMIT", `Monthly limit of ${service.monthlyLimit} requests reached.`);
      return true;
    }
  }

  return false;
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Request timed out after ${ms}ms`)), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      }
    );
  });
}

/**
 * Single choke point for all external API calls (Gemini, Geoapify, Open-Meteo, OSRM, CountriesNow).
 * Applies admin enable/disable toggles, daily/monthly limits, auto-protection on repeated failures,
 * and request logging - never throws, always resolves to an ApiResult.
 */
export async function callExternalApi<T>(
  serviceKey: ApiServiceKey,
  endpoint: string,
  feature: AiFeature | null,
  userId: string | null,
  fn: () => Promise<T>,
  timeoutMs: number = TIMEOUT_MS
): Promise<ApiResult<T>> {
  let service = await db.apiService.upsert({
    where: { key: serviceKey },
    update: {},
    create: { key: serviceKey, name: serviceKey },
  });

  if (service.autoDisabled) {
    if (service.autoDisabledCause !== "FAILURES" && (await isBackUnderLimit(service))) {
      service = await db.apiService.update({
        where: { key: serviceKey },
        data: { autoDisabled: false, autoDisabledCause: null, autoDisabledReason: null },
      });
    }
    if (service.autoDisabled) {
      return { ok: false, reason: "disabled", message: service.maintenanceMessage ?? DEFAULT_UNAVAILABLE_MESSAGE };
    }
  }

  if (!service.enabled) {
    return { ok: false, reason: "disabled", message: service.maintenanceMessage ?? DEFAULT_UNAVAILABLE_MESSAGE };
  }

  if (await checkAndHandleLimits(service)) {
    return {
      ok: false,
      reason: "limit",
      message: service.maintenanceMessage ?? "Usage limit reached, please try again later.",
    };
  }

  try {
    const data = await withTimeout(fn(), timeoutMs);
    await Promise.all([
      db.apiRequestLog.create({ data: { service: serviceKey, endpoint, feature, userId, success: true } }),
      db.apiService.update({
        where: { key: serviceKey },
        data: { consecutiveFailures: 0, lastSuccessAt: new Date(), lastError: null },
      }),
    ]);
    return { ok: true, data };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";

    await db.apiRequestLog.create({
      data: { service: serviceKey, endpoint, feature, userId, success: false, errorMessage: message },
    });

    const updated = await db.apiService.update({
      where: { key: serviceKey },
      data: { consecutiveFailures: { increment: 1 }, lastError: message, lastErrorAt: new Date() },
    });

    if (updated.consecutiveFailures >= 3) {
      await db.apiService.updateMany({
        where: { key: serviceKey, autoDisabled: false, consecutiveFailures: { gte: 3 } },
        data: {
          autoDisabled: true,
          autoDisabledCause: "FAILURES",
          autoDisabledReason: `Auto-disabled after ${updated.consecutiveFailures} consecutive failures. Last error: ${message}`,
        },
      });
    }

    return { ok: false, reason: "error", message: service.maintenanceMessage ?? DEFAULT_UNAVAILABLE_MESSAGE };
  }
}
