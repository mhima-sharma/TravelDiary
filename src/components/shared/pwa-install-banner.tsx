"use client";

import { useEffect, useState } from "react";
import { Download, X, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";

type Platform = "android" | "ios" | null;

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISSED_KEY = "pwa-install-dismissed";

export function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [platform, setPlatform] = useState<Platform>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Already installed (running in standalone mode)
    if (window.matchMedia("(display-mode: standalone)").matches) return;

    // User already dismissed
    if (sessionStorage.getItem(DISMISSED_KEY)) return;

    const ua = navigator.userAgent;
    const isIos =
      /iphone|ipad|ipod/i.test(ua) && !(window.navigator as Navigator & { standalone?: boolean }).standalone;
    const isAndroid = /android/i.test(ua);

    if (isIos) {
      setPlatform("ios");
      setVisible(true);
      return;
    }

    if (isAndroid) {
      // Listen for Chrome's install prompt
      const handler = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e as BeforeInstallPromptEvent);
        setPlatform("android");
        setVisible(true);
      };
      window.addEventListener("beforeinstallprompt", handler);
      return () => window.removeEventListener("beforeinstallprompt", handler);
    }

    // Desktop Chrome/Edge also fires beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setPlatform("android"); // same flow as Android
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setVisible(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    sessionStorage.setItem(DISMISSED_KEY, "1");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 max-w-sm mx-auto sm:left-auto sm:right-4 sm:mx-0">
      <div className="bg-card border rounded-2xl shadow-lg p-4 flex items-start gap-3">
        {/* Icon */}
        <div className="p-2 bg-primary/10 rounded-xl shrink-0">
          <Smartphone className="h-5 w-5 text-primary" />
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm leading-tight">
            Install Tripzify
          </p>
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
            {platform === "ios"
              ? 'Tap the Share button → "Add to Home Screen"'
              : "Add to your home screen for a better experience"}
          </p>

          {platform !== "ios" && (
            <Button
              size="sm"
              className="mt-2.5 h-8 gap-1.5 text-xs"
              onClick={handleInstall}
            >
              <Download className="h-3.5 w-3.5" />
              Install App
            </Button>
          )}
        </div>

        {/* Dismiss */}
        <button
          onClick={handleDismiss}
          className="text-muted-foreground hover:text-foreground transition-colors shrink-0 -mt-0.5"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
