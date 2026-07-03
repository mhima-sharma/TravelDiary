"use server";

import { auth } from "@/lib/auth";
import { TripPlannerSchema } from "@/schemas";
import { getAiSettings } from "@/lib/ai/settings";
import { normalizePrompt, buildCacheKey } from "@/lib/ai/prompt-parser";
import {
  findCachedItinerary,
  recordCacheHit,
  recordCacheMiss,
  refreshCacheEnrichment,
  upsertItineraryCache,
  TripPlanResponse,
} from "@/lib/ai/cache";
import { generateItinerary } from "@/lib/ai/gemini";
import { geocodeDestination, getNearbyAttractions } from "@/lib/ai/geoapify";
import { getCurrentWeather } from "@/lib/ai/open-meteo";
import { getRouteInfo } from "@/lib/ai/osrm";
import { getDestinationImage } from "@/lib/ai/wikipedia";

export type TripPlanResult = { error: string } | (TripPlanResponse & { cached: boolean });

export async function generateTripPlan(
  prompt: string,
  options?: { forceRegenerate?: boolean }
): Promise<TripPlanResult> {
  const settings = await getAiSettings();
  if (!settings.tripPlannerEnabled) {
    return { error: settings.unavailableMessage };
  }

  const parsed = TripPlannerSchema.safeParse({ prompt });
  if (!parsed.success) {
    return { error: "Please enter a valid trip request." };
  }

  const session = await auth();
  const userId = session?.user?.id ?? null;

  const normalized = normalizePrompt(parsed.data.prompt);
  const { promptHash, params } = buildCacheKey(normalized);
  const forceRegenerate = options?.forceRegenerate ?? false;

  if (!forceRegenerate && settings.cacheEnabled) {
    const cached = await findCachedItinerary(promptHash);
    if (cached) {
      await recordCacheHit(cached.id);
      const response = await refreshCacheEnrichment(cached, userId);
      return { ...response, cached: true };
    }
  }

  await recordCacheMiss(forceRegenerate);

  const itineraryResult = await generateItinerary(parsed.data.prompt, userId);
  if (!itineraryResult.ok) {
    return { error: itineraryResult.message };
  }

  let destinationLat: number | null = null;
  let destinationLon: number | null = null;
  let nearbyAttractions: TripPlanResponse["nearbyAttractions"] = null;
  let weather: TripPlanResponse["weather"] = null;
  let routeInfo: TripPlanResponse["routeInfo"] = null;
  let destinationImage: TripPlanResponse["destinationImage"] = null;

  if (params.destination) {
    const geocoded = await geocodeDestination(params.destination, userId);

    if (geocoded.ok) {
      destinationLat = geocoded.data.lat;
      destinationLon = geocoded.data.lon;

      const [attractionsResult, weatherResult, image] = await Promise.all([
        getNearbyAttractions(destinationLat, destinationLon, userId),
        getCurrentWeather(destinationLat, destinationLon, userId),
        getDestinationImage(params.destination),
      ]);
      destinationImage = image;

      if (attractionsResult.ok) {
        nearbyAttractions = attractionsResult.data;

        // The generated itinerary is freeform text, not a structured stop list, so we use
        // the destination + its top nearby attractions as a proxy set of consecutive stops
        // for inter-stop routing.
        if (attractionsResult.data.length >= 1) {
          const points = [
            { lat: destinationLat, lon: destinationLon },
            ...attractionsResult.data.slice(0, 4).map((a) => ({ lat: a.lat, lon: a.lon })),
          ];
          const routeResult = await getRouteInfo(points, userId);
          if (routeResult.ok) routeInfo = routeResult.data;
        }
      }

      if (weatherResult.ok) weather = weatherResult.data;
    }
  }

  const response: TripPlanResponse = {
    itinerary: itineraryResult.data,
    nearbyAttractions,
    weather,
    routeInfo,
    destinationLat,
    destinationLon,
    destinationImage,
  };

  await upsertItineraryCache({
    promptHash,
    originalPrompt: parsed.data.prompt,
    normalizedPrompt: normalized,
    destination: params.destination,
    duration: params.duration,
    budget: params.budget,
    destinationLat,
    destinationLon,
    response,
    userId,
  });

  return { ...response, cached: false };
}
