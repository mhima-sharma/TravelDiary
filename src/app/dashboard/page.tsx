import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { PlaceStatus } from "@prisma/client";
import { MapPin, Heart, Star, Plus, ArrowRight, Eye, Globe, Bookmark } from "lucide-react";
import Image from "next/image";
import { VisitStatus } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const [placeCount, favCount, reviewCount, recentPlaces, visitedPlaces, bucketList] = await Promise.all([
    db.place.count({ where: { userId: session.user.id } }),
    db.favorite.count({ where: { userId: session.user.id } }),
    db.review.count({ where: { userId: session.user.id } }),
    db.place.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { category: { select: { name: true } } },
    }),
    db.placeVisit.findMany({
      where: {
        userId: session.user.id,
        status: { in: [VisitStatus.VISITED, VisitStatus.VISITED_AGAIN] },
      },
      include: { place: { select: { country: true, state: true } } },
    }),
    db.placeVisit.findMany({
      where: { userId: session.user.id, status: VisitStatus.WANT_TO_VISIT },
      orderBy: { createdAt: "desc" },
      take: 4,
      include: {
        place: {
          select: { id: true, title: true, slug: true, featuredImage: true, city: true, state: true },
        },
      },
    }),
  ]);

  const placesVisited = visitedPlaces.length;
  const countriesExplored = new Set(visitedPlaces.map((v) => v.place.country)).size;
  const statesExplored = new Set(visitedPlaces.map((v) => `${v.place.state}|${v.place.country}`)).size;

  const statusColor = (s: PlaceStatus) => ({
    APPROVED: "success",
    PENDING: "warning",
    REJECTED: "destructive",
  }[s] as "success" | "warning" | "destructive");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {session.user.name?.split(" ")[0]}!</h1>
          <p className="text-muted-foreground text-sm mt-1">Here's what's happening with your places</p>
        </div>
        <Button asChild>
          <Link href="/places/new"><Plus className="h-4 w-4 mr-2" />Add Place</Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "My Places", value: placeCount, icon: MapPin, href: "/dashboard/my-places", color: "text-blue-500" },
          { label: "Favorites", value: favCount, icon: Heart, href: "/dashboard/favorites", color: "text-red-500" },
          { label: "Bucket List", value: bucketList.length, icon: Bookmark, href: "/dashboard/bucket-list", color: "text-blue-400" },
          { label: "Reviews", value: reviewCount, icon: Star, href: "/dashboard/reviews", color: "text-yellow-500" },
        ].map(({ label, value, icon: Icon, href, color }) => (
          <Link key={href} href={href}>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6 flex items-center gap-4">
                <div className={`p-3 rounded-full bg-muted ${color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{value}</p>
                  <p className="text-sm text-muted-foreground">{label}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Travel Stats */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">My Travel Stats</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Places Visited", value: placesVisited, icon: Eye, color: "text-green-500" },
            { label: "Countries Explored", value: countriesExplored, icon: Globe, color: "text-indigo-500" },
            { label: "States Explored", value: statesExplored, icon: Bookmark, color: "text-purple-500" },
          ].map(({ label, value, icon: Icon, color }) => (
            <Card key={label}>
              <CardContent className="p-6 flex items-center gap-4">
                <div className={`p-3 rounded-full bg-muted ${color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{value}</p>
                  <p className="text-sm text-muted-foreground">{label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Bucket List Preview */}
      {bucketList.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Bookmark className="h-5 w-5 text-blue-400" /> Bucket List
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/bucket-list">View all <ArrowRight className="ml-1 h-3 w-3" /></Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {bucketList.map(({ place }) => (
                <Link key={place.id} href={`/places/${place.slug}`}
                  className="group flex flex-col gap-2 rounded-xl border overflow-hidden hover:shadow-md transition-shadow">
                  <div className="relative h-24 bg-muted">
                    {place.featuredImage
                      ? <Image src={place.featuredImage} alt={place.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                      : <div className="w-full h-full flex items-center justify-center"><MapPin className="h-6 w-6 text-muted-foreground" /></div>
                    }
                  </div>
                  <div className="px-2 pb-2">
                    <p className="text-xs font-semibold line-clamp-1 group-hover:text-primary transition-colors">{place.title}</p>
                    <p className="text-[10px] text-muted-foreground">{place.city}, {place.state}</p>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Recent Places</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/my-places">View all <ArrowRight className="ml-1 h-3 w-3" /></Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recentPlaces.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No places yet.</p>
              <Button asChild size="sm" className="mt-3"><Link href="/places/new">Add your first place</Link></Button>
            </div>
          ) : (
            <div className="space-y-3">
              {recentPlaces.map((place) => (
                <div key={place.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <Link href={`/places/${place.slug}`} className="font-medium hover:text-primary">{place.title}</Link>
                    <p className="text-xs text-muted-foreground">{place.category.name} · {formatDate(place.createdAt)}</p>
                  </div>
                  <Badge variant={statusColor(place.status)}>{place.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
