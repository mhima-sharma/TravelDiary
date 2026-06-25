"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { VisitStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function toggleVisitStatus(placeId: string, status: VisitStatus) {
  const session = await auth();
  if (!session) return { error: "Not authenticated" };

  const existing = await db.placeVisit.findUnique({
    where: { userId_placeId: { userId: session.user.id, placeId } },
  });

  if (existing?.status === status) {
    // clicking same status removes it
    await db.placeVisit.delete({ where: { id: existing.id } });
    revalidatePath("/profile");
    return { success: null };
  }

  await db.placeVisit.upsert({
    where: { userId_placeId: { userId: session.user.id, placeId } },
    create: { userId: session.user.id, placeId, status },
    update: { status },
  });

  revalidatePath("/profile");
  return { success: status };
}

export async function getUserVisitStatus(placeId: string) {
  const session = await auth();
  if (!session) return null;

  const visit = await db.placeVisit.findUnique({
    where: { userId_placeId: { userId: session.user.id, placeId } },
  });
  return visit?.status ?? null;
}

export async function getUserVisitStats(username: string) {
  const user = await db.user.findUnique({ where: { username } });
  if (!user) return null;

  const visits = await db.placeVisit.findMany({
    where: { userId: user.id },
    include: { place: { select: { city: true, state: true, country: true } } },
  });

  const visited = visits.filter(
    (v) => v.status === VisitStatus.VISITED || v.status === VisitStatus.VISITED_AGAIN
  );

  const placesVisited = visited.length;
  const countriesExplored = new Set(visited.map((v) => v.place.country)).size;
  const statesExplored = new Set(visited.map((v) => `${v.place.state}|${v.place.country}`)).size;
  const wantToVisitCount = visits.filter((v) => v.status === VisitStatus.WANT_TO_VISIT).length;

  return { placesVisited, countriesExplored, statesExplored, wantToVisitCount };
}

export async function getUserBucketList(username: string) {
  const user = await db.user.findUnique({ where: { username } });
  if (!user) return [];

  const visits = await db.placeVisit.findMany({
    where: { userId: user.id, status: VisitStatus.WANT_TO_VISIT },
    include: {
      place: {
        select: {
          id: true, title: true, slug: true, featuredImage: true,
          city: true, state: true, country: true, averageRating: true,
          category: { select: { name: true, slug: true } },
          _count: { select: { reviews: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return visits.map((v) => v.place);
}
