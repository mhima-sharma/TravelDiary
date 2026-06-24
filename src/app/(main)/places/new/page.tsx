import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { PlaceForm } from "@/components/places/place-form";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Add a Place" };

export default async function NewPlacePage() {
  const session = await auth();
  if (!session) redirect("/login?callbackUrl=/places/new");

  const categories = await db.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Add a New Place</h1>
        <p className="text-muted-foreground mt-2">Share a destination with the TravelDiary community. It will be reviewed before going live.</p>
      </div>
      <PlaceForm categories={categories} />
    </div>
  );
}
