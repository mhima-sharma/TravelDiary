import { cache } from "react";
import { db } from "@/lib/db";
import { ApiServiceKey } from "@prisma/client";

export const DEFAULT_UNAVAILABLE_MESSAGE =
  "Our AI Trip Planner is temporarily unavailable. Please check back soon!";

const SERVICE_NAMES: Record<ApiServiceKey, string> = {
  GEMINI: "Gemini",
  GEOAPIFY: "Geoapify",
  OPEN_METEO: "Open-Meteo",
  OSRM: "OSRM",
  COUNTRIES_NOW: "CountriesNow",
};

export const getAiSettings = cache(async () => {
  return db.aiSettings.upsert({
    where: { id: "global" },
    update: {},
    create: { id: "global", unavailableMessage: DEFAULT_UNAVAILABLE_MESSAGE },
  });
});

export const getApiServices = cache(async () => {
  const existing = await db.apiService.findMany();
  const missingKeys = Object.values(ApiServiceKey).filter(
    (key) => !existing.some((s) => s.key === key)
  );

  if (missingKeys.length > 0) {
    await db.apiService.createMany({
      data: missingKeys.map((key) => ({ key, name: SERVICE_NAMES[key] })),
    });
    return db.apiService.findMany({ orderBy: { key: "asc" } });
  }

  return existing.sort((a, b) => a.key.localeCompare(b.key));
});

export async function getApiService(key: ApiServiceKey) {
  const services = await getApiServices();
  const service = services.find((s) => s.key === key);
  if (!service) throw new Error(`ApiService ${key} not found after lazy upsert`);
  return service;
}
