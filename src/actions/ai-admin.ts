"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { AiSettingsSchema, ApiServiceSchema } from "@/schemas";
import { ApiServiceKey } from "@prisma/client";
import { runHealthCheck } from "@/lib/ai/health-check";

async function requireAdmin() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") throw new Error("Unauthorized");
}

export async function updateAiSettings(data: unknown) {
  await requireAdmin();
  const parsed = AiSettingsSchema.safeParse(data);
  if (!parsed.success) return { error: "Invalid input" };

  await db.aiSettings.upsert({
    where: { id: "global" },
    update: parsed.data,
    create: { id: "global", ...parsed.data },
  });

  revalidatePath("/admin/ai-services");
  revalidatePath("/trip-planner");
  return { success: true };
}

export async function updateApiService(key: ApiServiceKey, data: unknown) {
  await requireAdmin();
  const parsed = ApiServiceSchema.safeParse(data);
  if (!parsed.success) return { error: "Invalid input" };

  await db.apiService.update({ where: { key }, data: parsed.data });
  revalidatePath("/admin/ai-services");
  return { success: true };
}

export async function reenableApiService(key: ApiServiceKey) {
  await requireAdmin();
  await db.apiService.update({
    where: { key },
    data: { autoDisabled: false, autoDisabledCause: null, autoDisabledReason: null, consecutiveFailures: 0 },
  });
  revalidatePath("/admin/ai-services");
  return { success: true };
}

export async function clearItineraryCache() {
  await requireAdmin();
  await db.aiItineraryCache.deleteMany({});
  revalidatePath("/admin/ai-services");
  return { success: true };
}

export async function runHealthCheckNow() {
  await requireAdmin();
  const results = await runHealthCheck();
  revalidatePath("/admin/ai-services");
  return { success: true, results };
}
