"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { ImageUploadInput } from "@/components/shared/image-upload-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlaceSchema, type PlaceInput } from "@/schemas";
import { createPlace, updatePlace } from "@/actions/places";
import { slugify } from "@/lib/utils";

interface Category { id: string; name: string; slug: string }
interface PlaceFormProps {
  categories: Category[];
  initialData?: PlaceInput & { id: string; images?: string[] };
}

export function PlaceForm({ categories, initialData }: PlaceFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [imageUrls, setImageUrls] = useState<string[]>(initialData?.images || []);
  const [featuredImages, setFeaturedImages] = useState<string[]>(
    initialData?.featuredImage ? [initialData.featuredImage] : []
  );

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<PlaceInput>({
    resolver: zodResolver(PlaceSchema),
    defaultValues: initialData || {},
  });

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue("title", e.target.value);
    if (!initialData) setValue("slug", slugify(e.target.value));
  };

  const onSubmit = (data: PlaceInput) => {
    startTransition(async () => {
      const result = initialData
        ? await updatePlace(initialData.id, data, imageUrls)
        : await createPlace(data, imageUrls);
      if (result.error) { toast.error(result.error); return; }
      toast.success(result.success);
      router.push("/dashboard/my-places");
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Info */}
      <Card>
        <CardHeader><CardTitle className="text-lg">Basic Information</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="title">Place Name *</Label>
              <Input id="title" placeholder="e.g. Manali Valley" {...register("title")} onChange={handleTitleChange} />
              {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="slug">URL Slug *</Label>
              <Input id="slug" placeholder="e.g. manali-valley" {...register("slug")} />
              {errors.slug && <p className="text-xs text-destructive">{errors.slug.message}</p>}
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="categoryId">Category *</Label>
            <Select onValueChange={(v) => setValue("categoryId", v)} defaultValue={initialData?.categoryId}>
              <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
              <SelectContent>
                {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
            {errors.categoryId && <p className="text-xs text-destructive">{errors.categoryId.message}</p>}
          </div>
          <div className="space-y-1">
            <Label htmlFor="shortDescription">Short Description * (max 300 chars)</Label>
            <Textarea id="shortDescription" placeholder="A brief description shown in cards and search results" rows={2} {...register("shortDescription")} />
            {errors.shortDescription && <p className="text-xs text-destructive">{errors.shortDescription.message}</p>}
          </div>
          <div className="space-y-1">
            <Label htmlFor="description">Full Description *</Label>
            <Textarea id="description" placeholder="Detailed description of the place..." rows={5} {...register("description")} />
            {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
          </div>
        </CardContent>
      </Card>

      {/* Location */}
      <Card>
        <CardHeader><CardTitle className="text-lg">Location</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <Label>City *</Label>
              <Input placeholder="e.g. Manali" {...register("city")} />
              {errors.city && <p className="text-xs text-destructive">{errors.city.message}</p>}
            </div>
            <div className="space-y-1">
              <Label>State *</Label>
              <Input placeholder="e.g. Himachal Pradesh" {...register("state")} />
              {errors.state && <p className="text-xs text-destructive">{errors.state.message}</p>}
            </div>
            <div className="space-y-1">
              <Label>Country *</Label>
              <Input placeholder="e.g. India" {...register("country")} />
              {errors.country && <p className="text-xs text-destructive">{errors.country.message}</p>}
            </div>
          </div>
          <div className="space-y-1">
            <Label>Address</Label>
            <Input placeholder="Street address or landmark" {...register("address")} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Latitude</Label>
              <Input type="number" step="any" placeholder="e.g. 32.2396" {...register("latitude", { valueAsNumber: true })} />
            </div>
            <div className="space-y-1">
              <Label>Longitude</Label>
              <Input type="number" step="any" placeholder="e.g. 77.1887" {...register("longitude", { valueAsNumber: true })} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Visit Info */}
      <Card>
        <CardHeader><CardTitle className="text-lg">Visit Information</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <Label>Best Time to Visit</Label>
              <Input placeholder="e.g. Oct–Feb" {...register("bestTimeToVisit")} />
            </div>
            <div className="space-y-1">
              <Label>Entry Fee</Label>
              <Input placeholder="e.g. Free / ₹50 adults" {...register("entryFee")} />
            </div>
            <div className="space-y-1">
              <Label>Opening Hours</Label>
              <Input placeholder="e.g. 9 AM – 6 PM" {...register("openingHours")} />
            </div>
          </div>
          <div className="space-y-1">
            <Label>Things to Do</Label>
            <Textarea placeholder="Activities, experiences, and highlights..." rows={3} {...register("thingsToDo")} />
          </div>
          <div className="space-y-1">
            <Label>Travel Tips</Label>
            <Textarea placeholder="Useful tips for visitors..." rows={3} {...register("travelTips")} />
          </div>
          <div className="space-y-1">
            <Label>Nearby Attractions</Label>
            <Textarea placeholder="Other places to visit nearby..." rows={2} {...register("nearbyAttractions")} />
          </div>
        </CardContent>
      </Card>

      {/* Images */}
      <Card>
        <CardHeader><CardTitle className="text-lg">Images</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <ImageUploadInput
            label="Featured Image"
            images={featuredImages}
            max={1}
            onChange={(urls) => {
              setFeaturedImages(urls);
              setValue("featuredImage", urls[0] ?? "");
            }}
          />
          <ImageUploadInput
            label="Gallery Images (optional extra photos)"
            images={imageUrls}
            onChange={setImageUrls}
          />
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button type="submit" size="lg" disabled={isPending} className="flex-1">
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {initialData ? "Update Place" : "Submit for Review"}
        </Button>
        <Button type="button" variant="outline" size="lg" onClick={() => router.back()}>Cancel</Button>
      </div>
    </form>
  );
}
