import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { PlaceStatus } from "@prisma/client";
import { MapPin, Heart, Star, Clock, Plus, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const [placeCount, favCount, reviewCount, recentPlaces] = await Promise.all([
    db.place.count({ where: { userId: session.user.id } }),
    db.favorite.count({ where: { userId: session.user.id } }),
    db.review.count({ where: { userId: session.user.id } }),
    db.place.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { category: { select: { name: true } } },
    }),
  ]);

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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "My Places", value: placeCount, icon: MapPin, href: "/dashboard/my-places", color: "text-blue-500" },
          { label: "Favorites", value: favCount, icon: Heart, href: "/dashboard/favorites", color: "text-red-500" },
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
