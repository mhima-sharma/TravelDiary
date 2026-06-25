import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { AdForm } from "../ad-form";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Edit Ad" };

export default async function EditAdPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ad = await db.advertisement.findUnique({ where: { id } });
  if (!ad) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Edit Advertisement</h1>
      <AdForm ad={ad} />
    </div>
  );
}
