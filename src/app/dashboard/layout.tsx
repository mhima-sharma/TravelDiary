import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { LayoutDashboard, MapPin, Heart, Star, User, Settings, ArrowLeft, Compass, Coins, Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/my-places", label: "My Places", icon: MapPin },
  { href: "/dashboard/favorites", label: "Favorites", icon: Heart },
  { href: "/dashboard/bucket-list", label: "Bucket List", icon: Bookmark },
  { href: "/dashboard/reviews", label: "My Reviews", icon: Star },
  { href: "/dashboard/rewards", label: "Rewards", icon: Coins },
  { href: "/dashboard/profile", label: "Profile", icon: User },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-semibold text-primary">
            <Compass className="h-5 w-5" />
            Tripzify
          </Link>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link href="/" className="flex items-center gap-1.5 hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Back to site
            </Link>
            <Link href="/explore" className="hover:text-foreground transition-colors">Explore</Link>
            <Link href="/places/new" className="hover:text-foreground transition-colors">Add Place</Link>
          </div>
        </div>
      </header>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-6">
          <aside className="md:w-56 flex-shrink-0">
            <nav className="bg-card border rounded-xl p-3 space-y-1">
              {links.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                    "text-muted-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              ))}
            </nav>
          </aside>
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
