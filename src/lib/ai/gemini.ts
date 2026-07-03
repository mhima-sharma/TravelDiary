import { callExternalApi, ApiResult } from "./api-client";

const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
const GEMINI_TIMEOUT_MS = 30000;

interface GeminiContent {
  role: "user" | "model";
  parts: { text: string }[];
}

interface GeminiResponse {
  candidates?: { content?: { parts?: { text?: string }[] } }[];
}

async function callGemini(contents: GeminiContent[]): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not configured");

  const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Gemini API responded with ${res.status}: ${body.slice(0, 200)}`);
  }

  const json: GeminiResponse = await res.json();
  const text = json.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
  if (!text) throw new Error("Gemini API returned an empty response");
  return text;
}

export async function generateItinerary(prompt: string, userId: string | null): Promise<ApiResult<string>> {
  const instruction =
    "You are a helpful travel planning assistant. Given a trip request, produce a clear, well-structured " +
    "day-by-day itinerary in Markdown, including suggested activities, rough timing, and practical tips. " +
    "Keep it concise and actionable.";

  return callExternalApi(
    "GEMINI",
    "generateContent",
    "TRIP_PLANNER",
    userId,
    () => callGemini([{ role: "user", parts: [{ text: `${instruction}\n\nTrip request: ${prompt}` }] }]),
    GEMINI_TIMEOUT_MS
  );
}

export async function generateChatReply(
  message: string,
  history: { role: "user" | "model"; content: string }[],
  userId: string | null
): Promise<ApiResult<string>> {
  const contents: GeminiContent[] = [
    ...history.map((h) => ({ role: h.role, parts: [{ text: h.content }] })),
    { role: "user", parts: [{ text: message }] },
  ];

  return callExternalApi("GEMINI", "generateContent", "CHATBOT", userId, () => callGemini(contents), GEMINI_TIMEOUT_MS);
}
