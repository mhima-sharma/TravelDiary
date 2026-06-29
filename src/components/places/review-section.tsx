"use client";
import { useState, useTransition } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Pencil, Trash2, User } from "lucide-react";
import { ImageUploadInput } from "@/components/shared/image-upload-input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { StarRating } from "@/components/shared/star-rating";
import { ReviewSchema, type ReviewInput } from "@/schemas";
import { createReview, updateReview, deleteReview } from "@/actions/reviews";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

interface ReviewImage { id: string; url: string; alt: string | null }

interface ReviewSectionProps {
  place: {
    id: string;
    slug: string;
    reviews: {
      id: string;
      rating: number;
      title: string | null;
      body: string;
      createdAt: Date;
      updatedAt: Date;
      userId: string;
      user: { id: string; name: string | null; image: string | null };
      images: ReviewImage[];
    }[];
  };
  session: { user: { id: string; name?: string | null; image?: string | null } } | null;
  userReview: { id: string; rating: number; title: string | null; body: string; images: ReviewImage[] } | null;
}


function ReviewForm({
  placeId,
  existingReview,
  onDone,
}: {
  placeId: string;
  existingReview?: { id: string; rating: number; title: string | null; body: string; images: ReviewImage[] } | null;
  onDone?: () => void;
}) {
  const [rating, setRating] = useState(existingReview?.rating ?? 0);
  const [imageUrls, setImageUrls] = useState<string[]>(existingReview?.images.map((i) => i.url) ?? []);
  const [isPending, startTransition] = useTransition();

  const { register, handleSubmit, formState: { errors }, setValue } = useForm<ReviewInput>({
    resolver: zodResolver(ReviewSchema),
    defaultValues: {
      rating: existingReview?.rating ?? 0,
      title: existingReview?.title ?? "",
      body: existingReview?.body ?? "",
      images: existingReview?.images.map((i) => i.url) ?? [],
    },
  });

  const handleRatingChange = (newRating: number) => {
    setRating(newRating);
    setValue("rating", newRating, { shouldValidate: true });
  };

  const onSubmit = (data: ReviewInput) => {
    data.images = imageUrls;
    if (data.rating < 1) { toast.error("Please select a rating"); return; }
    startTransition(async () => {
      const result = existingReview
        ? await updateReview(existingReview.id, data)
        : await createReview(placeId, data);
      if (result.error) toast.error(result.error);
      else { toast.success(result.success); onDone?.(); }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label>Your Rating</Label>
        <StarRating rating={rating} interactive onRate={handleRatingChange} size="lg" />
      </div>
      <div className="space-y-1">
        <Label htmlFor="title">Review Title (optional)</Label>
        <Input id="title" placeholder="Summarize your experience" {...register("title")} />
      </div>
      <div className="space-y-1">
        <Label htmlFor="body">Your Review</Label>
        <Textarea id="body" placeholder="Share your experience..." rows={4} {...register("body")} />
        {errors.body && <p className="text-xs text-destructive">{errors.body.message}</p>}
      </div>
      <ImageUploadInput label="Photos (optional)" images={imageUrls} onChange={setImageUrls} />
      <div className="flex gap-2">
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {existingReview ? "Update Review" : "Post Review"}
        </Button>
        {onDone && <Button type="button" variant="outline" onClick={onDone}>Cancel</Button>}
      </div>
    </form>
  );
}

export function ReviewSection({ place, session, userReview }: ReviewSectionProps) {
  const [editing, setEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleDelete = (id: string) => {
    startTransition(async () => {
      const result = await deleteReview(id);
      if (result.error) toast.error(result.error);
      else toast.success(result.success);
    });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Reviews ({place.reviews.length})</h2>

      {session ? (
        <div className="p-5 border rounded-xl bg-card">
          {userReview && !editing ? (
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="font-medium">Your Review</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={() => setEditing(true)}>
                    <Pencil className="h-4 w-4 mr-1" />Edit
                  </Button>
                  <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDelete(userReview.id)} disabled={isPending}>
                    <Trash2 className="h-4 w-4 mr-1" />Delete
                  </Button>
                </div>
              </div>
              <StarRating rating={userReview.rating} />
              {userReview.title && <p className="font-medium mt-2">{userReview.title}</p>}
              <p className="text-muted-foreground mt-1">{userReview.body}</p>
              {userReview.images.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {userReview.images.map((img) => (
                    <div key={img.id} className="relative h-20 w-28 rounded-lg overflow-hidden border">
                      <Image src={img.url} alt={img.alt || ""} fill className="object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <>
              <h3 className="font-medium mb-4">{userReview ? "Edit Your Review" : "Write a Review"}</h3>
              <ReviewForm
                placeId={place.id}
                existingReview={editing ? userReview : null}
                onDone={editing ? () => setEditing(false) : undefined}
              />
            </>
          )}
        </div>
      ) : (
        <div className="p-5 border rounded-xl text-center bg-muted/30">
          <p className="text-muted-foreground mb-3">Sign in to write a review</p>
          <Button asChild size="sm"><Link href="/login">Sign In</Link></Button>
        </div>
      )}

      <div className="space-y-4">
        {place.reviews
          .filter((r) => !session || r.userId !== session.user.id)
          .map((review) => (
            <div key={review.id} className="flex gap-4 p-4 border rounded-xl">
              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
                {review.user.image ? (
                  <Image src={review.user.image} alt={review.user.name || ""} width={40} height={40} className="object-cover" />
                ) : (
                  <User className="h-5 w-5" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <p className="font-medium">{review.user.name || "Anonymous"}</p>
                    <StarRating rating={review.rating} size="sm" />
                  </div>
                  <p className="text-xs text-muted-foreground">{formatDate(review.createdAt)}</p>
                </div>
                {review.title && <p className="font-medium mt-2">{review.title}</p>}
                <p className="text-muted-foreground text-sm mt-1">{review.body}</p>
                {review.images.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {review.images.map((img) => (
                      <div key={img.id} className="relative h-20 w-28 rounded-lg overflow-hidden border">
                        <Image src={img.url} alt={img.alt || ""} fill className="object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
