"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { PlaceSchema } from "@/schemas";
import { PlaceStatus } from "@prisma/client";
import { clawbackPlaceRewards } from "@/lib/gamification";
import { notifyNewPlace, notifyPlaceUpdated, notifyNewReport } from "@/lib/telegram";

export async function createPlace(values: z.infer<typeof PlaceSchema>, imageUrls: string[]) {
  const session = await auth();
  if (!session) return { error: "Not authenticated" };

  const parsed = PlaceSchema.safeParse(values);
  if (!parsed.success) return { error: "Invalid input" };

  const existing = await db.place.findUnique({ where: { slug: parsed.data.slug } });
  if (existing) return { error: "A place with this slug already exists" };

  const place = await db.place.create({
    data: {
      ...parsed.data,
      userId: session.user.id,
      status: PlaceStatus.PENDING,
      images: {
        create: imageUrls.map((url, i) => ({ url, order: i })),
      },
    },
  });

  revalidatePath("/dashboard/my-places");

  notifyNewPlace(parsed.data.title, session.user.name ?? session.user.email ?? "Unknown");

  return { success: "Place submitted for review!", place };
}

export async function updatePlace(id: string, values: z.infer<typeof PlaceSchema>, imageUrls: string[]) {
  const session = await auth();
  if (!session) return { error: "Not authenticated" };

  const place = await db.place.findUnique({ where: { id } });
  if (!place) return { error: "Place not found" };
  if (place.userId !== session.user.id && session.user.role !== "ADMIN") {
    return { error: "Not authorized" };
  }

  const parsed = PlaceSchema.safeParse(values);
  if (!parsed.success) return { error: "Invalid input" };

  await db.place.update({
    where: { id },
    data: {
      ...parsed.data,
      status: session.user.role === "ADMIN" ? place.status : PlaceStatus.PENDING,
    },
  });

  if (imageUrls.length > 0) {
    await db.placeImage.deleteMany({ where: { placeId: id } });
    await db.placeImage.createMany({
      data: imageUrls.map((url, i) => ({ url, placeId: id, order: i })),
    });
  }

  revalidatePath(`/places/${place.slug}`);
  revalidatePath("/dashboard/my-places");

  if (session.user.role !== "ADMIN") {
    notifyPlaceUpdated(parsed.data.title, session.user.name ?? session.user.email ?? "Unknown");
  }

  return { success: "Place updated!" };
}

export async function deletePlace(id: string) {
  const session = await auth();
  if (!session) return { error: "Not authenticated" };

  const place = await db.place.findUnique({ where: { id } });
  if (!place) return { error: "Place not found" };
  if (place.userId !== session.user.id && session.user.role !== "ADMIN") {
    return { error: "Not authorized" };
  }

  // Clawback rewards if this was an approved place
  if (place.status === PlaceStatus.APPROVED && place.rewardGiven) {
    await clawbackPlaceRewards(id);
  }

  await db.place.delete({ where: { id } });
  revalidatePath("/dashboard/my-places");
  revalidatePath("/explore");
  return { success: "Place deleted" };
}

export async function approvePlace(id: string) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") return { error: "Not authorized" };

  await db.place.update({ where: { id }, data: { status: PlaceStatus.APPROVED } });
  revalidatePath("/admin/places");
  revalidatePath("/explore");
  return { success: "Place approved" };
}

export async function rejectPlace(id: string) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") return { error: "Not authorized" };

  await db.place.update({ where: { id }, data: { status: PlaceStatus.REJECTED } });
  revalidatePath("/admin/places");
  return { success: "Place rejected" };
}

export async function incrementViews(id: string) {
  await db.place.update({ where: { id }, data: { views: { increment: 1 } } });
}

export async function submitReport(placeId: string, reason: string, details?: string) {
  const session = await auth();
  if (!session) return { error: "Not authenticated" };

  const validReasons = ["SPAM", "INAPPROPRIATE", "INCORRECT_INFO", "DUPLICATE", "OTHER"];
  if (!validReasons.includes(reason)) return { error: "Invalid reason" };

  const existing = await db.report.findFirst({
    where: { placeId, userId: session.user.id, resolved: false },
  });
  if (existing) return { error: "You have already reported this place" };

  const place = await db.place.findUnique({ where: { id: placeId }, select: { title: true } });

  const sanitizedDetails = details
    ? details.trim().slice(0, 1000).replace(/[<>]/g, "")
    : null;

  await db.report.create({
    data: {
      placeId,
      userId: session.user.id,
      reason: reason as "SPAM" | "INAPPROPRIATE" | "INCORRECT_INFO" | "DUPLICATE" | "OTHER",
      details: sanitizedDetails,
    },
  });

  notifyNewReport(
    place?.title ?? placeId,
    reason,
    session.user.name ?? session.user.email ?? "Unknown"
  );

  return { success: "Report submitted. Thank you for helping keep the community safe." };
}
