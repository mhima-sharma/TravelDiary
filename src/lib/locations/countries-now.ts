const BASE_URL = "https://countriesnow.space/api/v0.1";
/** Countries/states/cities are effectively static reference data */
const REVALIDATE_SECONDS = 60 * 60 * 24;

class CountriesNowError extends Error {}

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    next: { revalidate: REVALIDATE_SECONDS },
  });
  if (!res.ok) throw new CountriesNowError(`CountriesNow API responded with ${res.status}`);
  return res.json();
}

async function postJson<T>(path: string, body: Record<string, string>): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    next: { revalidate: REVALIDATE_SECONDS },
  });
  if (!res.ok) throw new CountriesNowError(`CountriesNow API responded with ${res.status}`);
  return res.json();
}

interface CountriesNowPosition {
  name: string;
  iso2: string;
}

interface CountriesNowStatesResponse {
  error: boolean;
  msg?: string;
  data: { name: string; states: { name: string }[] };
}

interface CountriesNowCitiesResponse {
  error: boolean;
  msg?: string;
  data: string[];
}

export async function fetchCountries(): Promise<string[]> {
  const json = await getJson<{ error: boolean; data: CountriesNowPosition[] }>("/countries/positions");
  if (json.error) throw new CountriesNowError("Failed to fetch countries");
  return [...new Set(json.data.map((c) => c.name))].sort((a, b) => a.localeCompare(b));
}

export async function fetchStates(country: string): Promise<string[]> {
  const json = await postJson<CountriesNowStatesResponse>("/countries/states", { country });
  if (json.error) throw new CountriesNowError(json.msg ?? `Failed to fetch states for ${country}`);
  return json.data.states.map((s) => s.name).sort((a, b) => a.localeCompare(b));
}

export async function fetchCities(country: string, state: string): Promise<string[]> {
  const json = await postJson<CountriesNowCitiesResponse>("/countries/state/cities", { country, state });
  if (json.error) throw new CountriesNowError(json.msg ?? `Failed to fetch cities for ${state}, ${country}`);
  return [...json.data].sort((a, b) => a.localeCompare(b));
}
