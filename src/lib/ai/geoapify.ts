import { callExternalApi, ApiResult } from "./api-client";

const BASE_URL = "https://api.geoapify.com";
const NEARBY_RADIUS_METERS = 5000;
const NEARBY_LIMIT = 10;

export interface GeocodedPoint {
  lat: number;
  lon: number;
  formatted: string;
}

export interface NearbyAttraction {
  name: string;
  categories: string[];
  lat: number;
  lon: number;
  address: string | null;
}

interface GeoapifyGeocodeResponse {
  results?: { lat: number; lon: number; formatted?: string }[];
}

interface GeoapifyPlacesResponse {
  features?: {
    properties?: {
      name?: string;
      categories?: string[];
      lat?: number;
      lon?: number;
      formatted?: string;
    };
  }[];
}

function requireApiKey(): string {
  const apiKey = process.env.GEOAPIFY_API_KEY;
  if (!apiKey) throw new Error("GEOAPIFY_API_KEY is not configured");
  return apiKey;
}

async function geocode(destination: string): Promise<GeocodedPoint> {
  const apiKey = requireApiKey();
  const url = `${BASE_URL}/v1/geocode/search?text=${encodeURIComponent(destination)}&format=json&limit=1&apiKey=${apiKey}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Geoapify geocoding responded with ${res.status}`);

  const json: GeoapifyGeocodeResponse = await res.json();
  const result = json.results?.[0];
  if (!result) throw new Error(`Could not geocode destination: ${destination}`);

  return { lat: result.lat, lon: result.lon, formatted: result.formatted ?? destination };
}

async function fetchNearbyAttractions(lat: number, lon: number): Promise<NearbyAttraction[]> {
  const apiKey = requireApiKey();
  const url =
    `${BASE_URL}/v2/places?categories=tourism.sights,tourism.attraction,entertainment` +
    `&filter=circle:${lon},${lat},${NEARBY_RADIUS_METERS}&bias=proximity:${lon},${lat}` +
    `&limit=${NEARBY_LIMIT}&apiKey=${apiKey}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Geoapify places responded with ${res.status}`);

  const json: GeoapifyPlacesResponse = await res.json();
  return (json.features ?? [])
    .filter((f) => f.properties?.name)
    .map((f) => ({
      name: f.properties!.name!,
      categories: f.properties!.categories ?? [],
      lat: f.properties!.lat!,
      lon: f.properties!.lon!,
      address: f.properties!.formatted ?? null,
    }));
}

export async function geocodeDestination(
  destination: string,
  userId: string | null
): Promise<ApiResult<GeocodedPoint>> {
  return callExternalApi("GEOAPIFY", "geocode/search", "TRIP_PLANNER", userId, () => geocode(destination));
}

export async function getNearbyAttractions(
  lat: number,
  lon: number,
  userId: string | null
): Promise<ApiResult<NearbyAttraction[]>> {
  return callExternalApi("GEOAPIFY", "v2/places", "TRIP_PLANNER", userId, () => fetchNearbyAttractions(lat, lon));
}
