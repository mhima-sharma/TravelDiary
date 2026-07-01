import { IndiaMapExplorer } from "@/components/map/india-map-explorer";
import { BackButton } from "@/components/shared/back-button";
import { getStateNameFromSlug } from "@/lib/map/india-states";
import type { Metadata } from "next";

interface IndiaMapPageProps {
  searchParams: Promise<{ state?: string }>;
}

export async function generateMetadata({ searchParams }: IndiaMapPageProps): Promise<Metadata> {
  const { state } = await searchParams;
  const stateName = state ? getStateNameFromSlug(state) : undefined;
  const title = stateName ? `Places in ${stateName}` : "Explore India by State";
  return {
    title,
    description: stateName
      ? `Discover travel destinations in ${stateName}, India.`
      : "Select a state on the interactive map to discover travel destinations across India.",
  };
}

export default async function IndiaMapPage({ searchParams }: IndiaMapPageProps) {
  const { state } = await searchParams;
  const initialState = state ? getStateNameFromSlug(state) ?? null : null;

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <BackButton href="/explore/map" label="World Map" />
        <h1 className="mb-2 mt-2 text-3xl font-bold">Explore India</h1>
        <p className="text-muted-foreground">
          Select a state to see travel destinations from there.
        </p>
      </div>

      <div className="rounded-xl border bg-card p-4 sm:p-6">
        <IndiaMapExplorer initialState={initialState} />
      </div>
    </div>
  );
}
