"use server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { updateLoginStreak, checkAndAwardBadges } from "@/lib/gamification";
import { getXpProgress, getLevelData } from "@/lib/levels";
import { BADGE_DEFINITIONS } from "@/lib/badges";

export async function recordLogin() {
  const session = await auth();
  if (!session) return null;
  return updateLoginStreak(session.user.id);
}

export async function getMyStats() {
  const session = await auth();
  if (!session) return null;

  const [stats, userBadges, coinTxns, xpTxns] = await Promise.all([
    db.userStats.findUnique({ where: { userId: session.user.id } }),
    db.userBadge.findMany({
      where: { userId: session.user.id },
      include: { badge: true },
      orderBy: { earnedAt: "desc" },
    }),
    db.coinTransaction.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    db.xpTransaction.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  if (!stats) return null;

  const progress = getXpProgress(stats.totalXp);
  const levelData = getLevelData(stats.level);

  return { stats, userBadges, coinTxns, xpTxns, progress, levelData };
}

export async function getUserProfileData(usernameOrId: string) {
  const user = await db.user.findFirst({
    where: {
      OR: [
        { username: usernameOrId },
        { id: usernameOrId },
      ],
    },
    select: {
      id: true, name: true, username: true, image: true, bio: true, createdAt: true,
    },
  });
  if (!user) return null;

  const [stats, userBadges, approvedPlaces] = await Promise.all([
    db.userStats.findUnique({ where: { userId: user.id } }),
    db.userBadge.findMany({
      where: { userId: user.id },
      include: { badge: true },
      orderBy: { earnedAt: "desc" },
    }),
    db.place.findMany({
      where: { userId: user.id, status: "APPROVED" },
      select: { id: true, title: true, slug: true, featuredImage: true, city: true, state: true, averageRating: true },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
  ]);

  const progress = stats ? getXpProgress(stats.totalXp) : null;
  const levelData = stats ? getLevelData(stats.level) : getLevelData(1);

  const leaderboardRank = stats
    ? (await db.userStats.count({ where: { totalXp: { gt: stats.totalXp } } })) + 1
    : null;

  return { user, stats, userBadges, approvedPlaces, progress, levelData, leaderboardRank };
}

export async function triggerBadgeCheck() {
  const session = await auth();
  if (!session) return [];
  return checkAndAwardBadges(session.user.id);
}

export async function getAllBadgeDefinitions() {
  const [dbBadges, userBadges] = await Promise.all([
    db.badge.findMany({ orderBy: { type: "asc" } }),
    (async () => {
      const session = await auth();
      if (!session) return [];
      return db.userBadge.findMany({
        where: { userId: session.user.id },
        select: { badgeId: true, earnedAt: true },
      });
    })(),
  ]);
  return dbBadges.map((b) => ({
    ...b,
    earned: userBadges.some((ub) => ub.badgeId === b.id),
    earnedAt: userBadges.find((ub) => ub.badgeId === b.id)?.earnedAt ?? null,
  }));
}
