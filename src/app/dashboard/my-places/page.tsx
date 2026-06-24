import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { PlaceStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { MapPin, Plus, Pencil, Eye } from "lucide-react";
import { DeletePlaceButton } from "@/components/places/delete-place-button";
import { BackButton } from "@/components/shared/back-button";

export default async function MyPlacesPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const places = await db.place.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { category: { select: { name: true } }, _count: { select: { reviews: true } } },
  });

  const statusVariant = (s: PlaceStatus) => ({ APPROVED: "success", PENDING: "warning", REJECTED: "destructive" }[s] as "success" | "warning" | "destructive");

  return (
    <div className="space-y-6">
      <BackButton href="/dashboard" label="Dashboard" />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Places</h1>
        <Button asChild><Link href="/places/new"><Plus className="h-4 w-4 mr-2" />Add Place</Link></Button>
      </div>

      {places.length === 0 ? (
        <EmptyState icon={MapPin} title="No places yet" description="Start contributing by adding your first travel destination." action={{ label: "Add a Place", href: "/places/new" }} />
      ) : (
        <div className="space-y-4">
          {places.map((place) => (
            <Card key={place.id}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="relative h-16 w-24 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                  {place.featuredImage ? (
                    <Image src={place.featuredImage} alt={place.title} fill className="object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full"><MapPin className="h-6 w-6 text-muted-foreground" /></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{place.title}</p>
                  <p className="text-sm text-muted-foreground">{place.category.name} · {place._count.reviews} reviews</p>
                </div>
                <Badge variant={statusVariant(place.status)}>{place.status}</Badge>
                <div className="flex items-center gap-2">
                  {place.status === PlaceStatus.APPROVED && (
                    <Button size="icon" variant="ghost" asChild><Link href={`/places/${place.slug}`}><Eye className="h-4 w-4" /></Link></Button>
                  )}
                  <Button size="icon" variant="ghost" asChild><Link href={`/places/edit/${place.id}`}><Pencil className="h-4 w-4" /></Link></Button>
                  <DeletePlaceButton placeId={place.id} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
