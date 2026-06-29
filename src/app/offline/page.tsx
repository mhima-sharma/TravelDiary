"use client";

import Link from "next/link";
import { WifiOff, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="text-center max-w-sm w-full">
        <div className="flex justify-center mb-6">
          <div className="p-5 bg-muted rounded-full">
            <WifiOff className="h-12 w-12 text-muted-foreground" />
          </div>
        </div>

        <h1 className="text-2xl font-bold mb-2">You&apos;re offline</h1>
        <p className="text-muted-foreground mb-8 leading-relaxed">
          No internet connection found. Check your network settings and try
          again.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={() => window.location.reload()} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Try again
          </Button>
          <Button variant="outline" asChild className="gap-2">
            <Link href="/">
              <Home className="h-4 w-4" />
              Go home
            </Link>
          </Button>
        </div>

        <p className="mt-8 text-xs text-muted-foreground">
          Previously visited pages may still be available below.
        </p>
      </div>
    </div>
  );
}
