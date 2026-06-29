import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { PlaceStatus } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { StarRating } from "@/components/shared/star-rating";

import { PlaceCard } from "@/components/shared/place-card";
import { PlaceCardSkeleton } from "@/components/shared/place-card-skeleton";
import { ImageCarousel } from "@/components/shared/image-carousel";
import { BackButton } from "@/components/shared/back-button";
import { incrementViews } from "@/actions/places";
import { MapPin, Clock, DollarSign, Calendar, User, Eye } from "lucide-react";

import { formatDate } from "@/lib/utils";
import type { Metadata } from "next";
import { FavoriteButton } from "@/components/places/favorite-button";
import { ReviewSection } from "@/components/places/review-section";
import { ShareButton } from "@/components/places/share-button";
import { ReportButton } from "@/components/places/report-button";
import { VisitButton } from "@/components/places/visit-button";
import { getUserVisitStatus } from "@/actions/visits";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const place = await db.place.findUnique({
    where: { slug, status: PlaceStatus.APPROVED },
    include: { category: true },
  });
  if (!place) return { title: "Place Not Found" };

  return {
    title: place.title,
    description: place.shortDescription,
    openGraph: {
      title: `${place.title} | TravelDiary`,
      description: place.shortDescription,
      images: place.featuredImage ? [{ url: place.featuredImage }] : [],
    },
    twitter: { card: "summary_large_image", title: place.title, description: place.shortDescription },
  };
}

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

