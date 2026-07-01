import { slugify } from "@/lib/utils";
import type { IndiaStateInfo } from "@/types/map";

/** Canonical state/UT names — must match the `name` property in public/data/india-states.geojson */
export const INDIA_STATE_NAMES = [
  "Andaman and Nicobar",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu and Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Ladakh",
  "Lakshadweep",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
] as const;

export const INDIA_STATES: IndiaStateInfo[] = INDIA_STATE_NAMES.map((name) => ({
  name,
  slug: slugify(name),
}));

/** Common alternate spellings users may have typed into the free-text "state" field */
const STATE_ALIASES: Record<string, string[]> = {
  Odisha: ["Orissa"],
  Puducherry: ["Pondicherry"],
  "Andaman and Nicobar": ["Andaman and Nicobar Islands"],
  Delhi: ["NCT of Delhi", "New Delhi", "National Capital Territory of Delhi"],
  Uttarakhand: ["Uttaranchal"],
  "Dadra and Nagar Haveli and Daman and Diu": [
    "Dadra and Nagar Haveli",
    "Daman and Diu",
  ],
};

export function getStateNameFromSlug(slug: string): string | undefined {
  return INDIA_STATES.find((s) => s.slug === slug)?.name;
}

export function getStateSlug(name: string): string {
  return slugify(name);
}

/** All spellings a DB query should match for a given canonical state name */
export function getStateAliases(name: string): string[] {
  return [name, ...(STATE_ALIASES[name] ?? [])];
}
