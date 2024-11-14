import { NextRequest, NextResponse } from "next/server";

// Other example is in components/good/image-gallery.tsx

// Example using Amazon S3
const S3_BUCKET_URL = process.env.S3_BUCKET_URL; // e.g., https://your-bucket.s3.amazonaws.com/
const ALLOWED_IMAGE_TYPES = ["jpg", "jpeg", "png", "gif", "svg"];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const imageName = searchParams.get("name");

  if (!imageName) {
    return NextResponse.json(
      { error: "Image name is required" },
      { status: 400 }
    );
  }

  const fileExtension = imageName.split(".").pop()?.toLowerCase();
  if (!fileExtension || !ALLOWED_IMAGE_TYPES.includes(fileExtension)) {
    return NextResponse.json({ error: "Invalid image type" }, { status: 400 });
  }

  // Construct the external image URL
  const imageUrl = `${S3_BUCKET_URL}/images/${encodeURIComponent(imageName)}`;

  // Set caching headers
  const headers = new Headers({
    // The Cache-Control header is set to cache images for one year (max-age=31536000) and marked as immutable,
    // reducing the number of requests Vercel handles.
    "Cache-Control": "public, max-age=31536000, immutable",
    "Content-Security-Policy": `default-src 'self'; img-src ${S3_BUCKET_URL} data:;`,
  });

  // Optionally, you can add authentication or validation here

  return NextResponse.redirect(imageUrl, { headers });
}