export default async function PlaceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await auth();

  const place = await db.place.findUnique({
    where: { slug, status: PlaceStatus.APPROVED },
    include: {
      category: true,
      user: { select: { id: true, name: true, image: true, createdAt: true } },
      images: { orderBy: { order: "asc" } },
      reviews: {
        include: {
          user: { select: { id: true, name: true, image: true } },
          images: { select: { id: true, url: true, alt: true } },
        },
        orderBy: { createdAt: "desc" },
      },
      _count: { select: { reviews: true, favorites: true } },
    },
  });

  if (!place) notFound();

  // Fire-and-forget: don't block the critical render path for a view counter
  incrementViews(place.id);

  const placeInclude = {
    category: { select: { name: true, slug: true, icon: true } },
    user: { select: { id: true, name: true, image: true } },
    images: { select: { id: true, url: true, alt: true }, take: 1 },
    _count: { select: { reviews: true, favorites: true } },
  };

  const [similarPlaces, nearbyRaw, userFavorite, userVisitStatus] = await Promise.all([
    db.place.findMany({
      where: { categoryId: place.categoryId, status: PlaceStatus.APPROVED, id: { not: place.id } },
      take: 3,
      include: placeInclude,
    }),
    db.place.findMany({
      where: { state: place.state, status: PlaceStatus.APPROVED, id: { not: place.id } },
      take: 20,
      include: placeInclude,
      orderBy: { averageRating: "desc" },
    }),
    session ? db.favorite.findUnique({
      where: { userId_placeId: { userId: session.user.id, placeId: place.id } },
    }) : null,
    session ? getUserVisitStatus(place.id) : null,
  ]);

  const nearbyPlaces = (() => {
    if (place.latitude && place.longitude) {
      return nearbyRaw
        .map((p) => ({
          ...p,
          _dist:
            p.latitude != null && p.longitude != null
              ? haversineKm(place.latitude!, place.longitude!, p.latitude, p.longitude)
              : Infinity,
        }))
        .sort((a, b) => a._dist - b._dist)
        .slice(0, 4);
    }
    return [...nearbyRaw]
      .sort((a, b) => {
        const aCity = a.city === place.city ? 0 : 1;
        const bCity = b.city === place.city ? 0 : 1;
        if (aCity !== bCity) return aCity - bCity;
        return b.averageRating - a.averageRating;
      })
      .slice(0, 4);
  })();

  const userReview = session ? place.reviews.find((r) => r.userId === session.user.id) : null;

  const allImages = [
    ...(place.featuredImage ? [{ id: "featured", url: place.featuredImage, alt: place.title }] : []),
    ...place.images,
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TouristAttraction",
    name: place.title,
    description: place.shortDescription,
    address: { "@type": "PostalAddress", addressLocality: place.city, addressRegion: place.state, addressCountry: place.country },
    aggregateRating: place._count.reviews > 0 ? { "@type": "AggregateRating", ratingValue: place.averageRating, reviewCount: place._count.reviews } : undefined,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center justify-between mb-4">
          <BackButton href="/explore" label="Back to Explore" />
          <nav className="text-sm text-muted-foreground hidden sm:flex flex-wrap items-center gap-1">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <span>/</span>
            <Link href="/explore" className="hover:text-foreground">Explore</Link>
            <span>/</span>
            <Link href={`/categories/${place.category.slug}`} className="hover:text-foreground">{place.category.name}</Link>
            <span>/</span>
            <span className="text-foreground truncate max-w-[140px]">{place.title}</span>
          </nav>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Carousel */}
            <ImageCarousel images={allImages} title={place.title} />

            {/* Title & Category */}
            <div>
              <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
                <div>
                  <Badge variant="secondary" className="mb-2">{place.category.name}</Badge>
                  <h1 className="text-3xl md:text-4xl font-bold">{place.title}</h1>
                </div>
                <div className="flex items-center gap-2">
                  {session && <VisitButton placeId={place.id} initialStatus={userVisitStatus} />}
                  {session && <FavoriteButton placeId={place.id} initialSaved={!!userFavorite} />}
                  <ShareButton />
                  {session && <ReportButton placeId={place.id} />}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{place.city}, {place.state}, {place.country}</span>
                </div>
                <div className="flex items-center gap-2">
                  <StarRating rating={place.averageRating} size="sm" />
                  <span className="text-sm font-medium">{place.averageRating.toFixed(1)}</span>
                  <span className="text-sm">({place._count.reviews} reviews)</span>
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <Eye className="h-4 w-4" />
                  <span>{place.views.toLocaleString()} views</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h2 className="text-xl font-semibold mb-3">About this place</h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{place.description}</p>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {place.bestTimeToVisit && (
                <div className="flex items-start gap-3 p-4 rounded-lg border bg-card">
                  <Calendar className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Best Time to Visit</p>
                    <p className="font-medium mt-1">{place.bestTimeToVisit}</p>
                  </div>
                </div>
              )}
              {place.entryFee && (
                <div className="flex items-start gap-3 p-4 rounded-lg border bg-card">
                  <DollarSign className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Entry Fee</p>
                    <p className="font-medium mt-1">{place.entryFee}</p>
                  </div>
                </div>
              )}
              {place.openingHours && (
                <div className="flex items-start gap-3 p-4 rounded-lg border bg-card">
                  <Clock className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Opening Hours</p>
                    <p className="font-medium mt-1">{place.openingHours}</p>
                  </div>
                </div>
              )}
              {place.address && (
                <div className="flex items-start gap-3 p-4 rounded-lg border bg-card">
                  <MapPin className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Address</p>
                    <p className="font-medium mt-1">{place.address}</p>
                  </div>
                </div>
              )}
            </div>

            {place.thingsToDo && (
              <div>
                <h2 className="text-xl font-semibold mb-3">Things to Do</h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{place.thingsToDo}</p>
              </div>
            )}

            {place.travelTips && (
              <div>
                <h2 className="text-xl font-semibold mb-3">Travel Tips</h2>
                <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-100 dark:border-blue-900">
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{place.travelTips}</p>
                </div>
              </div>
            )}

            {place.nearbyAttractions && (
              <div>
                <h2 className="text-xl font-semibold mb-3">Nearby Attractions</h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{place.nearbyAttractions}</p>
              </div>
            )}

            <Separator />
            <Suspense fallback={<div className="h-32 animate-pulse rounded-xl bg-muted" />}>
              <ReviewSection place={place} session={session} userReview={userReview ?? null} />
            </Suspense>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Map */}
            {place.latitude && place.longitude && (
              <div className="rounded-xl overflow-hidden border">
                <iframe
                  title={`Map of ${place.title}`}
                  src={`https://maps.google.com/maps?q=${place.latitude},${place.longitude}&z=13&output=embed`}
                  width="100%"
                  height="250"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full"
                />
              </div>
            )}

            {/* Contributor */}
            <div className="border rounded-xl p-5">
              <h3 className="font-semibold mb-3">Added by</h3>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                  {place.user.image ? (
                    <Image src={place.user.image} alt={place.user.name || ""} width={40} height={40} className="object-cover" />
                  ) : (
                    <User className="h-5 w-5" />
                  )}
                </div>
                <div>
                  <p className="font-medium">{place.user.name || "Anonymous"}</p>
                  <p className="text-xs text-muted-foreground">Member since {formatDate(place.user.createdAt)}</p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="border rounded-xl p-5 space-y-3">
              <h3 className="font-semibold">Statistics</h3>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total Reviews</span>
                <span className="font-medium">{place._count.reviews}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Saved by</span>
                <span className="font-medium">{place._count.favorites} people</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Added on</span>
                <span className="font-medium">{formatDate(place.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Nearby Places */}
        {nearbyPlaces.length > 0 && (
          <div className="mt-16">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-bold">Nearby Places</h2>
            </div>
            <p className="text-muted-foreground mb-6 text-sm">
              More places to explore in {place.state}
            </p>
            <Suspense fallback={<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">{Array.from({ length: 4 }).map((_, i) => <PlaceCardSkeleton key={i} />)}</div>}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {nearbyPlaces.map((p) => <PlaceCard key={p.id} place={p} />)}
              </div>
            </Suspense>
          </div>
        )}

        {/* Similar Places */}
        {similarPlaces.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Similar Places</h2>
            <Suspense fallback={<div className="grid grid-cols-1 md:grid-cols-3 gap-6">{Array.from({ length: 3 }).map((_, i) => <PlaceCardSkeleton key={i} />)}</div>}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {similarPlaces.map((p) => <PlaceCard key={p.id} place={p} />)}
              </div>
            </Suspense>
          </div>
        )}
      </div>
    </>
  );
}
