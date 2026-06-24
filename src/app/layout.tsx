import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/shared/theme-provider";
import { Toaster } from "sonner";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/lib/auth";
import { PageTracker } from "@/components/shared/page-tracker";

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
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "TravelDiary" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "TravelDiary – Discover Amazing Places",
    description: "Explore thousands of incredible travel destinations.",
    images: ["/og-image.jpg"],
  },
  robots: { index: true, follow: true },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <SessionProvider session={session}>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
            <PageTracker />
            {children}
            <Toaster position="top-right" richColors />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
