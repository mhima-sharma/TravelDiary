"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { adminDeleteReview } from "@/actions/admin";

export function AdminDeleteReviewButton({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Delete this review permanently?")) return;
    setLoading(true);
    const result = await adminDeleteReview(id);
    setLoading(false);
    if (result.error) toast.error(result.error);
    else { toast.success(result.success!); router.refresh(); }
  };

  return (
    <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive flex-shrink-0" onClick={handleDelete} disabled={loading}>
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
    </Button>
  );
}
