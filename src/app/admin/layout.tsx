import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { LayoutDashboard, Users, MapPin, FolderOpen, Star, Flag, Shield, BarChart3, Gift } from "lucide-react";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/places", label: "Places", icon: MapPin },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/categories", label: "Categories", icon: FolderOpen },
  { href: "/admin/reviews", label: "Reviews", icon: Star },
  { href: "/admin/reports", label: "Reports", icon: Flag },
  { href: "/admin/rewards", label: "Rewards", icon: Gift },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/");

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background sticky top-0 z-40">
        <div className="container mx-auto px-4 h-14 flex items-center gap-3">
          <Shield className="h-5 w-5 text-primary" />
          <span className="font-semibold">Admin Panel</span>
          <span className="text-muted-foreground text-sm ml-2">TravelDiary</span>
        </div>
      </header>
      <div className="container mx-auto px-4 py-6 flex gap-6">
        <aside className="w-52 flex-shrink-0">
          <nav className="bg-card border rounded-xl p-2 space-y-1">
            {links.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors">
                <Icon className="h-4 w-4" />{label}
              </Link>
            ))}
          </nav>
        </aside>
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
