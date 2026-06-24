"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteCategory } from "@/actions/admin";

export function DeleteCategoryButton({ id, name, hasPlaces }: { id: string; name: string; hasPlaces: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (hasPlaces) {
      if (!confirm(`"${name}" has places assigned to it. Deleting it will remove the category from those places. Continue?`)) return;
    } else {
      if (!confirm(`Delete category "${name}"?`)) return;
    }
    setLoading(true);
    const result = await deleteCategory(id);
    setLoading(false);
    if ("error" in result) toast.error(result.error as string);
    else { toast.success(result.success); router.refresh(); }
  };

  return (
    <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={handleDelete} disabled={loading}>
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
    </Button>
  );
}
