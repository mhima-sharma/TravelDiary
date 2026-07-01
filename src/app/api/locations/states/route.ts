import { NextRequest, NextResponse } from "next/server";
import { fetchStates } from "@/lib/locations/countries-now";

export async function GET(req: NextRequest) {
  const country = req.nextUrl.searchParams.get("country")?.trim();
  if (!country) {
    return NextResponse.json({ error: "country is required" }, { status: 400 });
  }

  try {
    const data = await fetchStates(country);
    return NextResponse.json(
      { data },
      { headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800" } }
    );
  } catch {
    return NextResponse.json({ error: `Failed to load states for ${country}` }, { status: 502 });
  }
}
