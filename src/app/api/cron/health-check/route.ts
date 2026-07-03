import { NextRequest, NextResponse } from "next/server";
import { runHealthCheck, pruneOldRequestLogs } from "@/lib/ai/health-check";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results = await runHealthCheck();
  const prunedCount = await pruneOldRequestLogs();

  return NextResponse.json({ results, prunedCount, checkedAt: new Date().toISOString() });
}
