"use client";

import { useEffect, useState } from "react";
import { MapPinned } from "lucide-react";
import { PlaceCard } from "@/components/shared/place-card";
import { PlaceCardSkeleton } from "@/components/shared/place-card-skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { MapError } from "@/components/map/map-status";
import type { MapPlace, PlacesApiResponse } from "@/types/map";

interface StatePlacesProps {
  state: string;
}

export function StatePlaces({ state }: StatePlacesProps) {
  const [places, setPlaces] = useState<MapPlace[] | null>(null);
  const [status, setStatus] = useState<"loading" | "error" | "ready">("loading");
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setStatus("loading");
    setPlaces(null);

    fetch(`/api/places?state=${encodeURIComponent(state)}&limit=24`, {
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) throw new Error("Request failed");
        return res.json() as Promise<PlacesApiResponse>;
      })
      .then((data) => {
        setPlaces(data.places);
        setStatus("ready");
      })
      .catch((err) => {
        if (err.name !== "AbortError") setStatus("error");
      });

    return () => controller.abort();
  }, [state, retryKey]);

  if (status === "loading") {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true" aria-live="polite">
        {Array.from({ length: 6 }).map((_, i) => (
          <PlaceCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (status === "error") {
    return (
      <MapError
        message={`We couldn't load places in ${state}. Please try again.`}
        onRetry={() => setRetryKey((k) => k + 1)}
      />
    );
  }

  if (!places || places.length === 0) {
    return (
      <EmptyState
        icon={MapPinned}
        title={`No places in ${state} yet`}
        description="Be the first to add a travel destination from this state."
        action={{ label: "Add a Place", href: "/places/new" }}
      />
    );
  }

  return (
    <div
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
      aria-live="polite"
    >
      {places.map((place) => (
        <PlaceCard key={place.id} place={place} />
      ))}
    </div>
  );
}
