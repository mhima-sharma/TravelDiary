import { createHash } from "crypto";

export function normalizePrompt(raw: string): string {
  return raw.trim().replace(/\s+/g, " ").toLowerCase();
}

export interface TripParams {
  destination: string | null;
  duration: number | null;
  budget: number | null;
}

// Slightly more permissive than a bare textbook regex so differently-worded
// prompts for the same trip ("under 10000" / "under ₹10,000" / "with a
// budget of 10000", "3 day" / "3-day") still extract identical params and
// collide on the same cache key.
const DESTINATION_RE = /\b(?:near|to|in)\s+([a-z][a-z\s]*?)(?=\s*(?:under|budget|with|₹|rs\.?|,|\.|$))/;
const DURATION_RE = /(\d+)[\s-]*days?/;
const BUDGET_RE = /(?:under|budget(?:\s+of)?|₹|rs\.?)\s*([\d,]+)/;

export function extractTripParams(normalized: string): TripParams {
  const destinationMatch = normalized.match(DESTINATION_RE);
  const durationMatch = normalized.match(DURATION_RE);
  const budgetMatch = normalized.match(BUDGET_RE);

  return {
    destination: destinationMatch ? destinationMatch[1].trim() : null,
    duration: durationMatch ? parseInt(durationMatch[1], 10) : null,
    budget: budgetMatch ? parseInt(budgetMatch[1].replace(/,/g, ""), 10) : null,
  };
}

export interface CacheKeyResult {
  cacheKey: string;
  promptHash: string;
  params: TripParams;
}

/** Cache key is the structured `destination|duration|budget` triple when all three are extractable, else falls back to exact-match on the normalized prompt. */
export function buildCacheKey(normalized: string): CacheKeyResult {
  const params = extractTripParams(normalized);
  const cacheKey =
    params.destination !== null && params.duration !== null && params.budget !== null
      ? `${params.destination}|${params.duration}|${params.budget}`
      : normalized;

  const promptHash = createHash("sha256").update(cacheKey).digest("hex");
  return { cacheKey, promptHash, params };
}
