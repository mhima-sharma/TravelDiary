import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Star, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { StarRating } from "@/components/shared/star-rating";
import { EmptyState } from "@/components/shared/empty-state";
import { formatDate } from "@/lib/utils";
import { BackButton } from "@/components/shared/back-button";

export default async function MyReviewsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const reviews = await db.review.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { place: { select: { id: true, title: true, slug: true, featuredImage: true, city: true, state: true } } },
  });

  return (
    <div className="space-y-6">
      <BackButton href="/dashboard" label="Dashboard" />
      <h1 className="text-2xl font-bold">My Reviews</h1>
      {reviews.length === 0 ? (
        <EmptyState icon={Star} title="No reviews yet" description="Share your experiences by reviewing places you've visited." action={{ label: "Explore Places", href: "/explore" }} />
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <Link href={`/places/${review.place.slug}`} className="font-semibold hover:text-primary">{review.place.title}</Link>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>{review.place.city}, {review.place.state}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <StarRating rating={review.rating} size="sm" />
                    <p className="text-xs text-muted-foreground mt-1">{formatDate(review.createdAt)}</p>
                  </div>
                </div>
                {review.title && <p className="font-medium mt-3">{review.title}</p>}
                <p className="text-sm text-muted-foreground mt-1 line-clamp-3">{review.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
