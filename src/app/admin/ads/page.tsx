import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";
import { Plus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DeleteAdButton } from "./delete-ad-button";
import { ToggleAdButton } from "./toggle-ad-button";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Advertisements" };

export default async function AdminAdsPage() {
  const ads = await db.advertisement.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Advertisements</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Ads appear between place cards on the Explore page</p>
        </div>
        <Button asChild>
          <Link href="/admin/ads/new"><Plus className="h-4 w-4 mr-2" />New Ad</Link>
        </Button>
      </div>

      {ads.length === 0 ? (
        <div className="border rounded-xl py-16 text-center text-muted-foreground">
          <p>No ads yet. Create your first advertisement!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {ads.map((ad) => (
            <div key={ad.id} className="flex items-center gap-4 p-4 border rounded-xl bg-card">
              {ad.image && (
                <div className="relative h-16 w-24 rounded-lg overflow-hidden shrink-0">
                  <Image src={ad.image} alt={ad.title} fill className="object-cover" unoptimized />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium truncate">{ad.title}</p>
                  <Badge variant={ad.isActive ? "default" : "secondary"}>
                    {ad.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                {ad.description && (
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{ad.description}</p>
                )}
                {ad.linkUrl && (
                  <p className="text-xs text-primary truncate mt-0.5">{ad.linkUrl}</p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <ToggleAdButton id={ad.id} isActive={ad.isActive} />
                <Button variant="outline" size="icon" asChild title="Edit">
                  <Link href={`/admin/ads/${ad.id}`}><Pencil className="h-4 w-4" /></Link>
                </Button>
                <DeleteAdButton id={ad.id} title={ad.title} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
