import { db } from "./db";
import type { UserStats } from "@prisma/client";

export type BadgeDefinition = {
  slug: string;
  name: string;
  description: string;
  icon: string;
  type: "EXPLORER" | "COMMUNITY";
  rarity: "COMMON" | "RARE" | "EPIC" | "LEGENDARY";
};

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  { slug: "mountain-explorer",    name: "Mountain Explorer",    icon: "⛰️", type: "EXPLORER",  rarity: "RARE",      description: "Contributed 10 approved mountain destinations" },
  { slug: "temple-hunter",        name: "Temple Hunter",        icon: "🛕", type: "EXPLORER",  rarity: "RARE",      description: "Contributed 15 approved religious places" },
  { slug: "beach-lover",          name: "Beach Lover",          icon: "🏖️", type: "EXPLORER",  rarity: "COMMON",    description: "Contributed 10 beach destinations" },
  { slug: "waterfall-seeker",     name: "Waterfall Seeker",     icon: "💧", type: "EXPLORER",  rarity: "RARE",      description: "Contributed 10 waterfall destinations" },
  { slug: "adventure-master",     name: "Adventure Master",     icon: "🧗", type: "EXPLORER",  rarity: "EPIC",      description: "Contributed 20 adventure destinations" },
  { slug: "hidden-gem-discoverer",name: "Hidden Gem Discoverer",icon: "💎", type: "EXPLORER",  rarity: "EPIC",      description: "Contributed 5 hidden gem places" },
  { slug: "weekend-traveler",     name: "Weekend Traveler",     icon: "🗺️", type: "EXPLORER",  rarity: "RARE",      description: "Contributed 25 approved places" },
  { slug: "nature-enthusiast",    name: "Nature Enthusiast",    icon: "🌿", type: "EXPLORER",  rarity: "EPIC",      description: "Contributed 30 nature destinations" },
  { slug: "road-trip-expert",     name: "Road Trip Expert",     icon: "🚗", type: "EXPLORER",  rarity: "RARE",      description: "Contributed 20 road-trip destinations" },
  { slug: "first-contribution",   name: "First Contribution",   icon: "🌟", type: "COMMUNITY", rarity: "COMMON",    description: "Made your first approved contribution" },
  { slug: "rising-star",          name: "Rising Star",          icon: "⭐", type: "COMMUNITY", rarity: "RARE",      description: "Received 100 likes on reviews" },
  { slug: "top-contributor",      name: "Top Contributor",      icon: "🏆", type: "COMMUNITY", rarity: "LEGENDARY", description: "100 approved places contributed" },
  { slug: "community-hero",       name: "Community Hero",       icon: "🦸", type: "COMMUNITY", rarity: "LEGENDARY", description: "500 helpful contributions" },
  { slug: "photo-master",         name: "Photo Master",         icon: "📸", type: "COMMUNITY", rarity: "EPIC",      description: "100 approved photos uploaded" },
  { slug: "review-expert",        name: "Review Expert",        icon: "✍️", type: "COMMUNITY", rarity: "EPIC",      description: "100 approved reviews written" },
  { slug: "trusted-contributor",  name: "Trusted Contributor",  icon: "✅", type: "COMMUNITY", rarity: "LEGENDARY", description: "Maintained 95% approval rate" },
];

export const RARITY_COLORS: Record<string, string> = {
  COMMON:    "border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-800",
  RARE:      "border-blue-400 bg-blue-50 dark:border-blue-500 dark:bg-blue-950",
  EPIC:      "border-purple-400 bg-purple-50 dark:border-purple-500 dark:bg-purple-950",
  LEGENDARY: "border-yellow-400 bg-yellow-50 dark:border-yellow-500 dark:bg-yellow-950",
};

export const RARITY_TEXT: Record<string, string> = {
  COMMON:    "text-gray-600 dark:text-gray-400",
  RARE:      "text-blue-600 dark:text-blue-400",
  EPIC:      "text-purple-600 dark:text-purple-400",
  LEGENDARY: "text-yellow-600 dark:text-yellow-400",
};

async function countByCategory(userId: string, keywords: string[]): Promise<number> {
  const conds = keywords.flatMap((kw) => [
    { name: { contains: kw } },
    { slug: { contains: kw } },
  ]);
  return db.place.count({
    where: { userId, status: "APPROVED", category: { OR: conds } },
  });
}

export async function checkBadgeCondition(
  slug: string,
  userId: string,
  stats: UserStats
): Promise<boolean> {
  switch (slug) {
    case "first-contribution":   return stats.approvedPlaces >= 1;
    case "weekend-traveler":     return stats.approvedPlaces >= 25;
    case "top-contributor":      return stats.approvedPlaces >= 100;
    case "community-hero":       return stats.approvedPlaces + stats.totalReviews >= 500;
    case "photo-master":         return stats.totalPhotos >= 100;
    case "review-expert":        return stats.totalReviews >= 100;
    case "rising-star":          return stats.totalLikes >= 100;
    case "hidden-gem-discoverer":return stats.hiddenGems >= 5;

    case "trusted-contributor": {
      const [approved, rejected] = await Promise.all([
        db.place.count({ where: { userId, status: "APPROVED" } }),
        db.place.count({ where: { userId, status: "REJECTED" } }),
      ]);
      const total = approved + rejected;
      return total >= 10 && approved / total >= 0.95;
    }

    case "mountain-explorer":
      return (await countByCategory(userId, ["mountain", "hill", "peak", "hill-station"])) >= 10;
    case "temple-hunter":
      return (await countByCategory(userId, ["temple", "religious", "spiritual", "church", "mosque"])) >= 15;
    case "beach-lover":
      return (await countByCategory(userId, ["beach", "coastal", "coast"])) >= 10;
    case "waterfall-seeker":
      return (await countByCategory(userId, ["waterfall", "falls", "cascade"])) >= 10;
    case "adventure-master":
      return (await countByCategory(userId, ["adventure", "trekking", "hiking"])) >= 20;
    case "nature-enthusiast":
      return (await countByCategory(userId, ["nature", "forest", "wildlife", "botanical"])) >= 30;
    case "road-trip-expert":
      return (await countByCategory(userId, ["road", "highway", "drive", "scenic"])) >= 20;

    default:
      return false;
  }
}
