const SUMMARY_URL = "https://en.wikipedia.org/api/rest_v1/page/summary";
const TIMEOUT_MS = 5000;

interface WikipediaSummary {
  thumbnail?: { source: string };
  originalimage?: { source: string };
}

/**
 * Best-effort destination photo lookup. Free, keyless, and not routed through the
 * admin-managed ApiService quota/health system since it isn't a paid or rate-limited
 * dependency - failures here should never affect the trip planner's own availability.
 */
export async function getDestinationImage(destination: string): Promise<string | null> {
  const title = destination.split(",")[0].trim();
  if (!title) return null;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(`${SUMMARY_URL}/${encodeURIComponent(title)}`, { signal: controller.signal });
    if (!res.ok) return null;

    const json: WikipediaSummary = await res.json();
    return json.thumbnail?.source ?? json.originalimage?.source ?? null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
