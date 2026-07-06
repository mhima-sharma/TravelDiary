import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import sharp from "sharp";
import { cloudinary } from "@/lib/cloudinary";

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

  // Pre-compress with Sharp before uploading — reduces Cloudinary bandwidth and storage
  const compressed = await sharp(buffer)
    .resize(1200, 900, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: 78 })
    .toBuffer();

  const originalKB = Math.round(file.size / 1024);
  const compressedKB = Math.round(compressed.length / 1024);

  // Upload to Cloudinary as a base64 data URI
  const dataUri = `data:image/webp;base64,${compressed.toString("base64")}`;

  const result = await cloudinary.uploader.upload(dataUri, {
    folder: "tripzify",
    resource_type: "image",
    // Cloudinary re-encodes with auto quality + serves WebP/AVIF to browsers that support it
    transformation: [
      { quality: "auto:good", fetch_format: "auto" },
    ],
    // Generate an eager small thumbnail to warm the cache
    eager: [
      { width: 400, height: 300, crop: "fill", quality: "auto", fetch_format: "auto" },
    ],
    eager_async: true,
  });

  return NextResponse.json({
    url: result.secure_url,
    publicId: result.public_id,
    originalKB,
    compressedKB,
    savedPercent: Math.round((1 - compressedKB / originalKB) * 100),
  });
}
