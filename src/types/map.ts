export interface WorldCountryProperties {
  name: string;
}

export interface IndiaStateProperties {
  name: string;
  iso_3166_2: string | null;
  type_en: string | null;
}

export interface IndiaStateInfo {
  name: string;
  slug: string;
}

/** Matches the `select` shape returned by GET /api/places */
export interface MapPlace {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  city: string;
  state: string;
  country: string;
  featuredImage: string | null;
  averageRating: number;
  views: number;
  createdAt: string;
  category: { name: string; slug: string };
  _count: { reviews: number };
}

export interface PlacesApiResponse {
  places: MapPlace[];
  total: number;
  page: number;
  pages: number;
}
