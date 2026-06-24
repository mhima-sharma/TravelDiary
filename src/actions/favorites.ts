"use server";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function toggleFavorite(placeId: string) {
  const session = await auth();
  if (!session) return { error: "Not authenticated" };

  const existing = await db.favorite.findUnique({
    where: { userId_placeId: { userId: session.user.id, placeId } },
  });

  if (existing) {
    await db.favorite.delete({ where: { id: existing.id } });
    revalidatePath("/dashboard/favorites");
    return { saved: false };
  }

  await db.favorite.create({ data: { userId: session.user.id, placeId } });
  revalidatePath("/dashboard/favorites");
  return { saved: true };
}

export async function getFavoriteStatus(placeId: string) {
  const session = await auth();
  if (!session) return { saved: false };

  const fav = await db.favorite.findUnique({
    where: { userId_placeId: { userId: session.user.id, placeId } },
  });
  return { saved: !!fav };
}
