import { db } from "@/lib/db";
import { Flag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { ResolveReportButton } from "./resolve-report-button";
import { DeleteReportButton } from "./delete-report-button";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Reports" };

const reasonLabels: Record<string, string> = {
  SPAM: "Spam",
  INAPPROPRIATE: "Inappropriate",
  INCORRECT_INFO: "Incorrect Info",
  DUPLICATE: "Duplicate",
  OTHER: "Other",
};

export default async function AdminReportsPage() {
  const [pending, resolved] = await Promise.all([
    db.report.findMany({
      where: { resolved: false },
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true } },
        place: { select: { title: true, slug: true } },
      },
    }),
    db.report.findMany({
      where: { resolved: true },
      orderBy: { createdAt: "desc" },
      take: 30,
      include: {
        user: { select: { name: true } },
        place: { select: { title: true, slug: true } },
      },
    }),
  ]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Reports</h1>
        <div className="flex gap-2 text-sm">
          <Badge variant="destructive">{pending.length} pending</Badge>
          <Badge variant="secondary">{resolved.length} resolved</Badge>
        </div>
      </div>

      {/* Pending */}
      <section>
        <h2 className="font-semibold text-lg mb-3 flex items-center gap-2">
          <Flag className="h-4 w-4 text-destructive" /> Pending Reports
        </h2>
        {pending.length === 0 ? (
          <div className="py-10 border rounded-xl text-center text-muted-foreground text-sm">No pending reports</div>
        ) : (
          <div className="space-y-3">
            {pending.map((r) => (
              <ReportCard key={r.id} report={r} resolved={false} />
            ))}
          </div>
        )}
      </section>

      {/* Resolved */}
      {resolved.length > 0 && (
        <section>
          <h2 className="font-semibold text-lg mb-3 text-muted-foreground">Resolved (last 30)</h2>
          <div className="space-y-3">
            {resolved.map((r) => (
              <ReportCard key={r.id} report={r} resolved={true} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function ReportCard({ report, resolved }: {
  report: {
    id: string; reason: string; details: string | null; resolved: boolean; createdAt: Date;
    user: { name: string | null };
    place: { title: string; slug: string };
  };
  resolved: boolean;
}) {
  return (
    <div className={`p-4 border rounded-xl bg-card ${resolved ? "opacity-60" : ""}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Badge variant={resolved ? "secondary" : "destructive"} className="text-xs">
              {reasonLabels[report.reason] ?? report.reason}
            </Badge>
            <span className="text-sm">
              Place:{" "}
              <Link href={`/places/${report.place.slug}`} className="text-primary hover:underline font-medium">
                {report.place.title}
              </Link>
            </span>
            <span className="text-xs text-muted-foreground ml-auto">{formatDate(report.createdAt)}</span>
          </div>
          {report.details && <p className="text-sm text-muted-foreground">{report.details}</p>}
          <p className="text-xs text-muted-foreground mt-1">Reported by: {report.user.name ?? "Anonymous"}</p>
        </div>
        <div className="flex gap-1 flex-shrink-0">
          {!resolved && <ResolveReportButton id={report.id} />}
          <DeleteReportButton id={report.id} />
        </div>
      </div>
    </div>
  );
}
