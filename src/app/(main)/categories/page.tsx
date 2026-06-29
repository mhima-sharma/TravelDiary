import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";
import { PlaceStatus } from "@prisma/client";

export const dynamic = "force-dynamic";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Categories",
  description: "Browse travel destinations by category",
};

export default async function CategoriesPage() {
  const categories = await db.category.findMany({
    include: { _count: { select: { places: { where: { status: PlaceStatus.APPROVED } } } } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold mb-3">Browse by Category</h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          Find the perfect destination for every type of traveler
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <Link key={cat.id} href={`/categories/${cat.slug}`}>
            <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden">
              <div className="relative h-44 overflow-hidden">
                {cat.image ? (
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/30 flex items-center justify-center">
                    <span className="text-6xl">{cat.icon || "🗺️"}</span>
                  </div>
                )}
              </div>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">{cat.name}</h3>
                    {cat.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{cat.description}</p>}
                  </div>
                  <Badge variant="secondary" className="ml-2 flex-shrink-0">
                    <MapPin className="h-3 w-3 mr-1" />{cat._count.places}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
