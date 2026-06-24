export type Level = {
  level: number;
  name: string;
  minXp: number;
  maxXp: number;
  color: string;
  bgColor: string;
  emoji: string;
};

export const LEVELS: Level[] = [
  { level: 1, name: "Newcomer",    minXp: 0,     maxXp: 499,      color: "#6b7280", bgColor: "bg-gray-100 dark:bg-gray-800",   emoji: "🌱" },
  { level: 2, name: "Explorer",    minXp: 500,   maxXp: 1499,     color: "#22c55e", bgColor: "bg-green-100 dark:bg-green-900",  emoji: "🧭" },
  { level: 3, name: "Adventurer",  minXp: 1500,  maxXp: 2999,     color: "#3b82f6", bgColor: "bg-blue-100 dark:bg-blue-900",    emoji: "⛺" },
  { level: 4, name: "Trailblazer", minXp: 3000,  maxXp: 5999,     color: "#a855f7", bgColor: "bg-purple-100 dark:bg-purple-900",emoji: "🗺️" },
  { level: 5, name: "Pioneer",     minXp: 6000,  maxXp: 9999,     color: "#f97316", bgColor: "bg-orange-100 dark:bg-orange-900",emoji: "🏔️" },
  { level: 6, name: "Legend",      minXp: 10000, maxXp: Infinity, color: "#eab308", bgColor: "bg-yellow-100 dark:bg-yellow-900",emoji: "👑" },
];

export function getLevelForXp(xp: number): number {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].minXp) return LEVELS[i].level;
  }
  return 1;
}

export function getLevelData(levelNum: number): Level {
  return LEVELS.find((l) => l.level === levelNum) ?? LEVELS[0];
}

export function getCurrentLevel(xp: number): Level {
  return getLevelData(getLevelForXp(xp));
}

export function getNextLevel(xp: number): Level | null {
  const current = getLevelForXp(xp);
  return LEVELS.find((l) => l.level === current + 1) ?? null;
}

export function getXpProgress(xp: number): {
  currentXp: number;
  xpInLevel: number;
  xpNeeded: number;
  percentage: number;
} {
  const current = getCurrentLevel(xp);
  const next = getNextLevel(xp);

  if (!next) return { currentXp: xp, xpInLevel: xp - current.minXp, xpNeeded: 0, percentage: 100 };

  const xpInLevel = xp - current.minXp;
  const xpNeeded = next.minXp - current.minXp;
  const percentage = Math.min(100, Math.floor((xpInLevel / xpNeeded) * 100));

  return { currentXp: xp, xpInLevel, xpNeeded, percentage };
}
