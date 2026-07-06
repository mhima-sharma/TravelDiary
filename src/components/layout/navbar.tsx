"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import { Sun, Moon, Menu, X, Plus, User, LogOut, LayoutDashboard, Shield } from "lucide-react";
import { TripzifyIcon } from "@/components/shared/tripzify-icon";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";

const navLinks = [
  { href: "/explore", label: "Explore" },
  { href: "/categories", label: "Categories" },
  { href: "/trip-planner", label: "Trip Planner" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/guide", label: "Guide" },
  { href: "/about", label: "About" },
];

export function Navbar() {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <TripzifyIcon className="h-8 w-8" />
            <span>Tripzify</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((l) => (
              <Link key={l.href} href={l.href} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                {l.label}
              </Link>
            ))}
            {session && (
              <Link href="/rewards" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Rewards
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="hidden md:flex">
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>

            {session ? (
              <>
                <Button asChild size="sm" className="hidden md:flex gap-1">
                  <Link href="/places/new"><Plus className="h-4 w-4" /> Add Place</Link>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={session.user.image ?? ""} alt={session.user.name ?? ""} />
                        <AvatarFallback>{session.user.name?.charAt(0).toUpperCase() ?? "U"}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">{session.user.name}</p>
                        <p className="text-xs text-muted-foreground">{session.user.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild><Link href="/dashboard"><LayoutDashboard className="mr-2 h-4 w-4" />Dashboard</Link></DropdownMenuItem>
                    <DropdownMenuItem asChild><Link href="/dashboard/profile"><User className="mr-2 h-4 w-4" />Profile</Link></DropdownMenuItem>
                    {session.user.role === "ADMIN" && (
                      <DropdownMenuItem asChild><Link href="/admin"><Shield className="mr-2 h-4 w-4" />Admin Panel</Link></DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })} className="text-destructive focus:text-destructive">
                      <LogOut className="mr-2 h-4 w-4" />Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Button variant="ghost" asChild size="sm"><Link href="/login">Sign in</Link></Button>
                <Button asChild size="sm"><Link href="/register">Get Started</Link></Button>
              </div>
            )}

            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden py-4 border-t space-y-2">
            {navLinks.map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setMobileOpen(false)}
                className="block px-2 py-2 text-sm font-medium hover:text-primary transition-colors">
                {l.label}
              </Link>
            ))}
            {session ? (
              <>
                <Link href="/places/new" onClick={() => setMobileOpen(false)} className="block px-2 py-2 text-sm font-medium hover:text-primary">+ Add Place</Link>
                <Link href="/rewards" onClick={() => setMobileOpen(false)} className="block px-2 py-2 text-sm font-medium hover:text-primary">Rewards</Link>
                <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="block px-2 py-2 text-sm font-medium hover:text-primary">Dashboard</Link>
                <button onClick={() => signOut({ callbackUrl: "/" })} className="block px-2 py-2 text-sm font-medium text-destructive w-full text-left">Sign out</button>
              </>
            ) : (
              <div className="flex gap-2 pt-2">
                <Button variant="outline" asChild size="sm" className="flex-1"><Link href="/login">Sign in</Link></Button>
                <Button asChild size="sm" className="flex-1"><Link href="/register">Get Started</Link></Button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
