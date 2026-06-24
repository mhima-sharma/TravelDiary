import { UserRole, PlaceStatus, ReportReason } from "@prisma/client";

export type { UserRole, PlaceStatus, ReportReason };

export type SafeUser = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: UserRole;
  bio: string | null;
  createdAt: Date;
  isBanned: boolean;
};

export type PlaceWithRelations = {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  city: string;
  state: string;
  country: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  bestTimeToVisit: string | null;
  entryFee: string | null;
  openingHours: string | null;
  travelTips: string | null;
  thingsToDo: string | null;
  nearbyAttractions: string | null;
  featuredImage: string | null;
  status: PlaceStatus;
  averageRating: number;
  views: number;
  createdAt: Date;
  updatedAt: Date;
  category: { id: string; name: string; slug: string; icon: string | null };
  user: { id: string; name: string | null; image: string | null };
  images: { id: string; url: string; alt: string | null }[];
  _count: { reviews: number; favorites: number };
};

export type ReviewWithUser = {
  id: string;
  rating: number;
  title: string | null;
  body: string;
  createdAt: Date;
  updatedAt: Date;
  user: { id: string; name: string | null; image: string | null };
};

export type SearchParams = {
  q?: string;
  category?: string;
  city?: string;
  state?: string;
  country?: string;
  rating?: string;
  season?: string;
  sort?: "newest" | "popular" | "rating";
  page?: string;
};
