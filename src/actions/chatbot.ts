"use server";

import { auth } from "@/lib/auth";
import { ChatMessageSchema } from "@/schemas";
import { getAiSettings } from "@/lib/ai/settings";
import { generateChatReply } from "@/lib/ai/gemini";

const FALLBACK_REPLY = "Sorry, I'm unable to respond right now. Please try again later.";

export async function sendChatMessage(
  message: string,
  history: { role: "user" | "model"; content: string }[]
): Promise<{ reply: string }> {
  const settings = await getAiSettings();
  if (!settings.chatbotEnabled) {
    return { reply: FALLBACK_REPLY };
  }

  const parsed = ChatMessageSchema.safeParse({ message, history });
  if (!parsed.success) {
    return { reply: FALLBACK_REPLY };
  }

  const session = await auth();
  const userId = session?.user?.id ?? null;

  const result = await generateChatReply(parsed.data.message, parsed.data.history, userId);
  if (!result.ok) {
    return { reply: result.message };
  }

  return { reply: result.data };
}
