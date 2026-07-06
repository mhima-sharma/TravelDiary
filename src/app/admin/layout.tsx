import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Shield } from "lucide-react";
import { AdminSideNav } from "@/components/admin/admin-side-nav";
import { AdminMobileNav } from "@/components/admin/admin-mobile-nav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/");

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background sticky top-0 z-40">
        <div className="container mx-auto px-4 h-14 flex items-center gap-3">
          <AdminMobileNav />
          <Shield className="h-5 w-5 text-primary hidden md:block" />
          <span className="font-semibold">Admin Panel</span>
          <span className="text-muted-foreground text-sm ml-2">Tripzify</span>
        </div>
      </header>
      <div className="container mx-auto px-4 py-6 flex gap-6">
        <AdminSideNav />
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
