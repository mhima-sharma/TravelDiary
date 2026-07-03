"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, MapPin, FolderOpen, Star, Flag, BarChart3, Gift, Megaphone, Bot } from "lucide-react";

export const adminLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/places", label: "Places", icon: MapPin },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/categories", label: "Categories", icon: FolderOpen },
  { href: "/admin/reviews", label: "Reviews", icon: Star },
  { href: "/admin/reports", label: "Reports", icon: Flag },
  { href: "/admin/rewards", label: "Rewards", icon: Gift },
  { href: "/admin/ads", label: "Ads", icon: Megaphone },
  { href: "/admin/ai-services", label: "AI Services", icon: Bot },
];

export function AdminSideNav() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:block w-52 flex-shrink-0">
      <nav className="bg-card border rounded-xl p-2 space-y-1 sticky top-20">
        {adminLinks.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              pathname === href
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
