"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ReviewSchema } from "@/schemas";
import { awardXP, awardCoins, checkAndAwardBadges } from "@/lib/gamification";

async function recalcRating(placeId: string) {
  const result = await db.review.aggregate({
    where: { placeId },
    _avg: { rating: true },
  });
  await db.place.update({
    where: { id: placeId },
    data: { averageRating: result._avg.rating ?? 0 },
  });
}

export async function createReview(placeId: string, values: z.infer<typeof ReviewSchema>) {
  const session = await auth();
  if (!session) return { error: "Not authenticated" };

  const parsed = ReviewSchema.safeParse(values);
  if (!parsed.success) return { error: "Invalid input" };

  const existing = await db.review.findUnique({
    where: { userId_placeId: { userId: session.user.id, placeId } },
  });
  if (existing) return { error: "You already reviewed this place" };

  const { images = [], ...reviewData } = parsed.data;

  const review = await db.review.create({
    data: {
      ...reviewData,
      userId: session.user.id,
      placeId,
      images: images.length > 0
        ? { create: images.map((url) => ({ url })) }
        : undefined,
    },
  });

  await recalcRating(placeId);

  // Award XP/coins for writing a review (idempotent via rewardGiven flag)
  if (!review.rewardGiven) {
    await awardXP(session.user.id, 20, "REVIEW_APPROVED", "Review posted", review.id);
    await awardCoins(session.user.id, 20, "REVIEW_APPROVED", "Review posted", review.id);
    await db.review.update({ where: { id: review.id }, data: { rewardGiven: true } });
    await db.userStats.upsert({
      where: { userId: session.user.id },
      create: { userId: session.user.id, totalReviews: 1 },
      update: { totalReviews: { increment: 1 } },
    });
    await checkAndAwardBadges(session.user.id);
  }

  const place = await db.place.findUnique({ where: { id: placeId }, select: { slug: true } });
  if (place) revalidatePath(`/places/${place.slug}`);
  return { success: "Review posted!" };
}

export async function updateReview(reviewId: string, values: z.infer<typeof ReviewSchema>) {
  const session = await auth();
  if (!session) return { error: "Not authenticated" };

  const review = await db.review.findUnique({ where: { id: reviewId } });
  if (!review || review.userId !== session.user.id) return { error: "Not authorized" };

  const parsed = ReviewSchema.safeParse(values);
  if (!parsed.success) return { error: "Invalid input" };

  const { images = [], ...reviewData } = parsed.data;

  await db.review.update({
    where: { id: reviewId },
    data: {
      ...reviewData,
      images: {
        deleteMany: {},
        create: images.map((url) => ({ url })),
      },
    },
  });

  await recalcRating(review.placeId);

  const place = await db.place.findUnique({ where: { id: review.placeId }, select: { slug: true } });
  if (place) revalidatePath(`/places/${place.slug}`);
  return { success: "Review updated!" };
}

export async function deleteReview(reviewId: string) {
  const session = await auth();
  if (!session) return { error: "Not authenticated" };

  const review = await db.review.findUnique({ where: { id: reviewId } });
  if (!review) return { error: "Review not found" };
  if (review.userId !== session.user.id && session.user.role !== "ADMIN") {
    return { error: "Not authorized" };
  }

  await db.review.delete({ where: { id: reviewId } });
  await recalcRating(review.placeId);

  const place = await db.place.findUnique({ where: { id: review.placeId }, select: { slug: true } });
  if (place) revalidatePath(`/places/${place.slug}`);
  revalidatePath("/dashboard/reviews");
  return { success: "Review deleted" };
}
