import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { PlaceStatus } from "@prisma/client";
import { Users, MapPin, Clock, CheckCircle, Star, Flag } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/");

  const [users, totalPlaces, pending, approved, reviews, reports] = await Promise.all([
    db.user.count(),
    db.place.count(),
    db.place.count({ where: { status: PlaceStatus.PENDING } }),
    db.place.count({ where: { status: PlaceStatus.APPROVED } }),
    db.review.count(),
    db.report.count({ where: { resolved: false } }),
  ]);

  const stats = [
    { label: "Total Users", value: users, icon: Users, color: "text-blue-500" },
    { label: "Total Places", value: totalPlaces, icon: MapPin, color: "text-green-500" },
    { label: "Pending Review", value: pending, icon: Clock, color: "text-yellow-500" },
    { label: "Approved Places", value: approved, icon: CheckCircle, color: "text-emerald-500" },
    { label: "Total Reviews", value: reviews, icon: Star, color: "text-purple-500" },
    { label: "Open Reports", value: reports, icon: Flag, color: "text-red-500" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`p-2.5 rounded-full bg-muted ${color} shrink-0`}><Icon className="h-4 w-4 md:h-5 md:w-5" /></div>
              <div className="min-w-0">
                <p className="text-xl md:text-2xl font-bold">{value}</p>
                <p className="text-xs md:text-sm text-muted-foreground leading-tight">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
