import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
    // Serve modern formats: WebP for broad support, AVIF when available
    formats: ["image/avif", "image/webp"],
    // Increase cache TTL from default 60s to 7 days for static-ish images
    minimumCacheTTL: 604800,
  },
  // Remove console.log in production builds
  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error", "warn"] } : false,
  },
  experimental: {
    serverActions: { allowedOrigins: ["localhost:3000"] },
    // Opt in to PPR (partial pre-rendering) once stable — flag here as reminder
    // ppr: true,
  },
};

export default nextConfig;
