import { db } from "@/lib/db";
import { FolderOpen } from "lucide-react";
import type { Metadata } from "next";
import { CategoryForm } from "./category-form";
import { DeleteCategoryButton } from "./delete-category-button";
import { EditCategoryImage } from "./edit-category-image";

export const metadata: Metadata = { title: "Categories" };

export default async function AdminCategoriesPage() {
  const categories = await db.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { places: true } } },
  });

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Categories</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Add form */}
        <div className="lg:col-span-1">
          <CategoryForm />
        </div>

        {/* List */}
        <div className="lg:col-span-2 space-y-2">
          {categories.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center border rounded-xl">
              <FolderOpen className="h-10 w-10 text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No categories yet</p>
            </div>
          )}
          {categories.map((cat) => (
            <div key={cat.id} className="flex items-center justify-between p-4 border rounded-xl bg-card">
              <div className="flex items-center gap-3">
                <span className="text-2xl leading-none">{cat.icon ?? "📂"}</span>
                <div>
                  <p className="font-medium">{cat.name}</p>
                  <p className="text-xs text-muted-foreground">/{cat.slug} · {cat._count.places} places</p>
                  {cat.description && <p className="text-xs text-muted-foreground mt-0.5">{cat.description}</p>}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <EditCategoryImage id={cat.id} currentImage={cat.image} />
                <DeleteCategoryButton id={cat.id} name={cat.name} hasPlaces={cat._count.places > 0} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
