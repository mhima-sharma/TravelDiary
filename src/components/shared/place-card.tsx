import Image from "next/image";
import Link from "next/link";
import { MapPin, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PlaceCardProps {
  place: {
    id: string;
    title: string;
    slug: string;
    shortDescription: string;
    city: string;
    state: string;
    country: string;
    featuredImage: string | null;
    averageRating: number;

    category: { name: string; slug: string };
    _count: { reviews: number };
  };
  className?: string;
  priority?: boolean;
}

export function PlaceCard({ place, className, priority = false }: PlaceCardProps) {
  return (
    <Link href={`/places/${place.slug}`}>
      <Card className={cn("group overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1", className)}>
        <div className="relative h-48 overflow-hidden">
          <Image
            src={place.featuredImage || "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800"}
            alt={place.title}
            fill
            priority={priority}
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute top-3 left-3">
            <Badge variant="secondary" className="bg-white/90 text-gray-700 backdrop-blur-sm">
              {place.category.name}
            </Badge>
          </div>
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
            {place.title}
          </h3>
          <div className="flex items-center gap-1 text-muted-foreground text-sm mt-1">
            <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="line-clamp-1">{place.city}, {place.state}</span>
          </div>
          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{place.shortDescription}</p>
          <div className="flex items-center justify-between mt-3 pt-3 border-t">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">{place.averageRating.toFixed(1)}</span>
              <span className="text-xs text-muted-foreground">({place._count.reviews})</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
