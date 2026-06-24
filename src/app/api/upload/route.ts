import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import sharp from "sharp";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
  if (!file.type.startsWith("image/")) return NextResponse.json({ error: "Only images are allowed" }, { status: 400 });
  if (file.size > 15 * 1024 * 1024) return NextResponse.json({ error: "Max file size is 15MB" }, { status: 400 });

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Compress: resize to max 1200×900, convert to WebP quality 78
  const compressed = await sharp(buffer)
    .resize(1200, 900, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: 78 })
    .toBuffer();

  const filename = `${randomUUID()}.webp`;
  const uploadDir = join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });
  await writeFile(join(uploadDir, filename), compressed);

  const originalKB = Math.round(file.size / 1024);
  const compressedKB = Math.round(compressed.length / 1024);

  return NextResponse.json({
    url: `/uploads/${filename}`,
    originalKB,
    compressedKB,
    savedPercent: Math.round((1 - compressedKB / originalKB) * 100),
  });
}
