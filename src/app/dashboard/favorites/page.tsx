import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { PlaceCard } from "@/components/shared/place-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Heart } from "lucide-react";
import { BackButton } from "@/components/shared/back-button";

export default async function FavoritesPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const favorites = await db.favorite.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      place: {
        include: {
          category: { select: { name: true, slug: true, icon: true } },
          user: { select: { id: true, name: true, image: true } },
          images: { select: { id: true, url: true, alt: true }, take: 1 },
          _count: { select: { reviews: true, favorites: true } },
        },
      },
    },
  });

  return (
    <div className="space-y-6">
      <BackButton href="/dashboard" label="Dashboard" />
      <h1 className="text-2xl font-bold">Saved Places</h1>
      {favorites.length === 0 ? (
        <EmptyState icon={Heart} title="No saved places" description="Save places you want to visit later by clicking the heart icon on any place." action={{ label: "Explore Places", href: "/explore" }} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {favorites.map(({ place }) => <PlaceCard key={place.id} place={place} />)}
        </div>
      )}
    </div>
  );
}
