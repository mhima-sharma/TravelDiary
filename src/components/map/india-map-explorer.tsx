"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin } from "lucide-react";
import { IndiaMap } from "@/components/map/india-map";
import { StatePlaces } from "@/components/map/state-places";
import { getStateSlug } from "@/lib/map/india-states";

interface IndiaMapExplorerProps {
  initialState: string | null;
}

export function IndiaMapExplorer({ initialState }: IndiaMapExplorerProps) {
  const router = useRouter();
  const [selectedState, setSelectedState] = useState<string | null>(initialState);

  function handleSelectState(name: string) {
    setSelectedState(name);
    // Shallow URL sync so the selection is shareable/bookmarkable without a full navigation.
    router.push(`/explore/map/india?state=${getStateSlug(name)}`, { scroll: false });
  }

  return (
    <div className="space-y-10">
      <IndiaMap selectedState={selectedState} onSelectState={handleSelectState} />

      <div>
        {selectedState ? (
          <>
            <div className="mb-6 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-semibold">{selectedState}</h2>
            </div>
            <StatePlaces state={selectedState} />
          </>
        ) : (
          <p className="text-center text-muted-foreground">
            Select a state on the map above to see places from there.
          </p>
        )}
      </div>
    </div>
  );
}
