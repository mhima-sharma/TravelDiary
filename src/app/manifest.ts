import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Tripzify – Discover Amazing Places",
    short_name: "Tripzify",
    description:
      "Explore thousands of incredible travel destinations. Discover hill stations, beaches, temples, and hidden gems.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: "#0ea5e9",
    categories: ["travel", "lifestyle", "navigation"],
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        // @ts-expect-error – Next.js type doesn't include purpose yet, but it's valid
        purpose: "any maskable",
      },
    ],
    screenshots: [],
  };
}
