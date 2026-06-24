import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { PlaceStatus } from "@prisma/client";
import { PlaceCard } from "@/components/shared/place-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Map } from "lucide-react";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const cat = await db.category.findUnique({ where: { slug } });
  if (!cat) return { title: "Category Not Found" };
  return {
    title: `${cat.name} Places`,
    description: cat.description || `Explore ${cat.name} destinations`,
    openGraph: { title: `${cat.name} | TravelDiary`, description: cat.description || "" },
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = await db.category.findUnique({
    where: { slug },
    include: {
      places: {
        where: { status: PlaceStatus.APPROVED },
        include: {
          category: { select: { name: true, slug: true, icon: true } },
          user: { select: { id: true, name: true, image: true } },
          images: { select: { id: true, url: true, alt: true }, take: 1 },
          _count: { select: { reviews: true, favorites: true } },
        },
        orderBy: { averageRating: "desc" },
      },
    },
  });

  if (!category) notFound();

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-10">
        <div className="flex items-center gap-4 mb-4">
          <span className="text-5xl">{category.icon || "🗺️"}</span>
          <div>
            <h1 className="text-4xl font-bold">{category.name}</h1>
            {category.description && <p className="text-muted-foreground mt-1 text-lg">{category.description}</p>}
          </div>
        </div>
        <p className="text-muted-foreground">{category.places.length} places in this category</p>
      </div>

      {category.places.length === 0 ? (
        <EmptyState icon={Map} title="No places yet" description={`No ${category.name} destinations have been added yet.`} action={{ label: "Add a Place", href: "/places/new" }} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {category.places.map((p) => <PlaceCard key={p.id} place={p} />)}
        </div>
      )}
    </div>
  );
}
