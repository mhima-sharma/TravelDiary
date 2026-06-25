"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") throw new Error("Unauthorized");
}

export async function createAd(data: {
  title: string;
  description?: string;
  image?: string;
  linkUrl?: string;
  linkText?: string;
  isActive: boolean;
}) {
  await requireAdmin();
  await db.advertisement.create({ data });
  revalidatePath("/explore");
  revalidatePath("/admin/ads");
  return { success: true };
}

export async function updateAd(
  id: string,
  data: {
    title: string;
    description?: string;
    image?: string;
    linkUrl?: string;
    linkText?: string;
    isActive: boolean;
  }
) {
  await requireAdmin();
  await db.advertisement.update({ where: { id }, data });
  revalidatePath("/explore");
  revalidatePath("/admin/ads");
  return { success: true };
}

export async function deleteAd(id: string) {
  await requireAdmin();
  await db.advertisement.delete({ where: { id } });
  revalidatePath("/explore");
  revalidatePath("/admin/ads");
  return { success: true };
}

export async function toggleAdStatus(id: string) {
  await requireAdmin();
  const ad = await db.advertisement.findUnique({ where: { id } });
  if (!ad) return { error: "Not found" };
  await db.advertisement.update({ where: { id }, data: { isActive: !ad.isActive } });
  revalidatePath("/explore");
  revalidatePath("/admin/ads");
  return { success: true };
}
