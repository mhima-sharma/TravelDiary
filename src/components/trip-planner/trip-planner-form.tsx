"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Sparkles, RefreshCw, MapPin, CloudSun, Route } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { TripPlannerSchema, type TripPlannerInput } from "@/schemas";
import { generateTripPlan, type TripPlanResult } from "@/actions/trip-planner";
import { MarkdownContent } from "@/components/shared/markdown-content";
import { TripMap } from "@/components/trip-planner/trip-map";

export function TripPlannerForm() {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<TripPlanResult | null>(null);
  const [lastPrompt, setLastPrompt] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TripPlannerInput>({
    resolver: zodResolver(TripPlannerSchema),
    defaultValues: { prompt: "" },
  });

  function runPlan(prompt: string, forceRegenerate = false) {
    startTransition(async () => {
      const data = await generateTripPlan(prompt, { forceRegenerate });
      setResult(data);
      if ("error" in data) toast.error(data.error);
    });
  }

  const onSubmit = (data: TripPlannerInput) => {
    setLastPrompt(data.prompt);
    runPlan(data.prompt);
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <Textarea placeholder="e.g. Plan a 3 day trip near Delhi under 10000" rows={4} {...register("prompt")} />
        {errors.prompt && <p className="text-xs text-destructive">{errors.prompt.message}</p>}
        <Button type="submit" disabled={isPending}>
          {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
          Generate Itinerary
        </Button>
      </form>

      {result && !("error" in result) && (
        <Card>
          <CardContent className="space-y-6 pt-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              {result.cached ? <Badge variant="secondary">⚡ Served from cache</Badge> : <span />}
              {result.cached && (
                <Button size="sm" variant="outline" onClick={() => runPlan(lastPrompt, true)} disabled={isPending}>
                  {isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="mr-2 h-4 w-4" />
                  )}
                  Regenerate with AI
                </Button>
              )}
            </div>

            {result.destinationImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={result.destinationImage}
                alt="Destination"
                className="h-56 w-full rounded-lg border object-cover"
              />
            )}

            {result.destinationLat !== null && result.destinationLon !== null && (
              <TripMap
                lat={result.destinationLat}
                lon={result.destinationLon}
                attractions={result.nearbyAttractions ?? []}
              />
            )}

            <MarkdownContent content={result.itinerary} />

            <div className="space-y-2">
              <h3 className="flex items-center gap-2 font-semibold">
                <MapPin className="h-4 w-4" /> Nearby Attractions
              </h3>
              {result.nearbyAttractions === null ? (
                <p className="text-sm text-muted-foreground">Currently unavailable.</p>
              ) : result.nearbyAttractions.length === 0 ? (
                <p className="text-sm text-muted-foreground">No nearby attractions found.</p>
              ) : (
                <ul className="list-disc space-y-1 pl-5 text-sm">
                  {result.nearbyAttractions.map((a, i) => (
                    <li key={i}>
                      {a.name}
                      {a.address ? ` — ${a.address}` : ""}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {result.weather && (
              <div className="space-y-1">
                <h3 className="flex items-center gap-2 font-semibold">
                  <CloudSun className="h-4 w-4" /> Current Weather
                </h3>
                <p className="text-sm text-muted-foreground">
                  {result.weather.temperatureC}°C, wind {result.weather.windSpeedKmh} km/h
                </p>
              </div>
            )}

            {result.routeInfo && (
              <div className="space-y-1">
                <h3 className="flex items-center gap-2 font-semibold">
                  <Route className="h-4 w-4" /> Travel Between Stops
                </h3>
                <p className="text-sm text-muted-foreground">
                  Approx. {result.routeInfo.totalDistanceKm} km, {result.routeInfo.totalDurationMin} min total
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
