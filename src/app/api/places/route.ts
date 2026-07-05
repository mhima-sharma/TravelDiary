import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { PlaceStatus } from "@prisma/client";
import { getStateAliases } from "@/lib/map/india-states";
import { buildPlaceSearchWhere } from "@/lib/search/place-search";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const q = searchParams.get("q");
  const category = searchParams.get("category");
  const state = searchParams.get("state");
  const country = searchParams.get("country");
  const page = parseInt(searchParams.get("page") || "1");
  const take = parseInt(searchParams.get("limit") || "12");
  const skip = (page - 1) * take;

  const where: Record<string, unknown> = { status: PlaceStatus.APPROVED };
  if (q) {
    const searchWhere = buildPlaceSearchWhere(q);
    if (searchWhere) Object.assign(where, searchWhere);
  }
  if (category) where.category = { slug: category };
  if (state) where.state = { in: getStateAliases(state.trim()) };
  if (country) where.country = { contains: country.trim() };

  const [places, total] = await Promise.all([
    db.place.findMany({
      where,
      take,
      skip,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        shortDescription: true,
        city: true,
        state: true,
        country: true,
        featuredImage: true,
        averageRating: true,
        views: true,
        createdAt: true,
        category: { select: { name: true, slug: true } },
        _count: { select: { reviews: true } },
      },
    }),
    db.place.count({ where }),
  ]);

  return NextResponse.json(
    { places, total, page, pages: Math.ceil(total / take) },
    { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } }
  );
}
