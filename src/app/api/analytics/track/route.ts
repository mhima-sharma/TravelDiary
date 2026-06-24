import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createHash } from "crypto";

function hashIp(ip: string): string {
  const salt = process.env.NEXTAUTH_SECRET ?? "traveldiary-salt";
  return createHash("sha256").update(ip + salt).digest("hex").slice(0, 16);
}

function detectDevice(ua: string): string {
  if (/tablet|ipad/i.test(ua)) return "tablet";
  if (/mobile|android|iphone/i.test(ua)) return "mobile";
  return "desktop";
}

export async function POST(req: NextRequest) {
  try {
    const { path, referrer } = await req.json();
    if (!path || typeof path !== "string") return NextResponse.json({ ok: false });

    // Skip tracking for admin, api, and static routes
    if (path.startsWith("/admin") || path.startsWith("/api") || path.startsWith("/_next")) {
      return NextResponse.json({ ok: true, skipped: true });
    }

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";

    const ua = req.headers.get("user-agent") ?? "";

    // Skip bots
    if (/bot|crawler|spider|slurp|googlebot|bingbot/i.test(ua)) {
      return NextResponse.json({ ok: true, skipped: true });
    }

    await db.pageView.create({
      data: {
        path,
        ipHash: hashIp(ip),
        device: detectDevice(ua),
        referrer: referrer || null,
      },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false });
  }
}
