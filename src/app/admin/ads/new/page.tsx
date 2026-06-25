import { AdForm } from "../ad-form";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "New Ad" };

export default function NewAdPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">New Advertisement</h1>
      <AdForm />
    </div>
  );
}
