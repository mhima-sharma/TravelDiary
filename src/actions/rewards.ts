"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { RedemptionSchema } from "@/schemas";
import { deductCoins } from "@/lib/gamification";
import { notifyRewardRedeemed } from "@/lib/telegram";

// ─── User: submit redemption ──────────────────────────────────────────────────

export async function redeemReward(values: z.infer<typeof RedemptionSchema>) {
  const session = await auth();
  if (!session) return { error: "Not authenticated" };

  const parsed = RedemptionSchema.safeParse(values);
  if (!parsed.success) return { error: "Invalid input" };

  const { rewardId, ...delivery } = parsed.data;

  const [reward, stats] = await Promise.all([
    db.reward.findUnique({ where: { id: rewardId } }),
    db.userStats.findUnique({ where: { userId: session.user.id } }),
  ]);

  if (!reward || !reward.isActive) return { error: "Reward not available" };
  if (!stats || stats.coins < reward.coinCost) {
    return { error: `You need ${reward.coinCost} coins to redeem this reward` };
  }

  await deductCoins(session.user.id, reward.coinCost, "REDEMPTION", `Redeemed: ${reward.name}`, rewardId);

  const redemption = await db.rewardRedemption.create({
    data: {
      userId: session.user.id,
      rewardId,
      coinsSpent: reward.coinCost,
      ...delivery,
    },
  });

  revalidatePath("/dashboard/rewards");
  revalidatePath("/rewards");

  notifyRewardRedeemed(
    reward.name,
    reward.coinCost,
    session.user.name ?? "Unknown",
    session.user.email ?? "",
    delivery.city,
    delivery.state
  );

  return { success: "Reward redeemed! We'll process your request shortly.", redemptionId: redemption.id };
}

// ─── User: get my redemptions ─────────────────────────────────────────────────

export async function getMyRedemptions() {
  const session = await auth();
  if (!session) return [];

  return db.rewardRedemption.findMany({
    where: { userId: session.user.id },
    include: { reward: { select: { name: true, icon: true } } },
    orderBy: { createdAt: "desc" },
  });
}

// ─── Admin: list all redemptions ──────────────────────────────────────────────

export async function adminGetRedemptions(status?: string) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") return [];

  return db.rewardRedemption.findMany({
    where: status ? { status: status as any } : undefined,
    include: {
      user: { select: { name: true, email: true, image: true } },
      reward: { select: { name: true, icon: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

// ─── Admin: update status ─────────────────────────────────────────────────────

export async function adminUpdateRedemptionStatus(
  id: string,
  status: "APPROVED" | "SHIPPED" | "DELIVERED" | "REJECTED",
  trackingNumber?: string,
  adminNotes?: string
) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") return { error: "Unauthorized" };

  await db.rewardRedemption.update({
    where: { id },
    data: {
      status,
      ...(trackingNumber !== undefined && { trackingNumber }),
      ...(adminNotes !== undefined && { adminNotes }),
    },
  });

  revalidatePath("/admin/rewards");
  return { success: `Redemption marked as ${status}` };
}

// ─── Get available rewards ────────────────────────────────────────────────────

export async function getAvailableRewards() {
  const [rewards, session] = await Promise.all([
    db.reward.findMany({ where: { isActive: true } }),
    auth(),
  ]);

  if (!session) return rewards.map((r) => ({ ...r, canAfford: false, userCoins: 0 }));

  const stats = await db.userStats.findUnique({ where: { userId: session.user.id } });
  const coins = stats?.coins ?? 0;

  return rewards.map((r) => ({ ...r, canAfford: coins >= r.coinCost, userCoins: coins }));
}

// ─── Admin metrics ────────────────────────────────────────────────────────────

export async function getRewardMetrics() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") return null;

  const [total, pending, delivered, approved, shipped] = await Promise.all([
    db.rewardRedemption.count(),
    db.rewardRedemption.count({ where: { status: "PENDING" } }),
    db.rewardRedemption.count({ where: { status: "DELIVERED" } }),
    db.rewardRedemption.count({ where: { status: "APPROVED" } }),
    db.rewardRedemption.count({ where: { status: "SHIPPED" } }),
  ]);

  return { total, pending, delivered, approved, shipped };
}
