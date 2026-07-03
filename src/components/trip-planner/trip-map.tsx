interface TripMapProps {
  lat: number;
  lon: number;
  attractions: { lat: number; lon: number }[];
}

/** Renders a static map image via our own /api/static-map proxy, so the Geoapify key never reaches the browser. */
export function TripMap({ lat, lon, attractions }: TripMapProps) {
  const markers = attractions
    .slice(0, 9)
    .map((a) => `${a.lat},${a.lon}`)
    .join("|");

  const src = `/api/static-map?lat=${lat}&lon=${lon}${markers ? `&markers=${encodeURIComponent(markers)}` : ""}`;

  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt="Map of destination and nearby attractions" className="h-72 w-full rounded-lg border object-cover" />;
}
