import { db } from "./db";
import { getLevelForXp } from "./levels";
import { checkBadgeCondition } from "./badges";
import type { UserStats } from "@prisma/client";

export type AwardResult = {
  xpGained: number;
  coinsGained: number;
  leveledUp: boolean;
  newLevel: number;
  newBadges: string[];
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function ensureStats(userId: string): Promise<UserStats> {
  const existing = await db.userStats.findUnique({ where: { userId } });
  if (existing) return existing;
  return db.userStats.create({ data: { userId } });
}

async function withinDailyLimit(userId: string): Promise<boolean> {
  const today = new Date().toISOString().slice(0, 10);
  const rec = await db.dailyRewardCount.findUnique({
    where: { userId_date: { userId, date: today } },
  });
  return !rec || rec.count < 5;
}

async function incrementDailyCount(userId: string) {
  const today = new Date().toISOString().slice(0, 10);
  await db.dailyRewardCount.upsert({
    where: { userId_date: { userId, date: today } },
    create: { userId, date: today, count: 1 },
    update: { count: { increment: 1 } },
  });
}

// ─── Core award functions ─────────────────────────────────────────────────────

export async function awardXP(
  userId: string,
  amount: number,
  type: string,
  description: string,
  referenceId?: string
): Promise<{ leveledUp: boolean; newLevel: number; stats: UserStats }> {
  const stats = await ensureStats(userId);
  const newTotalXp = stats.totalXp + amount;
  const newLevel = getLevelForXp(newTotalXp);
  const leveledUp = newLevel > stats.level;

  await db.userStats.update({
    where: { userId },
    data: { xp: { increment: amount }, totalXp: newTotalXp, level: newLevel },
  });
  await db.xpTransaction.create({ data: { userId, amount, type, description, referenceId } });

  return { leveledUp, newLevel, stats };
}

export async function awardCoins(
  userId: string,
  amount: number,
  type: string,
  description: string,
  referenceId?: string,
  existingStats?: UserStats
) {
  if (!existingStats) await ensureStats(userId);
  await db.userStats.update({ where: { userId }, data: { coins: { increment: amount } } });
  await db.coinTransaction.create({ data: { userId, amount, type, description, referenceId } });
}

export async function deductCoins(
  userId: string,
  amount: number,
  type: string,
  description: string,
  referenceId?: string
) {
  const stats = await ensureStats(userId);
  const newCoins = Math.max(0, stats.coins - amount);
  await db.userStats.update({ where: { userId }, data: { coins: newCoins } });
  await db.coinTransaction.create({ data: { userId, amount: -amount, type, description, referenceId } });
}

export async function deductXP(
  userId: string,
  amount: number,
  type: string,
  description: string,
  referenceId?: string
) {
  const stats = await ensureStats(userId);
  const deduct = Math.min(stats.xp, amount);
  if (deduct <= 0) return;
  const newTotalXp = Math.max(0, stats.totalXp - deduct);
  await db.userStats.update({
    where: { userId },
    data: { xp: { decrement: deduct }, totalXp: newTotalXp, level: getLevelForXp(newTotalXp) },
  });
  await db.xpTransaction.create({ data: { userId, amount: -deduct, type, description, referenceId } });
}

// ─── Badge checking ───────────────────────────────────────────────────────────

export async function checkAndAwardBadges(userId: string): Promise<string[]> {
  const [stats, badges, userBadges] = await Promise.all([
    db.userStats.findUnique({ where: { userId } }),
    db.badge.findMany(),
    db.userBadge.findMany({ where: { userId }, include: { badge: { select: { slug: true } } } }),
  ]);
  if (!stats) return [];

  const earned = new Set(userBadges.map((ub) => ub.badge.slug));
  const unearned = badges.filter((b) => !earned.has(b.slug));

  // Check all unearned badges in parallel instead of a serial await-in-loop
  const results = await Promise.all(
    unearned.map(async (badge) => ({
      badge,
      passed: await checkBadgeCondition(badge.slug, userId, stats),
    }))
  );

  const newlyEarned: string[] = [];
  for (const { badge, passed } of results) {
    if (!passed) continue;
    await db.userBadge.create({ data: { userId, badgeId: badge.id } });
    newlyEarned.push(badge.name);
  }

  return newlyEarned;
}

// ─── Place approval reward ────────────────────────────────────────────────────

export async function awardPlaceApproval(placeId: string): Promise<AwardResult> {
  const zero: AwardResult = { xpGained: 0, coinsGained: 0, leveledUp: false, newLevel: 1, newBadges: [] };

  const place = await db.place.findUnique({ where: { id: placeId } });
  if (!place || place.rewardGiven) return zero;

  const { userId } = place;
  if (!(await withinDailyLimit(userId))) return zero;

  const stats = await ensureStats(userId);
  const isFirst = stats.approvedPlaces === 0;

  const xp = isFirst ? 150 : 100;
  const coins = isFirst ? 150 : 100;

  const desc = isFirst ? "Place approved + First contribution bonus!" : "Place approved";
  const { leveledUp, newLevel, stats: awardedStats } = await awardXP(userId, xp, "PLACE_APPROVED", desc, placeId);
  await awardCoins(userId, coins, "PLACE_APPROVED", desc, placeId, awardedStats);

  await db.userStats.update({ where: { userId }, data: { approvedPlaces: { increment: 1 } } });
  await db.place.update({ where: { id: placeId }, data: { rewardGiven: true } });
  await incrementDailyCount(userId);

  const newBadges = await checkAndAwardBadges(userId);
  return { xpGained: xp, coinsGained: coins, leveledUp, newLevel, newBadges };
}

// ─── Place deletion clawback ──────────────────────────────────────────────────

export async function clawbackPlaceRewards(placeId: string) {
  const place = await db.place.findUnique({ where: { id: placeId } });
  if (!place || !place.rewardGiven) return;

  const { userId } = place;
  await deductCoins(userId, 100, "PLACE_DELETED", "Place deleted", placeId);
  await deductXP(userId, 100, "PLACE_DELETED", "Place deleted", placeId);

  if (place.status === "APPROVED") {
    const stats = await db.userStats.findUnique({ where: { userId } });
    if (stats && stats.approvedPlaces > 0) {
      await db.userStats.update({ where: { userId }, data: { approvedPlaces: { decrement: 1 } } });
    }
  }
}

// ─── Featured & Hidden Gem ────────────────────────────────────────────────────

export async function awardFeaturedPlace(placeId: string): Promise<AwardResult> {
  const zero: AwardResult = { xpGained: 0, coinsGained: 0, leveledUp: false, newLevel: 1, newBadges: [] };
  const place = await db.place.findUnique({ where: { id: placeId } });
  if (!place || place.isFeatured) return zero;

  const { leveledUp, newLevel, stats: featuredStats } = await awardXP(place.userId, 50, "PLACE_FEATURED", "Place featured", placeId);
  await awardCoins(place.userId, 50, "PLACE_FEATURED", "Place featured", placeId, featuredStats);
  await db.place.update({ where: { id: placeId }, data: { isFeatured: true } });

  const newBadges = await checkAndAwardBadges(place.userId);
  return { xpGained: 50, coinsGained: 50, leveledUp, newLevel, newBadges };
}

export async function awardHiddenGem(placeId: string): Promise<AwardResult> {
  const zero: AwardResult = { xpGained: 0, coinsGained: 0, leveledUp: false, newLevel: 1, newBadges: [] };
  const place = await db.place.findUnique({ where: { id: placeId } });
  if (!place || place.isHiddenGem) return zero;

  const { leveledUp, newLevel, stats: gemStats } = await awardXP(place.userId, 100, "HIDDEN_GEM", "Hidden gem selected", placeId);
  await awardCoins(place.userId, 100, "HIDDEN_GEM", "Hidden gem selected", placeId, gemStats);
  await db.userStats.update({ where: { userId: place.userId }, data: { hiddenGems: { increment: 1 } } });
  await db.place.update({ where: { id: placeId }, data: { isHiddenGem: true } });

  const newBadges = await checkAndAwardBadges(place.userId);
  return { xpGained: 100, coinsGained: 100, leveledUp, newLevel, newBadges };
}

// ─── Review reward ────────────────────────────────────────────────────────────

export async function awardReviewApproval(reviewId: string): Promise<AwardResult> {
  const zero: AwardResult = { xpGained: 0, coinsGained: 0, leveledUp: false, newLevel: 1, newBadges: [] };
  const review = await db.review.findUnique({ where: { id: reviewId } });
  if (!review || review.rewardGiven) return zero;

  const { leveledUp, newLevel, stats: reviewStats } = await awardXP(review.userId, 20, "REVIEW_APPROVED", "Review approved", reviewId);
  await awardCoins(review.userId, 20, "REVIEW_APPROVED", "Review approved", reviewId, reviewStats);
  await db.review.update({ where: { id: reviewId }, data: { rewardGiven: true } });
  await db.userStats.update({ where: { userId: review.userId }, data: { totalReviews: { increment: 1 } } });

  const newBadges = await checkAndAwardBadges(review.userId);
  return { xpGained: 20, coinsGained: 20, leveledUp, newLevel, newBadges };
}

// ─── Login streak ─────────────────────────────────────────────────────────────

export async function updateLoginStreak(userId: string): Promise<{ coins: number; streakDays: number }> {
  const stats = await ensureStats(userId);
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const yesterday = new Date(now.getTime() - 86_400_000).toISOString().slice(0, 10);
  const lastLogin = stats.lastLoginDate?.toISOString().slice(0, 10);

  if (lastLogin === today) return { coins: 0, streakDays: stats.streak };

  const newStreak = lastLogin === yesterday ? stats.streak + 1 : 1;
  const coins = newStreak >= 30 ? 100 : newStreak >= 7 ? 25 : 5;

  await db.userStats.update({
    where: { userId },
    data: { streak: newStreak, longestStreak: Math.max(stats.longestStreak, newStreak), lastLoginDate: now },
  });
  await awardCoins(userId, coins, "DAILY_STREAK", `Day ${newStreak} login streak`);

  return { coins, streakDays: newStreak };
}

// ─── Leaderboard queries ──────────────────────────────────────────────────────

export async function getLeaderboard(period: "week" | "month" | "all", limit = 50) {
  if (period === "all") {
    const stats = await db.userStats.findMany({
      orderBy: { totalXp: "desc" },
      take: limit,
      include: {
        user: { select: { id: true, name: true, image: true, username: true } },
      },
    });
    // Single grouped query instead of N individual count queries
    const badgeGroups = await db.userBadge.groupBy({
      by: ["userId"],
      where: { userId: { in: stats.map((s) => s.userId) } },
      _count: { _all: true },
    });
    const badgeCountMap = new Map(badgeGroups.map((b) => [b.userId, b._count._all]));
    return stats.map((s, i) => ({ ...s, badgeCount: badgeCountMap.get(s.userId) ?? 0, rank: i + 1 }));
  }

  const since = new Date();
  if (period === "week") since.setDate(since.getDate() - 7);
  else since.setDate(since.getDate() - 30);

  const grouped = await db.xpTransaction.groupBy({
    by: ["userId"],
    where: { createdAt: { gte: since } },
    _sum: { amount: true },
    orderBy: { _sum: { amount: "desc" } },
    take: limit,
  });

  if (!grouped.length) return [];

  const userIds = grouped.map((g) => g.userId);
  const [users, allStats] = await Promise.all([
    db.user.findMany({ where: { id: { in: userIds } }, select: { id: true, name: true, image: true, username: true } }),
    db.userStats.findMany({ where: { userId: { in: userIds } } }),
  ]);
  // Single grouped query instead of N individual count queries
  const badgeGroups = await db.userBadge.groupBy({
    by: ["userId"],
    where: { userId: { in: userIds } },
    _count: { _all: true },
  });
  const badgeCountMap = new Map(badgeGroups.map((b) => [b.userId, b._count._all]));

  return grouped.map((g, i) => {
    const user = users.find((u) => u.id === g.userId);
    const stats = allStats.find((s) => s.userId === g.userId);
    return {
      rank: i + 1,
      userId: g.userId,
      user,
      totalXp: g._sum.amount ?? 0,
      coins: stats?.coins ?? 0,
      level: stats?.level ?? 1,
      badgeCount: badgeCountMap.get(g.userId) ?? 0,
    };
  });
}
