import type { Metadata } from "next";
import { getAiSettings } from "@/lib/ai/settings";
import { TripPlannerForm } from "@/components/trip-planner/trip-planner-form";

export const metadata: Metadata = { title: "AI Trip Planner" };

export default async function TripPlannerPage() {
  const settings = await getAiSettings();

  if (!settings.tripPlannerEnabled) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-3">AI Trip Planner</h1>
        <p className="text-muted-foreground">{settings.unavailableMessage}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-10">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold">AI Trip Planner</h1>
        <p className="text-muted-foreground mt-2">
          Describe your trip and let AI build a day-by-day itinerary for you.
        </p>
      </div>
      <TripPlannerForm />
    </div>
  );
}
