"use server";
import { sendContactEmail } from "@/lib/mail";

export async function submitContact(data: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  try {
    await sendContactEmail(data);
    return { success: "Message sent! We'll get back to you within 24 hours." };
  } catch {
    return { error: "Failed to send message. Please try again." };
  }
}
