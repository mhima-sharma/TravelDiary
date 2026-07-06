import Link from "next/link";
import { MapPin } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b p-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg w-fit">
          <MapPin className="h-5 w-5 text-primary" />
          Tripzify
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center p-4 bg-muted/30">
        {children}
      </main>
    </div>
  );
}
