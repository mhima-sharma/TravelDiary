"use server";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { CategorySchema } from "@/schemas";
import { z } from "zod";
import { PlaceStatus } from "@prisma/client";
import {
  awardPlaceApproval,
  awardFeaturedPlace,
  awardHiddenGem,
  awardReviewApproval,
} from "@/lib/gamification";

async function requireAdmin() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") throw new Error("Unauthorized");
  return session;
}

export async function banUser(userId: string) {
  await requireAdmin();
  await db.user.update({ where: { id: userId }, data: { isBanned: true } });
  revalidatePath("/admin/users");
  return { success: "User banned" };
}

export async function unbanUser(userId: string) {
  await requireAdmin();
  await db.user.update({ where: { id: userId }, data: { isBanned: false } });
  revalidatePath("/admin/users");
  return { success: "User unbanned" };
}

export async function createCategory(values: z.infer<typeof CategorySchema>) {
  await requireAdmin();
  const parsed = CategorySchema.safeParse(values);
  if (!parsed.success) return { error: "Invalid input" };

  const existing = await db.category.findUnique({ where: { slug: parsed.data.slug } });
  if (existing) return { error: "Category slug already exists" };

  await db.category.create({ data: parsed.data });
  revalidatePath("/admin/categories");
  revalidatePath("/categories");
  return { success: "Category created" };
}

export async function deleteCategory(id: string) {
  await requireAdmin();
  await db.category.delete({ where: { id } });
  revalidatePath("/admin/categories");
  return { success: "Category deleted" };
}

export async function resolveReport(id: string) {
  await requireAdmin();
  await db.report.update({ where: { id }, data: { resolved: true } });
  revalidatePath("/admin/reports");
  return { success: "Report resolved" };
}

export async function deleteReport(id: string) {
  await requireAdmin();
  await db.report.delete({ where: { id } });
  revalidatePath("/admin/reports");
  return { success: "Report deleted" };
}

export async function adminDeleteReview(id: string) {
  await requireAdmin();
  const review = await db.review.findUnique({ where: { id }, select: { placeId: true } });
  if (!review) return { error: "Not found" };
  await db.review.delete({ where: { id } });
  const result = await db.review.aggregate({ where: { placeId: review.placeId }, _avg: { rating: true } });
  await db.place.update({ where: { id: review.placeId }, data: { averageRating: result._avg.rating ?? 0 } });
  revalidatePath("/admin/reviews");
  return { success: "Review deleted" };
}

// ─── Gamification admin actions ───────────────────────────────────────────────

export async function adminApprovePlace(id: string) {
  await requireAdmin();

  await db.place.update({ where: { id }, data: { status: PlaceStatus.APPROVED } });

  // Award XP/coins to place owner
  const result = await awardPlaceApproval(id);

  revalidatePath("/admin/places");
  revalidatePath("/explore");
  return {
    success: "Place approved",
    reward: result.xpGained > 0
      ? `+${result.xpGained} XP, +${result.coinsGained} Coins awarded${result.newBadges.length ? ` · Badges: ${result.newBadges.join(", ")}` : ""}${result.leveledUp ? ` · Level up!` : ""}`
      : null,
  };
}

export async function adminRejectPlace(id: string) {
  await requireAdmin();
  await db.place.update({ where: { id }, data: { status: PlaceStatus.REJECTED } });
  revalidatePath("/admin/places");
  return { success: "Place rejected" };
}

export async function adminFeaturePlace(id: string) {
  await requireAdmin();
  const result = await awardFeaturedPlace(id);
  revalidatePath("/admin/places");
  revalidatePath("/explore");
  return { success: "Place featured", reward: result.xpGained > 0 ? `+${result.xpGained} XP, +${result.coinsGained} Coins` : null };
}

export async function adminMarkHiddenGem(id: string) {
  await requireAdmin();
  const result = await awardHiddenGem(id);
  revalidatePath("/admin/places");
  revalidatePath("/explore");
  return { success: "Marked as Hidden Gem", reward: result.xpGained > 0 ? `+${result.xpGained} XP, +${result.coinsGained} Coins` : null };
}

export async function adminApproveReview(id: string) {
  await requireAdmin();
  const result = await awardReviewApproval(id);
  revalidatePath("/admin/reviews");
  return {
    success: "Review approved",
    reward: result.xpGained > 0 ? `+${result.xpGained} XP, +${result.coinsGained} Coins` : null,
  };
}
