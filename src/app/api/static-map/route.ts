import { NextRequest, NextResponse } from "next/server";

const BASE_URL = "https://maps.geoapify.com/v1/staticmap";
const MAX_MARKERS = 10;

function parseCoord(value: string | null): number | null {
  if (value === null) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function parseMarkerList(param: string | null): { lat: number; lon: number }[] {
  if (!param) return [];
  return param
    .split("|")
    .slice(0, MAX_MARKERS)
    .map((pair) => {
      const [lat, lon] = pair.split(",").map(Number);
      return { lat, lon };
    })
    .filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lon));
}

/**
 * Proxies Geoapify Static Maps so GEOAPIFY_API_KEY never reaches the browser.
 * Accepts only numeric coordinates from the client and builds the marker
 * params server-side to avoid passing client-controlled strings into the upstream URL.
 */
export async function GET(req: NextRequest) {
  const apiKey = process.env.GEOAPIFY_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "Map unavailable" }, { status: 503 });

  const { searchParams } = new URL(req.url);
  const lat = parseCoord(searchParams.get("lat"));
  const lon = parseCoord(searchParams.get("lon"));
  if (lat === null || lon === null) {
    return NextResponse.json({ error: "Missing or invalid coordinates" }, { status: 400 });
  }

  const attractionMarkers = parseMarkerList(searchParams.get("markers"));

  const markerParams = [
    `marker=lonlat:${lon},${lat};color:%23e11d48;size:large`,
    ...attractionMarkers.map((m) => `marker=lonlat:${m.lon},${m.lat};color:%232563eb;size:medium`),
  ].join("&");

  const url =
    `${BASE_URL}?style=osm-carto&width=640&height=360&center=lonlat:${lon},${lat}&zoom=13` +
    `&${markerParams}&apiKey=${apiKey}`;

  const res = await fetch(url);
  if (!res.ok) return NextResponse.json({ error: "Map unavailable" }, { status: 502 });

  const buffer = await res.arrayBuffer();
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": res.headers.get("Content-Type") ?? "image/png",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
