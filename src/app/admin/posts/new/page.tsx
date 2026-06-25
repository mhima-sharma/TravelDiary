import { PostForm } from "../post-form";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "New Post" };

export default function NewPostPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">New Post</h1>
      <PostForm />
    </div>
  );
}
