import type { Metadata } from "next";
import { MapPin, Users, Star, Globe } from "lucide-react";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about TravelDiary and our mission to connect travelers worldwide and help people discover amazing places.",
  openGraph: {
    title: "About Us | TravelDiary",
    description: "Learn about TravelDiary and our mission to connect travelers worldwide.",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "About Us | TravelDiary",
    description: "Learn about TravelDiary and our mission to connect travelers worldwide.",
  },
};

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <div className="text-center mb-16">
        <div className="flex justify-center mb-4">
          <div className="p-4 bg-primary/10 rounded-full">
            <MapPin className="h-10 w-10 text-primary" />
          </div>
        </div>
        <h1 className="text-4xl font-bold mb-4">About TravelDiary</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          We're building the world's most trusted community platform for travel discovery — powered by real experiences from real travelers.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        {[
          { icon: Globe, title: "Our Mission", desc: "Make travel discovery accessible to everyone by building an open, community-driven platform where authentic experiences are shared freely." },
          { icon: Users, title: "Our Community", desc: "Thousands of travelers contribute places, reviews, and tips that help others plan incredible journeys." },
          { icon: Star, title: "Quality First", desc: "Every submitted place is reviewed by our team to ensure accurate, helpful, and high-quality information." },
        ].map(({ icon: Icon, title, desc }) => (
          <div key={title} className="text-center p-6 rounded-xl border bg-card">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Icon className="h-6 w-6 text-primary" />
              </div>
            </div>
            <h3 className="font-semibold text-lg mb-2">{title}</h3>
            <p className="text-muted-foreground text-sm">{desc}</p>
          </div>
        ))}
      </div>

      <div className="prose prose-lg dark:prose-invert mx-auto">
        <h2>How It Works</h2>
        <p>TravelDiary is a community-driven platform. Anyone can browse and discover incredible destinations without creating an account. When you're ready to contribute, create a free account and start sharing your favourite places with the world.</p>
        <p>Every submission goes through a quick review process to maintain quality. Once approved, your place becomes discoverable by millions of travelers seeking their next adventure.</p>
      </div>
    </div>
  );
}
