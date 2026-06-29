import { Suspense } from "react";
import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";

const getCategories = unstable_cache(
  () => db.category.findMany({ orderBy: { name: "asc" } }),
  ["categories"],
  { revalidate: 3600, tags: ["categories"] }
);
import { PlaceCard } from "@/components/shared/place-card";
import { PlaceCardSkeleton } from "@/components/shared/place-card-skeleton";
import { AdCard } from "@/components/shared/ad-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { PlaceStatus } from "@prisma/client";
import { Search, Map, MapPin } from "lucide-react";
import { BackButton } from "@/components/shared/back-button";
import { NearMeButton } from "@/components/places/near-me-button";
import type { SearchParams } from "@/types";
import type { Metadata } from "next";

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export const metadata: Metadata = {
  title: "Explore Places",
  description: "Discover amazing travel destinations",
};

async function PlacesList({ searchParams }: { searchParams: SearchParams }) {
  const { q, category, city, state, country, rating, sort = "newest", page = "1", lat, lng } = searchParams;
  const pageNum = parseInt(page, 10);
  const take = 12;
  const skip = (pageNum - 1) * take;

  const where: Record<string, unknown> = { status: PlaceStatus.APPROVED };
  if (q) where.OR = [
    { title: { contains: q } },
    { city: { contains: q } },
    { state: { contains: q } },
    { country: { contains: q } },
  ];
  if (category) where.category = { slug: category };
  if (city) where.city = { contains: city };
  if (state) where.state = { contains: state };
  if (country) where.country = { contains: country };
  if (rating) where.averageRating = { gte: parseFloat(rating) };

  const include = {
    category: { select: { name: true, slug: true, icon: true } },
    user: { select: { id: true, name: true, image: true } },
    images: { select: { id: true, url: true, alt: true }, take: 1 },
    _count: { select: { reviews: true, favorites: true } },
  };

  const isNearest = sort === "nearest" && lat && lng;
  const userLat = lat ? parseFloat(lat) : null;
  const userLng = lng ? parseFloat(lng) : null;

  let places: Awaited<ReturnType<typeof db.place.findMany<{ include: typeof include }>>>;
  let total: number;

  if (isNearest && userLat !== null && userLng !== null) {
    const allPlaces = await db.place.findMany({ where, include });
    allPlaces.sort((a, b) => {
      const distA = a.latitude && a.longitude
        ? haversineKm(userLat, userLng, a.latitude, a.longitude)
        : Infinity;
      const distB = b.latitude && b.longitude
        ? haversineKm(userLat, userLng, b.latitude, b.longitude)
        : Infinity;
      return distA - distB;
    });
    total = allPlaces.length;
    places = allPlaces.slice(skip, skip + take);
  } else {
    const orderBy =
      sort === "rating" ? { averageRating: "desc" as const } :
      sort === "popular" ? { views: "desc" as const } :
      { createdAt: "desc" as const };

    [places, total] = await Promise.all([
      db.place.findMany({ where, orderBy, take, skip, include }),
      db.place.count({ where }),
    ]);
  }

  const [activeAds] = await Promise.all([
    db.advertisement.findMany({ where: { isActive: true }, orderBy: { createdAt: "desc" } }),
  ]);

  if (places.length === 0) {
    return <EmptyState icon={Map} title="No places found" description="Try different search terms or filters." />;
  }

  // Build interleaved grid: inject 1 ad after every 6 place cards
  const AD_INTERVAL = 6;
  const gridItems: Array<{ type: "place"; data: typeof places[0] } | { type: "ad"; data: typeof activeAds[0]; key: string }> = [];
  let adIndex = 0;
  places.forEach((place, i) => {
    gridItems.push({ type: "place", data: place });
    if (activeAds.length > 0 && (i + 1) % AD_INTERVAL === 0) {
      gridItems.push({ type: "ad", data: activeAds[adIndex % activeAds.length], key: `ad-${i}` });
      adIndex++;
    }
  });

  return (
    <div>
      <p className="text-sm text-muted-foreground mb-4">{total} places found</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {gridItems.map((item) =>
          item.type === "place"
            ? <PlaceCard key={item.data.id} place={item.data} />
            : <AdCard key={item.key} {...item.data} />
        )}
      </div>
      {total > take && (
        <div className="flex justify-center gap-2 mt-8">
          {pageNum > 1 && (
            <Button variant="outline" asChild>
              <a href={`?${new URLSearchParams({ ...searchParams, page: String(pageNum - 1) })}`}>Previous</a>
            </Button>
          )}
          {pageNum * take < total && (
            <Button variant="outline" asChild>
              <a href={`?${new URLSearchParams({ ...searchParams, page: String(pageNum + 1) })}`}>Next</a>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export default async function ExplorePage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const categories = await getCategories();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <BackButton href="/" label="Home" />
        <h1 className="text-3xl font-bold mb-2 mt-2">Explore Places</h1>
        <p className="text-muted-foreground">Discover amazing destinations from around the world</p>
      </div>

      <form className="flex flex-wrap gap-3 mb-8 p-4 border rounded-xl bg-card">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input name="q" defaultValue={params.q} placeholder="Search places..." className="pl-9" />
        </div>
        <Select name="category" defaultValue={params.category}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((c) => <SelectItem key={c.id} value={c.slug}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select name="sort" defaultValue={params.sort || "newest"}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Sort by" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="popular">Most Popular</SelectItem>
            <SelectItem value="rating">Highest Rated</SelectItem>
          </SelectContent>
        </Select>
        <Select name="rating" defaultValue={params.rating}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Min Rating" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any Rating</SelectItem>
            <SelectItem value="4">4+ Stars</SelectItem>
            <SelectItem value="3">3+ Stars</SelectItem>
          </SelectContent>
        </Select>
        <Button type="submit">Search</Button>
        <Suspense fallback={
          <Button type="button" variant="outline" disabled className="shrink-0">
            <MapPin className="h-4 w-4 mr-2" />Near Me
          </Button>
        }>
          <NearMeButton />
        </Suspense>
      </form>

      {params.q && (
        <div className="mb-4 flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Results for:</span>
          <Badge variant="secondary">{params.q}</Badge>
        </div>
      )}

      <Suspense fallback={
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => <PlaceCardSkeleton key={i} />)}
        </div>
      }>
        <PlacesList searchParams={params} />
      </Suspense>
    </div>
  );
}
