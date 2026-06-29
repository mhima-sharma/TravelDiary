import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { PlaceStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const q = searchParams.get("q");
  const category = searchParams.get("category");
  const page = parseInt(searchParams.get("page") || "1");
  const take = parseInt(searchParams.get("limit") || "12");
  const skip = (page - 1) * take;

  const where: Record<string, unknown> = { status: PlaceStatus.APPROVED };
  if (q) where.OR = [
    { title: { contains: q } },
    { city: { contains: q } },
    { state: { contains: q } },
  ];
  if (category) where.category = { slug: category };

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

  return NextResponse.json({ places, total, page, pages: Math.ceil(total / take) });
}
