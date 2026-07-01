/**
 * Ranks plain-string options for a searchable dropdown: prefix matches first, then
 * substring matches, capped at `limit` so huge lists (1000+ cities) never fully mount.
 */
export function rankOptions(options: string[], query: string, limit = 150): string[] {
  const q = query.trim().toLowerCase();
  if (!q) return options.slice(0, limit);

  const starts: string[] = [];
  const includes: string[] = [];
  for (const option of options) {
    const lower = option.toLowerCase();
    if (lower.startsWith(q)) starts.push(option);
    else if (lower.includes(q)) includes.push(option);
    if (starts.length >= limit) break;
  }

  return [...starts, ...includes].slice(0, limit);
}
