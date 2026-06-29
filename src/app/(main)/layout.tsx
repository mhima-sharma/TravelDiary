import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { LoginTracker } from "@/components/gamification/login-tracker";
import { PWAInstallBanner } from "@/components/shared/pwa-install-banner";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <LoginTracker />
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <PWAInstallBanner />
    </div>
  );
}
