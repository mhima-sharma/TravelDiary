"use server";
import { z } from "zod";
import { sendContactEmail } from "@/lib/mail";
import { ContactSchema } from "@/schemas";

export async function submitContact(data: z.infer<typeof ContactSchema>) {
  const parsed = ContactSchema.safeParse(data);
  if (!parsed.success) {
    const first = parsed.error.issues[0]?.message ?? "Invalid input";
    return { error: first };
  }

  try {
    await sendContactEmail(parsed.data);
    return { success: "Message sent! We'll get back to you within 24 hours." };
  } catch {
    return { error: "Failed to send message. Please try again." };
  }
}
