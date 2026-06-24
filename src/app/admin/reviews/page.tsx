import { db } from "@/lib/db";
import { Star, MessageSquare } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { StarRating } from "@/components/shared/star-rating";
import { AdminDeleteReviewButton } from "./delete-review-button";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = { title: "Reviews" };

export default async function AdminReviewsPage() {
  const reviews = await db.review.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, name: true, image: true } },
      place: { select: { id: true, title: true, slug: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Reviews</h1>
        <span className="text-sm text-muted-foreground">{reviews.length} total</span>
      </div>

      {reviews.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 border rounded-xl text-center">
          <MessageSquare className="h-10 w-10 text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No reviews yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <div key={review.id} className="p-4 border rounded-xl bg-card">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  {/* Avatar */}
                  <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {review.user.image
                      ? <Image src={review.user.image} alt={review.user.name ?? ""} width={36} height={36} className="object-cover" />
                      : <span className="text-sm font-medium">{review.user.name?.[0] ?? "?"}</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mb-1">
                      <span className="font-medium text-sm">{review.user.name ?? "Anonymous"}</span>
                      <span className="text-muted-foreground text-xs">on</span>
                      <Link href={`/places/${review.place.slug}`} className="text-primary text-sm hover:underline truncate">
                        {review.place.title}
                      </Link>
                      <span className="text-muted-foreground text-xs ml-auto">{formatDate(review.createdAt)}</span>
                    </div>
                    <StarRating rating={review.rating} size="sm" />
                    {review.title && <p className="font-medium text-sm mt-1">{review.title}</p>}
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{review.body}</p>
                  </div>
                </div>
                <AdminDeleteReviewButton id={review.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
