"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MapPin, Loader2 } from "lucide-react";

export function NearMeButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const isActive = searchParams.get("sort") === "nearest";

  const handleClick = () => {
    const params = new URLSearchParams(searchParams.toString());

    if (isActive) {
      params.delete("lat");
      params.delete("lng");
      params.set("sort", "newest");
      params.delete("page");
      router.push(`/explore?${params.toString()}`);
      return;
    }

    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        params.set("lat", String(pos.coords.latitude));
        params.set("lng", String(pos.coords.longitude));
        params.set("sort", "nearest");
        params.delete("page");
        router.push(`/explore?${params.toString()}`);
        setLoading(false);
      },
      () => {
        alert("Unable to get your location. Please allow location access and try again.");
        setLoading(false);
      }
    );
  };

  return (
    <Button
      type="button"
      variant={isActive ? "default" : "outline"}
      onClick={handleClick}
      disabled={loading}
      className="shrink-0"
    >
      {loading
        ? <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        : <MapPin className="h-4 w-4 mr-2" />}
      {isActive ? "Near Me (On)" : "Near Me"}
    </Button>
  );
}
