import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { PlaceStatus } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminPlaceActions } from "@/components/admin/place-actions";

export default async function AdminPlacesPage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/");

  const [pending, approved, rejected] = await Promise.all([
    db.place.findMany({ where: { status: PlaceStatus.PENDING }, include: { user: { select: { name: true } }, category: { select: { name: true } } }, orderBy: { createdAt: "desc" } }),
    db.place.findMany({ where: { status: PlaceStatus.APPROVED }, include: { user: { select: { name: true } }, category: { select: { name: true } } }, orderBy: { createdAt: "desc" }, take: 20 }),
    db.place.findMany({ where: { status: PlaceStatus.REJECTED }, include: { user: { select: { name: true } }, category: { select: { name: true } } }, orderBy: { createdAt: "desc" }, take: 20 }),
  ]);

  const PlaceList = ({ places, showActions, showExtras }: { places: typeof pending; showActions?: boolean; showExtras?: boolean }) => (
    <div className="space-y-3">
      {places.map((place) => (
        <Card key={place.id}>
          <CardContent className="p-4 flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Link href={`/places/${place.slug}`} className="font-medium hover:text-primary truncate">{place.title}</Link>
                <Badge variant="outline" className="text-xs">{place.category.name}</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">by {place.user.name}</p>
            </div>
            {showActions && <AdminPlaceActions placeId={place.id} showExtras={showExtras} />}
          </CardContent>
        </Card>
      ))}
      {places.length === 0 && <p className="text-center py-8 text-muted-foreground">No places in this category</p>}
    </div>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Manage Places</h1>
      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({approved.length})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({rejected.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="pending" className="mt-4"><PlaceList places={pending} showActions /></TabsContent>
        <TabsContent value="approved" className="mt-4"><PlaceList places={approved} showActions showExtras /></TabsContent>
        <TabsContent value="rejected" className="mt-4"><PlaceList places={rejected} /></TabsContent>
      </Tabs>
    </div>
  );
}
