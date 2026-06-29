// Simple sliding-window rate limiter — works in Edge runtime (no Redis required).
// Resets on cold start but still blocks rapid burst attacks within a warm instance.

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitRecord>();

// Prune stale entries every 500 calls to avoid unbounded growth
let pruneCounter = 0;
function maybePrune() {
  if (++pruneCounter < 500) return;
  pruneCounter = 0;
  const now = Date.now();
  for (const [key, rec] of store) {
    if (now > rec.resetAt) store.delete(key);
  }
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  maybePrune();
  const now = Date.now();
  const rec = store.get(key);

  if (!rec || now > rec.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, resetAt: now + windowMs };
  }

  if (rec.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: rec.resetAt };
  }

  rec.count++;
  return { allowed: true, remaining: limit - rec.count, resetAt: rec.resetAt };
}
