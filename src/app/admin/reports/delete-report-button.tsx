"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteReport } from "@/actions/admin";

export function DeleteReportButton({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Delete this report permanently?")) return;
    setLoading(true);
    const r = await deleteReport(id);
    setLoading(false);
    toast.success(r.success); router.refresh();
  };

  return (
    <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={handleDelete} disabled={loading}>
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
    </Button>
  );
}
