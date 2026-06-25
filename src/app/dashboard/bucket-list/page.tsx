import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { VisitStatus } from "@prisma/client";
import Link from "next/link";
import Image from "next/image";
import { Bookmark, MapPin, Star, Trash2 } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { BackButton } from "@/components/shared/back-button";
import { RemoveFromBucketList } from "./remove-button";

export default async function BucketListPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const visits = await db.placeVisit.findMany({
    where: { userId: session.user.id, status: VisitStatus.WANT_TO_VISIT },
    orderBy: { createdAt: "desc" },
    include: {
      place: {
        select: {
          id: true,
          title: true,
          slug: true,
          featuredImage: true,
          city: true,
          state: true,
          country: true,
          averageRating: true,
          _count: { select: { reviews: true } },
          category: { select: { name: true } },
        },
      },
    },
  });

  return (
    <div className="space-y-6">
      <BackButton href="/dashboard" label="Dashboard" />
      <div>
        <h1 className="text-2xl font-bold">Bucket List</h1>
        <p className="text-sm text-muted-foreground mt-1">Places you want to visit</p>
      </div>

      {visits.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="Your bucket list is empty"
          description="Mark any place as 'Want to Visit' from the place page to add it here."
          action={{ label: "Explore Places", href: "/explore" }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {visits.map(({ place, id: visitId }) => (
            <div key={visitId} className="group relative flex gap-4 p-4 border rounded-xl bg-card hover:shadow-md transition-shadow">
              {/* Image */}
              <Link href={`/places/${place.slug}`} className="shrink-0">
                <div className="relative h-24 w-24 rounded-lg overflow-hidden bg-muted">
                  {place.featuredImage ? (
                    <Image src={place.featuredImage} alt={place.title} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <MapPin className="h-6 w-6" />
                    </div>
                  )}
                </div>
              </Link>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <Link href={`/places/${place.slug}`}>
                  <p className="font-semibold line-clamp-1 group-hover:text-primary transition-colors">
                    {place.title}
                  </p>
                </Link>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  <MapPin className="h-3 w-3" />{place.city}, {place.state}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{place.category.name}</p>
                {place.averageRating > 0 && (
                  <p className="text-xs flex items-center gap-1 mt-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    {place.averageRating.toFixed(1)}
                    <span className="text-muted-foreground">({place._count.reviews})</span>
                  </p>
                )}
              </div>

              {/* Remove button */}
              <RemoveFromBucketList visitId={visitId} placeId={place.id} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
