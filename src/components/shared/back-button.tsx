"use client";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export function BackButton({ label = "Back", href }: { label?: string; href?: string }) {
  const router = useRouter();
  return (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-2 text-muted-foreground hover:text-foreground"
      onClick={() => (href ? router.push(href) : router.back())}
    >
      <ArrowLeft className="h-4 w-4 mr-1.5" />
      {label}
    </Button>
  );
}
