import Link from "next/link";
import { TravelDiaryIcon } from "@/components/shared/travel-diary-icon";

const links = {
  Explore: [
    { href: "/explore", label: "All Places" },
    { href: "/categories", label: "Categories" },
    { href: "/explore?sort=rating", label: "Top Rated" },
    { href: "/explore?sort=newest", label: "Recently Added" },
  ],
  Company: [
    { href: "/about", label: "About Us" },
    { href: "/contact", label: "Contact" },
    { href: "/places/new", label: "Add a Place" },
  ],
  Legal: [
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/terms", label: "Terms of Service" },
    { href: "/content-policy", label: "Content Policy" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t bg-muted/50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg">
              <TravelDiaryIcon className="h-7 w-7" />
              TravelDiary
            </Link>
            <p className="text-sm text-muted-foreground">
              Discover incredible places and share your travel experiences with the world.
            </p>
          </div>
          {Object.entries(links).map(([section, items]) => (
            <div key={section}>
              <h4 className="font-semibold mb-4">{section}</h4>
              <ul className="space-y-2">
                {items.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} TravelDiary. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
