import { callExternalApi, ApiResult } from "./api-client";

const BASE_URL = "https://router.project-osrm.org";

export interface RouteLeg {
  fromIndex: number;
  toIndex: number;
  distanceKm: number;
  durationMin: number;
}

export interface RouteInfo {
  legs: RouteLeg[];
  totalDistanceKm: number;
  totalDurationMin: number;
}

interface OsrmResponse {
  code: string;
  routes?: { distance: number; duration: number; legs: { distance: number; duration: number }[] }[];
}

/** Computes travel distance/duration between consecutive stops of a generated itinerary (not origin -> destination, which is undefined for a single-destination prompt). */
async function fetchRoute(points: { lat: number; lon: number }[]): Promise<RouteInfo> {
  if (points.length < 2) throw new Error("At least two points are required for routing");

  const coords = points.map((p) => `${p.lon},${p.lat}`).join(";");
  const url = `${BASE_URL}/route/v1/driving/${coords}?overview=false`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`OSRM responded with ${res.status}`);

  const json: OsrmResponse = await res.json();
  const route = json.routes?.[0];
  if (json.code !== "Ok" || !route) throw new Error(`OSRM could not compute a route (${json.code})`);

  const legs: RouteLeg[] = route.legs.map((leg, i) => ({
    fromIndex: i,
    toIndex: i + 1,
    distanceKm: Math.round((leg.distance / 1000) * 10) / 10,
    durationMin: Math.round(leg.duration / 60),
  }));

  return {
    legs,
    totalDistanceKm: Math.round((route.distance / 1000) * 10) / 10,
    totalDurationMin: Math.round(route.duration / 60),
  };
}

export async function getRouteInfo(
  points: { lat: number; lon: number }[],
  userId: string | null
): Promise<ApiResult<RouteInfo>> {
  return callExternalApi("OSRM", "route/v1/driving", "TRIP_PLANNER", userId, () => fetchRoute(points));
}
