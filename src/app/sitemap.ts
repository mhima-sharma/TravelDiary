import { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { PlaceStatus } from "@prisma/client";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const [places, categories] = await Promise.all([
    db.place.findMany({ where: { status: PlaceStatus.APPROVED }, select: { slug: true, updatedAt: true } }),
    db.category.findMany({ select: { slug: true, updatedAt: true } }),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${base}/explore`, lastModified: new Date(), changeFrequency: "hourly", priority: 0.9 },
    { url: `${base}/categories`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  ];

  const placeRoutes: MetadataRoute.Sitemap = places.map((p) => ({
    url: `${base}/places/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${base}/categories/${c.slug}`,
    lastModified: c.updatedAt,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...placeRoutes, ...categoryRoutes];
}
