/**
 * Module-level cache shared by every mounted hook instance for the life of the page.
 * Dedupes concurrent requests for the same key and avoids refetching on remount.
 */
const cache = new Map<string, Promise<string[]>>();

export function getCachedOptions(key: string, fetcher: () => Promise<string[]>): Promise<string[]> {
  const existing = cache.get(key);
  if (existing) return existing;

  const promise = fetcher().catch((err) => {
    cache.delete(key);
    throw err;
  });
  cache.set(key, promise);
  return promise;
}
