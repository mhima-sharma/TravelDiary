"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";
import { Button } from "@/components/ui/button";
import { Minus, Plus, RotateCcw } from "lucide-react";
import { MapError, MapLoading } from "@/components/map/map-status";
import { cn } from "@/lib/utils";

const GEO_URL = "/data/india-states.geojson";
/** Official geographic center of India (near Nagpur, Madhya Pradesh) */
const INDIA_CENTER: [number, number] = [78.9629, 22.5937];

interface Tooltip {
  name: string;
  x: number;
  y: number;
}

interface IndiaMapProps {
  selectedState: string | null;
  onSelectState: (name: string) => void;
}

export function IndiaMap({ selectedState, onSelectState }: IndiaMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [geojson, setGeojson] = useState<object | null>(null);
  const [status, setStatus] = useState<"loading" | "error" | "ready">("loading");
  const [position, setPosition] = useState({ coordinates: [0, 0] as [number, number], zoom: 1 });
  const [tooltip, setTooltip] = useState<Tooltip | null>(null);

  const load = useCallback(() => {
    setStatus("loading");
    fetch(GEO_URL)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load map data");
        return res.json();
      })
      .then((data) => {
        setGeojson(data);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function handleMouseMove(evt: React.MouseEvent, name: string) {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setTooltip({ name, x: evt.clientX - rect.left, y: evt.clientY - rect.top });
  }

  function zoomBy(factor: number) {
    setPosition((p) => ({ ...p, zoom: Math.min(8, Math.max(1, p.zoom * factor)) }));
  }

  function resetZoom() {
    setPosition({ coordinates: [0, 0], zoom: 1 });
  }

  if (status === "loading") return <MapLoading label="Loading India map…" />;
  if (status === "error" || !geojson) {
    return <MapError message="We couldn't load the India map. Check your connection and try again." onRetry={load} />;
  }

  return (
    <div ref={containerRef} className="relative mx-auto w-full max-w-md select-none sm:max-w-lg">
      <div className="absolute right-2 top-2 z-10 flex flex-col gap-1">
        <Button type="button" size="icon" variant="outline" className="h-8 w-8 bg-background/90" onClick={() => zoomBy(1.5)} aria-label="Zoom in">
          <Plus className="h-4 w-4" />
        </Button>
        <Button type="button" size="icon" variant="outline" className="h-8 w-8 bg-background/90" onClick={() => zoomBy(1 / 1.5)} aria-label="Zoom out">
          <Minus className="h-4 w-4" />
        </Button>
        <Button type="button" size="icon" variant="outline" className="h-8 w-8 bg-background/90" onClick={resetZoom} aria-label="Reset zoom">
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ scale: 1050, center: INDIA_CENTER }}
        width={800}
        height={800}
        className="h-auto w-full"
        role="img"
        aria-label="Interactive map of Indian states. Select a state to view places there."
      >
        <ZoomableGroup
          center={position.coordinates}
          zoom={position.zoom}
          minZoom={1}
          maxZoom={8}
          onMoveEnd={(pos) => setPosition({ coordinates: pos.coordinates, zoom: pos.zoom })}
        >
          <Geographies geography={geojson}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const name = geo.properties.name as string;
                const isSelected = name === selectedState;
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    role="button"
                    tabIndex={0}
                    aria-pressed={isSelected}
                    aria-label={`${name}${isSelected ? " (selected)" : ""} — view places`}
                    onMouseEnter={(evt) => handleMouseMove(evt, name)}
                    onMouseMove={(evt) => handleMouseMove(evt, name)}
                    onMouseLeave={() => setTooltip(null)}
                    onClick={() => onSelectState(name)}
                    onKeyDown={(evt) => {
                      if (evt.key === "Enter" || evt.key === " ") {
                        evt.preventDefault();
                        onSelectState(name);
                      }
                    }}
                    className={cn(
                      "cursor-pointer outline-none transition-colors duration-150",
                      "focus-visible:stroke-primary focus-visible:stroke-2"
                    )}
                    style={{
                      default: {
                        fill: isSelected ? "hsl(var(--primary))" : "hsl(var(--muted))",
                        stroke: "hsl(var(--background))",
                        strokeWidth: 0.75,
                        outline: "none",
                      },
                      hover: {
                        fill: isSelected ? "hsl(var(--primary))" : "hsl(var(--primary) / 0.45)",
                        stroke: "hsl(var(--background))",
                        strokeWidth: 0.75,
                        outline: "none",
                      },
                      pressed: {
                        fill: "hsl(var(--primary))",
                        stroke: "hsl(var(--background))",
                        strokeWidth: 0.75,
                        outline: "none",
                      },
                    }}
                  />
                );
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>

      {tooltip && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-md bg-foreground px-2 py-1 text-xs font-medium text-background shadow-md"
          style={{ left: tooltip.x, top: tooltip.y - 8 }}
        >
          {tooltip.name}
        </div>
      )}
    </div>
  );
}
