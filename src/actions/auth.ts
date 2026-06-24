"use server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { signIn } from "@/lib/auth";
import { sendVerificationEmail, sendPasswordResetEmail } from "@/lib/mail";
import { generateToken } from "@/lib/utils";
import { RegisterSchema, LoginSchema, ForgotPasswordSchema, ResetPasswordSchema } from "@/schemas";
import { AuthError } from "next-auth";

export async function register(values: z.infer<typeof RegisterSchema>) {
  const parsed = RegisterSchema.safeParse(values);
  if (!parsed.success) return { error: "Invalid input" };

  const { name, email, password } = parsed.data;
  const existing = await db.user.findUnique({ where: { email } });
  if (existing) return { error: "Email already in use" };

  const hashed = await bcrypt.hash(password, 12);
  const user = await db.user.create({ data: { name, email, password: hashed } });

  const token = generateToken();
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await db.verificationToken.create({ data: { token, email, expires, userId: user.id } });

  try {
    await sendVerificationEmail(email, token);
  } catch {
    // email send failure shouldn't block registration
  }

  return { success: "Account created! Please check your email to verify." };
}

export async function login(values: z.infer<typeof LoginSchema>) {
  const parsed = LoginSchema.safeParse(values);
  if (!parsed.success) return { error: "Invalid input" };

  try {
    await signIn("credentials", { ...parsed.data, redirect: false });
    return { success: "Logged in!" };
  } catch (err) {
    if (err instanceof AuthError) {
      switch (err.type) {
        case "CredentialsSignin": return { error: "Invalid email or password" };
        default: return { error: "Something went wrong" };
      }
    }
    throw err;
  }
}

export async function forgotPassword(values: z.infer<typeof ForgotPasswordSchema>) {
  const parsed = ForgotPasswordSchema.safeParse(values);
  if (!parsed.success) return { error: "Invalid email" };

  const user = await db.user.findUnique({ where: { email: parsed.data.email } });
  if (!user) return { success: "If an account exists, a reset link has been sent." };

  await db.passwordResetToken.deleteMany({ where: { email: parsed.data.email } });
  const token = generateToken();
  const expires = new Date(Date.now() + 60 * 60 * 1000);
  await db.passwordResetToken.create({ data: { token, email: parsed.data.email, expires, userId: user.id } });

  try {
    await sendPasswordResetEmail(parsed.data.email, token);
  } catch {
    return { error: "Failed to send email" };
  }

  return { success: "Reset link sent! Check your email." };
}

export async function resetPassword(token: string, values: z.infer<typeof ResetPasswordSchema>) {
  const parsed = ResetPasswordSchema.safeParse(values);
  if (!parsed.success) return { error: "Invalid input" };

  const record = await db.passwordResetToken.findUnique({ where: { token } });
  if (!record || record.expires < new Date()) return { error: "Token is invalid or expired" };

  const hashed = await bcrypt.hash(parsed.data.password, 12);
  await db.user.update({ where: { id: record.userId }, data: { password: hashed } });
  await db.passwordResetToken.delete({ where: { token } });

  return { success: "Password reset successfully!" };
}

export async function verifyEmail(token: string) {
  const record = await db.verificationToken.findUnique({ where: { token } });
  if (!record || record.expires < new Date()) return { error: "Token is invalid or expired" };

  await db.user.update({ where: { email: record.email }, data: { emailVerified: new Date() } });
  await db.verificationToken.delete({ where: { token } });

  return { success: "Email verified!" };
}
