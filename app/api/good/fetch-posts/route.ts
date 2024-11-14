import { NextRequest, NextResponse } from "next/server";
// @ts-ignore
import { PrismaClient } from "@prisma/client";
// @ts-ignore
import Redis from "ioredis";

const prisma = new PrismaClient();
const redis = new Redis(process.env.REDIS_URL); // Ensure REDIS_URL is set in your environment

const CACHE_KEY = "posts_with_comments_and_authors";
const CACHE_TTL = 60 * 5; // 5 minutes

export async function GET(req: NextRequest) {
  try {
    // Check if data is in cache
    const cachedData = await redis.get(CACHE_KEY);
    if (cachedData) {
      return NextResponse.json(JSON.parse(cachedData));
    }

    // Fetch all posts with comments and author in a single query
    const posts = await prisma.post.findMany({
      include: {
        comments: true,
        author: true,
      },
    });

    // Store the fetched data in cache
    await redis.set(CACHE_KEY, JSON.stringify(posts), "EX", CACHE_TTL);

    return NextResponse.json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
