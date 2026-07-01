import { WorldMap } from "@/components/map/world-map";
import { BackButton } from "@/components/shared/back-button";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Explore by Map",
  description: "Browse travel destinations visually — select India to explore its states, or any other country to see places there.",
  openGraph: {
    title: "Explore by Map | TravelDiary",
    description: "Browse travel destinations visually on an interactive world map.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Explore by Map on TravelDiary" }],
  },
};

export default function WorldMapPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <BackButton href="/explore" label="Explore" />
        <h1 className="mb-2 mt-2 text-3xl font-bold">Explore by Map</h1>
        <p className="text-muted-foreground">
          Select India to browse destinations state by state.
        </p>
      </div>

      <div className="rounded-xl border bg-card p-4 sm:p-6">
        <WorldMap />
      </div>
    </div>
  );
}
