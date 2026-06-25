"use client";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CategorySchema, type CategoryInput } from "@/schemas";
import { createCategory } from "@/actions/admin";

export function CategoryForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<CategoryInput>({
    resolver: zodResolver(CategorySchema),
  });

  const onSubmit = (data: CategoryInput) => {
    startTransition(async () => {
      const result = await createCategory(data);
      if (result.error) toast.error(result.error);
      else { toast.success(result.success!); reset(); router.refresh(); }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Plus className="h-4 w-4" /> Add Category
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div className="space-y-1">
            <Label>Name *</Label>
            <Input
              placeholder="e.g. Waterfalls"
              {...register("name")}
              onChange={(e) => {
                setValue("name", e.target.value);
                setValue("slug", e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""));
              }}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>
          <div className="space-y-1">
            <Label>Slug *</Label>
            <Input placeholder="e.g. waterfalls" {...register("slug")} />
            {errors.slug && <p className="text-xs text-destructive">{errors.slug.message}</p>}
          </div>
          <div className="space-y-1">
            <Label>Icon (emoji)</Label>
            <Input placeholder="e.g. 💧" {...register("icon")} />
          </div>
          <div className="space-y-1">
            <Label>Image URL</Label>
            <Input placeholder="https://images.unsplash.com/..." {...register("image")} />
          </div>
          <div className="space-y-1">
            <Label>Description</Label>
            <Textarea placeholder="Short description…" rows={2} {...register("description")} />
          </div>
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Category"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
