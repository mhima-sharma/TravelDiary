import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadImage(
  file: string,
  folder = "travel_diary"
): Promise<{ url: string; publicId: string }> {
  const result = await cloudinary.uploader.upload(file, {
    folder,
    resource_type: "image",
    transformation: [{ quality: "auto:good", fetch_format: "auto" }],
    eager: [
      { width: 400, height: 300, crop: "fill", quality: "auto", fetch_format: "auto" },
    ],
    eager_async: true,
  });
  return { url: result.secure_url, publicId: result.public_id };
}

/**
 * Returns an optimized Cloudinary URL for a given public ID.
 * Cloudinary serves WebP/AVIF automatically based on browser support.
 */
export function getOptimizedUrl(
  publicId: string,
  options: { width?: number; height?: number; crop?: string } = {}
): string {
  const { width = 1200, height, crop = "limit" } = options;
  const transforms = [
    `w_${width}`,
    height ? `h_${height}` : null,
    `c_${crop}`,
    "q_auto:good",
    "f_auto",
  ]
    .filter(Boolean)
    .join(",");
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  return `https://res.cloudinary.com/${cloudName}/image/upload/${transforms}/${publicId}`;
}

export async function deleteImage(publicId: string) {
  return cloudinary.uploader.destroy(publicId);
}

export { cloudinary };
