import { NextResponse } from "next/server";
import { fetchCountries } from "@/lib/locations/countries-now";

export async function GET() {
  try {
    const data = await fetchCountries();
    return NextResponse.json(
      { data },
      { headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800" } }
    );
  } catch {
    return NextResponse.json({ error: "Failed to load countries" }, { status: 502 });
  }
}
