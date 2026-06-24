"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ProfileSchema } from "@/schemas";
import { ResetPasswordSchema } from "@/schemas";

export async function updateProfile(values: z.infer<typeof ProfileSchema>) {
  const session = await auth();
  if (!session) return { error: "Not authenticated" };

  const parsed = ProfileSchema.safeParse(values);
  if (!parsed.success) return { error: "Invalid input" };

  await db.user.update({
    where: { id: session.user.id },
    data: { name: parsed.data.name, bio: parsed.data.bio, image: parsed.data.image || null },
  });

  revalidatePath("/dashboard/profile");
  return { success: "Profile updated!" };
}

export async function changePassword(values: z.infer<typeof ResetPasswordSchema>) {
  const session = await auth();
  if (!session) return { error: "Not authenticated" };

  const parsed = ResetPasswordSchema.safeParse(values);
  if (!parsed.success) return { error: "Invalid input" };

  const hashed = await bcrypt.hash(parsed.data.password, 12);
  await db.user.update({ where: { id: session.user.id }, data: { password: hashed } });
  return { success: "Password changed!" };
}
