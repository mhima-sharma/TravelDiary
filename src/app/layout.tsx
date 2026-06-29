import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/shared/theme-provider";
import { Toaster } from "sonner";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/lib/auth";
import { PageTracker } from "@/components/shared/page-tracker";
import { PWARegister } from "@/components/shared/pwa-register";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { GoogleAnalytics } from "@next/third-parties/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "TravelDiary – Discover Amazing Places",
    template: "%s | TravelDiary",
  },
  description:
    "Explore thousands of incredible travel destinations. Discover hill stations, beaches, temples, and hidden gems across India and the world.",
  keywords: ["travel", "destinations", "places", "tourism", "travel diary"],
  authors: [{ name: "TravelDiary" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: "TravelDiary",
    title: "TravelDiary – Discover Amazing Places",
    description: "Explore thousands of incredible travel destinations.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "TravelDiary" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "TravelDiary – Discover Amazing Places",
    description: "Explore thousands of incredible travel destinations.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-icon.png",
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "TravelDiary",
  },
  robots: { index: true, follow: true },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0ea5e9" },
    { media: "(prefers-color-scheme: dark)", color: "#0369a1" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "TravelDiary",
  url: process.env.NEXT_PUBLIC_APP_URL,
  description: "Explore thousands of incredible travel destinations across India and the world.",
  sameAs: [],
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />
      </head>
      <body className={inter.className}>
        <SessionProvider session={session}>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
            <PWARegister />
            <PageTracker />
            {children}
            <Toaster position="top-right" richColors />
            <Analytics />
            <SpeedInsights />
            {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && !process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID.includes("XXXXXXXXXX") && (
              <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
            )}
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
