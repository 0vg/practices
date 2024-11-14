import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const imageName = searchParams.get("name");

  if (!imageName) {
    return NextResponse.json(
      { error: "Image name is required" },
      { status: 400 }
    );
  }

  const imagePath = path.join(process.cwd(), "public", "images", imageName);

  try {
    const imageBuffer = fs.readFileSync(imagePath);
    const mimeType = getMimeType(imagePath);

    return new NextResponse(imageBuffer, {
      headers: {
        "Content-Type": mimeType,
        "Cache-Control": "no-cache", // No caching
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Image not found" }, { status: 404 });
  }
}

function getMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".png":
      return "image/png";
    case ".gif":
      return "image/gif";
    case ".svg":
      return "image/svg+xml";
    default:
      return "application/octet-stream";
  }
}
