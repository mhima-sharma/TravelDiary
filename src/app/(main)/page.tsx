import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Tripzify – Discover Amazing Places",
  description: "Explore thousands of incredible travel destinations. Discover hill stations, beaches, temples, and hidden gems across India and the world.",
  alternates: { canonical: process.env.NEXT_PUBLIC_APP_URL },
  openGraph: {
    title: "Tripzify – Discover Amazing Places",
    description: "Explore thousands of incredible travel destinations across India and the world.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Tripzify" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tripzify – Discover Amazing Places",
    description: "Explore thousands of incredible travel destinations across India and the world.",
    images: ["/og-image.png"],
  },
};
import { Search, MapPin, ArrowRight, Mountain, Waves, Landmark, TreePine, Droplets, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlaceCard } from "@/components/shared/place-card";
import { PlaceCardSkeleton } from "@/components/shared/place-card-skeleton";
import { AdCard } from "@/components/shared/ad-card";
import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";
import { PlaceStatus } from "@prisma/client";

export const revalidate = 300;

const getActiveAds = unstable_cache(
  () => db.advertisement.findMany({ where: { isActive: true }, orderBy: { createdAt: "desc" } }),
  ["active-ads"],
  { revalidate: 300, tags: ["ads"] }
);

const getFeaturedPlaces = unstable_cache(
  () =>
    db.place.findMany({
      where: { status: PlaceStatus.APPROVED },
      orderBy: { averageRating: "desc" },
      take: 6,
      include: {
        category: { select: { name: true, slug: true, icon: true } },
        user: { select: { id: true, name: true, image: true } },
        images: { select: { id: true, url: true, alt: true }, take: 1 },
        _count: { select: { reviews: true, favorites: true } },
      },
    }),
  ["featured-places"],
  { revalidate: 300, tags: ["places"] }
);

const getRecentPlaces = unstable_cache(
  () =>
    db.place.findMany({
      where: { status: PlaceStatus.APPROVED },
      orderBy: { createdAt: "desc" },
      take: 3,
      include: {
        category: { select: { name: true, slug: true, icon: true } },
        user: { select: { id: true, name: true, image: true } },
        images: { select: { id: true, url: true, alt: true }, take: 1 },
        _count: { select: { reviews: true, favorites: true } },
      },
    }),
  ["recent-places"],
  { revalidate: 300, tags: ["places"] }
);

const categories = [
  { name: "Hill Stations", slug: "hill-stations", icon: Mountain, color: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" },
  { name: "Beaches", slug: "beaches", icon: Waves, color: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" },
  { name: "Historical", slug: "historical-places", icon: Landmark, color: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300" },
  { name: "Wildlife", slug: "wildlife", icon: TreePine, color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300" },
  { name: "Lakes", slug: "lakes", icon: Droplets, color: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300" },
  { name: "Adventure", slug: "adventure", icon: Zap, color: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300" },
];

async function FeaturedPlaces() {
  const places = await getFeaturedPlaces();

  if (places.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No places yet. <Link href="/places/new" className="text-primary hover:underline">Be the first to add one!</Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {places.map((place) => <PlaceCard key={place.id} place={place} />)}
    </div>
  );
}

async function RecentPlaces() {
  const places = await getRecentPlaces();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {places.map((place) => <PlaceCard key={place.id} place={place} />)}
    </div>
  );
}

async function SponsoredSection() {
  const ads = await getActiveAds();
  if (ads.length === 0) return null;

  return (
    <section className="py-14 container mx-auto px-4">
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-2xl font-bold">Sponsored</h2>
        <span className="text-xs font-semibold uppercase tracking-widest bg-primary text-primary-foreground px-2 py-0.5 rounded-full">Ad</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {ads.map((ad) => (
          <AdCard key={ad.id} {...ad} />
        ))}
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-[600px] flex items-center justify-center bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1920"
          alt=""
          fill
          priority
          className="object-cover opacity-20"
          sizes="100vw"
        />
        <div className="relative z-10 container mx-auto px-4 text-center py-20">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Discover Your Next<br />
            <span className="text-yellow-300">Adventure</span>
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Explore thousands of incredible destinations. Find hidden gems, share your stories.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <form action="/explore">
                <Input
                  name="q"
                  placeholder="Search places, cities, destinations..."
                  className="pl-10 h-12 bg-white text-gray-900 border-0 text-base w-full"
                />
              </form>
            </div>
            <Button size="lg" variant="secondary" asChild className="h-12 px-8">
              <Link href="/explore">Explore Now</Link>
            </Button>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-8 text-sm text-blue-200">
            {["Hill Stations", "Beaches", "Temples", "Wildlife"].map((tag) => (
              <Link key={tag} href={`/explore?q=${tag}`} className="hover:text-white transition-colors">
                # {tag}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold">Browse by Category</h2>
            <p className="text-muted-foreground mt-1">Find places by type of destination</p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/categories">View All <ArrowRight className="ml-1 h-4 w-4" /></Link>
          </Button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map(({ name, slug, icon: Icon, color }) => (
            <Link key={slug} href={`/categories/${slug}`}
              className="flex flex-col items-center gap-3 p-6 rounded-xl border hover:shadow-md transition-all hover:-translate-y-1 bg-card">
              <div className={`p-3 rounded-full ${color}`}>
                <Icon className="h-6 w-6" />
              </div>
              <span className="text-sm font-medium text-center">{name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Top Rated */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold">Top Rated Places</h2>
              <p className="text-muted-foreground mt-1">Highest rated by our community</p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/explore?sort=rating">See All <ArrowRight className="ml-1 h-4 w-4" /></Link>
            </Button>
          </div>
          <Suspense fallback={
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => <PlaceCardSkeleton key={i} />)}
            </div>
          }>
            <FeaturedPlaces />
          </Suspense>
        </div>
      </section>

      {/* Recently Added */}
      <section className="py-16 container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold">Recently Added</h2>
            <p className="text-muted-foreground mt-1">Fresh discoveries from our community</p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/explore?sort=newest">See All <ArrowRight className="ml-1 h-4 w-4" /></Link>
          </Button>
        </div>
        <Suspense fallback={
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => <PlaceCardSkeleton key={i} />)}
          </div>
        }>
          <RecentPlaces />
        </Suspense>
      </section>

      {/* Sponsored Ads */}
      <Suspense fallback={null}>
        <SponsoredSection />
      </Suspense>

      {/* CTA */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Know a Hidden Gem?</h2>
          <p className="text-xl opacity-90 mb-8 max-w-xl mx-auto">
            Share your favorite travel destinations with millions of explorers worldwide.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/places/new"><MapPin className="mr-2 h-5 w-5" />Add a Place</Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="border-white text-white bg-transparent hover:bg-white/10 hover:text-white">
              <Link href="/explore">Explore Places</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
