import { db } from "@/lib/db";
import { getAiSettings } from "./settings";
import { getCurrentWeather, CurrentWeather } from "./open-meteo";
import { getNearbyAttractions, NearbyAttraction } from "./geoapify";
import { RouteInfo } from "./osrm";

export interface TripPlanResponse {
  itinerary: string;
  nearbyAttractions: NearbyAttraction[] | null;
  weather: CurrentWeather | null;
  routeInfo: RouteInfo | null;
  destinationLat: number | null;
  destinationLon: number | null;
  destinationImage: string | null;
}

export async function findCachedItinerary(promptHash: string) {
  return db.aiItineraryCache.findFirst({
    where: { promptHash, expiresAt: { gt: new Date() } },
  });
}

export async function recordCacheHit(cacheId: string) {
  await Promise.all([
    db.aiItineraryCache.update({
      where: { id: cacheId },
      data: { accessCount: { increment: 1 }, lastAccessedAt: new Date() },
    }),
    db.aiSettings.update({
      where: { id: "global" },
      data: { totalCacheHits: { increment: 1 } },
    }),
  ]);
}

export async function recordCacheMiss(forced: boolean) {
  await db.aiSettings.update({
    where: { id: "global" },
    data: forced ? { totalForceRegenerations: { increment: 1 } } : { totalCacheMisses: { increment: 1 } },
  });
}

export async function upsertItineraryCache(params: {
  promptHash: string;
  originalPrompt: string;
  normalizedPrompt: string;
  destination: string | null;
  duration: number | null;
  budget: number | null;
  destinationLat: number | null;
  destinationLon: number | null;
  response: TripPlanResponse;
  userId: string | null;
}) {
  const settings = await getAiSettings();
  const expiresAt = new Date(Date.now() + settings.cacheDurationDays * 24 * 60 * 60 * 1000);
  const responseJson = JSON.stringify(params.response);

  // Upsert (not create) so two identical prompts that miss concurrently don't hit the unique constraint on promptHash.
  return db.aiItineraryCache.upsert({
    where: { promptHash: params.promptHash },
    update: {
      response: responseJson,
      destinationLat: params.destinationLat,
      destinationLon: params.destinationLon,
      lastAccessedAt: new Date(),
      expiresAt,
    },
    create: {
      promptHash: params.promptHash,
      originalPrompt: params.originalPrompt,
      normalizedPrompt: params.normalizedPrompt,
      destination: params.destination,
      duration: params.duration,
      budget: params.budget,
      destinationLat: params.destinationLat,
      destinationLon: params.destinationLon,
      response: responseJson,
      userId: params.userId,
      expiresAt,
    },
  });
}

/**
 * On a cache hit, weather is time-bound and goes stale, so we still attempt a live,
 * non-blocking re-fetch of weather + nearby attractions using the cache row's stored
 * destination coordinates. Gemini itself is skipped (regenerating itinerary text on every
 * hit would defeat the cache) and OSRM inter-stop routing is served from the stored blob
 * unchanged, since only the single destination point is persisted, not each stop.
 */
export async function refreshCacheEnrichment(
  cached: { destinationLat: number | null; destinationLon: number | null; response: string },
  userId: string | null
): Promise<TripPlanResponse> {
  const stored: TripPlanResponse = JSON.parse(cached.response);
  if (cached.destinationLat == null || cached.destinationLon == null) return stored;

  const [weatherResult, attractionsResult] = await Promise.all([
    getCurrentWeather(cached.destinationLat, cached.destinationLon, userId),
    getNearbyAttractions(cached.destinationLat, cached.destinationLon, userId),
  ]);

  return {
    ...stored,
    destinationLat: cached.destinationLat,
    destinationLon: cached.destinationLon,
    weather: weatherResult.ok ? weatherResult.data : stored.weather,
    nearbyAttractions: attractionsResult.ok ? attractionsResult.data : stored.nearbyAttractions,
  };
}
