import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { db } from "@/lib/db";
import { PostStatus } from "@prisma/client";
import { CalendarDays, User, ArrowLeft } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import type { Metadata } from "next";

export const revalidate = 3600;

export async function generateStaticParams() {
  try {
    const posts = await db.post.findMany({
      where: { status: PostStatus.PUBLISHED },
      select: { slug: true },
    });
    return posts.map((p) => ({ slug: p.slug }));
  } catch {
    // DB unreachable at build time — pages will be rendered on first request via ISR
    return [];
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await db.post.findUnique({ where: { slug, status: PostStatus.PUBLISHED } });
  if (!post) return { title: "Post Not Found" };
  return {
    title: `${post.title} | Tripzify Blog`,
    description: post.excerpt,
    alternates: { canonical: `${process.env.NEXT_PUBLIC_APP_URL}/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      images: post.featuredImage ? [{ url: post.featuredImage, width: 1200, height: 630, alt: post.title }] : [{ url: "/og-image.png" }],
      publishedTime: post.publishedAt?.toISOString(),
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: post.featuredImage ? [post.featuredImage] : ["/og-image.png"],
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const post = await db.post.findUnique({
    where: { slug, status: PostStatus.PUBLISHED },
    include: { author: { select: { name: true, image: true } } },
  });

  if (!post) notFound();

  // Split content into paragraphs on blank lines
  const paragraphs = post.content
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  // Fetch 3 more published posts to show at bottom
  const morePosts = await db.post.findMany({
    where: { status: PostStatus.PUBLISHED, id: { not: post.id } },
    take: 3,
    orderBy: { publishedAt: "desc" },
    select: { title: true, slug: true, excerpt: true, publishedAt: true },
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    image: post.featuredImage ?? undefined,
    author: { "@type": "Person", name: post.author.name },
    datePublished: post.publishedAt?.toISOString(),
    publisher: { "@type": "Organization", name: "Tripzify", url: process.env.NEXT_PUBLIC_APP_URL },
    mainEntityOfPage: { "@type": "WebPage", "@id": `${process.env.NEXT_PUBLIC_APP_URL}/blog/${post.slug}` },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    <div className="container mx-auto px-4 py-10 max-w-3xl">
      <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4" /> Back to Blog
      </Link>

      {post.featuredImage && (
        <div className="relative w-full h-64 md:h-80 rounded-2xl overflow-hidden mb-8">
          <Image src={post.featuredImage} alt={post.title} fill className="object-cover" priority />
        </div>
      )}

      <h1 className="text-3xl md:text-4xl font-bold mb-4">{post.title}</h1>

      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
        <span className="flex items-center gap-1.5">
          <User className="h-4 w-4" />{post.author.name}
        </span>
        <span className="flex items-center gap-1.5">
          <CalendarDays className="h-4 w-4" />
          {new Date(post.publishedAt!).toLocaleDateString("en-IN", {
            day: "numeric", month: "long", year: "numeric",
          })}
        </span>
      </div>

      <p className="text-lg text-muted-foreground italic border-l-4 border-primary pl-4 mb-8">
        {post.excerpt}
      </p>

      <Separator className="mb-8" />

      <div className="prose prose-neutral dark:prose-invert max-w-none space-y-5">
        {paragraphs.map((para, i) => (
          <p key={i} className="text-base leading-7 text-foreground/90 whitespace-pre-wrap">
            {para}
          </p>
        ))}
      </div>

      {morePosts.length > 0 && (
        <>
          <Separator className="my-12" />
          <div>
            <h2 className="text-xl font-bold mb-4">More from the Blog</h2>
            <div className="space-y-3">
              {morePosts.map((p) => (
                <Link key={p.slug} href={`/blog/${p.slug}`}
                  className="block p-4 border rounded-xl hover:bg-muted/50 transition-colors group">
                  <p className="font-medium group-hover:text-primary transition-colors">{p.title}</p>
                  <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">{p.excerpt}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(p.publishedAt!).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
    </>
  );
}
