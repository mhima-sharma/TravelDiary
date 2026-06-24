import { Suspense } from "react";
import { db } from "@/lib/db";
import { PlaceCard } from "@/components/shared/place-card";
import { PlaceCardSkeleton } from "@/components/shared/place-card-skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { PlaceStatus } from "@prisma/client";
import { Search, Map } from "lucide-react";
import { BackButton } from "@/components/shared/back-button";
import type { SearchParams } from "@/types";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Explore Places",
  description: "Discover amazing travel destinations",
};

async function PlacesList({ searchParams }: { searchParams: SearchParams }) {
  const { q, category, city, state, country, rating, sort = "newest", page = "1" } = searchParams;
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

  const orderBy =
    sort === "rating" ? { averageRating: "desc" as const } :
    sort === "popular" ? { views: "desc" as const } :
    { createdAt: "desc" as const };

  const [places, total] = await Promise.all([
    db.place.findMany({
      where,
      orderBy,
      take,
      skip,
      include: {
        category: { select: { name: true, slug: true, icon: true } },
        user: { select: { id: true, name: true, image: true } },
        images: { select: { id: true, url: true, alt: true }, take: 1 },
        _count: { select: { reviews: true, favorites: true } },
      },
    }),
    db.place.count({ where }),
  ]);

  if (places.length === 0) {
    return <EmptyState icon={Map} title="No places found" description="Try different search terms or filters." />;
  }

  return (
    <div>
      <p className="text-sm text-muted-foreground mb-4">{total} places found</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {places.map((p) => <PlaceCard key={p.id} place={p} />)}
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
  const categories = await db.category.findMany({ orderBy: { name: "asc" } });

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
