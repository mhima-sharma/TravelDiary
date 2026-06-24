"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { resolveReport } from "@/actions/admin";

export function ResolveReportButton({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleResolve = async () => {
    setLoading(true);
    const r = await resolveReport(id);
    setLoading(false);
    toast.success(r.success); router.refresh();
  };

  return (
    <Button size="sm" variant="ghost" className="text-green-600 hover:text-green-700" onClick={handleResolve} disabled={loading}>
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
    </Button>
  );
}
