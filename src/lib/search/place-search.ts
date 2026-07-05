import { INDIA_STATE_NAMES, getStateAliases } from "@/lib/map/india-states";

const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

/** State names (with aliases) whose normalized spelling matches the query with all spacing/punctuation ignored — e.g. "uttarpradesh" -> "Uttar Pradesh". */
function findStatesMatchingNormalized(query: string): string[] {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) return [];
  return INDIA_STATE_NAMES.filter((name) =>
    getStateAliases(name).some((alias) => normalize(alias) === normalizedQuery)
  );
}

/**
 * Builds a Prisma `where` fragment for the free-text place search box.
 * Each word of the query must appear in title/city/state/country (so multi-word
 * queries like "kerala india" match across fields), plus a fallback that ignores
 * spacing entirely so "uttarpradesh" still finds "Uttar Pradesh".
 */
export function buildPlaceSearchWhere(q: string): Record<string, unknown> | null {
  const trimmed = q.trim();
  if (!trimmed) return null;

  const words = trimmed.split(/\s+/).filter(Boolean);
  const wordMatch = {
    AND: words.map((word) => ({
      OR: [
        { title: { contains: word } },
        { city: { contains: word } },
        { state: { contains: word } },
        { country: { contains: word } },
      ],
    })),
  };

  const matchedStates = findStatesMatchingNormalized(trimmed);
  if (matchedStates.length === 0) return wordMatch;

  return {
    OR: [wordMatch, { state: { in: matchedStates.flatMap(getStateAliases) } }],
  };
}
