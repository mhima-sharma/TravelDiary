import { NextRequest, NextResponse } from "next/server";
import { fetchCities } from "@/lib/locations/countries-now";

export async function GET(req: NextRequest) {
  const country = req.nextUrl.searchParams.get("country")?.trim();
  const state = req.nextUrl.searchParams.get("state")?.trim();
  if (!country || !state) {
    return NextResponse.json({ error: "country and state are required" }, { status: 400 });
  }

  try {
    const data = await fetchCities(country, state);
    return NextResponse.json(
      { data },
      { headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800" } }
    );
  } catch {
    return NextResponse.json({ error: `Failed to load cities for ${state}, ${country}` }, { status: 502 });
  }
}
