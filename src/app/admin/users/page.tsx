import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Image from "next/image";
import { User, Shield } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AdminUserActions } from "@/components/admin/user-actions";
import { formatDate } from "@/lib/utils";

export default async function AdminUsersPage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/");

  const users = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { places: true, reviews: true } } },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Manage Users ({users.length})</h1>
      <div className="space-y-3">
        {users.map((user) => (
          <Card key={user.id}>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                {user.image ? <Image src={user.image} alt={user.name || ""} width={40} height={40} className="object-cover" /> : <User className="h-5 w-5" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium">{user.name || "—"}</span>
                  {user.role === "ADMIN" && <Badge variant="secondary"><Shield className="h-3 w-3 mr-1" />Admin</Badge>}
                  {user.isBanned && <Badge variant="destructive">Banned</Badge>}
                </div>
                <p className="text-sm text-muted-foreground">{user.email} · Joined {formatDate(user.createdAt)}</p>
                <p className="text-xs text-muted-foreground">{user._count.places} places · {user._count.reviews} reviews</p>
              </div>
              {user.id !== session.user.id && user.role !== "ADMIN" && (
                <AdminUserActions userId={user.id} isBanned={user.isBanned} />
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
