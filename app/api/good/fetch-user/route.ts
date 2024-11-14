import { NextRequest, NextResponse } from "next/server";
// @ts-ignore
import { PrismaClient } from "@prisma/client";
// @ts-ignore
import Redis from "ioredis";

const prisma = new PrismaClient();
const redis = new Redis(process.env.REDIS_URL); // Ensure REDIS_URL is set in your environment

const CACHE_PREFIX = "user_";
const CACHE_TTL = 60 * 10; // 10 minutes

// Simple rate limiter using Redis
const RATE_LIMIT = 100; // max 100 requests
const RATE_LIMIT_WINDOW = 60; // per 60 seconds

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("id");

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  // Rate Limiting
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const rateLimitKey = `rate_limit_${ip}`;

  const current = await redis.incr(rateLimitKey);
  if (current === 1) {
    await redis.expire(rateLimitKey, RATE_LIMIT_WINDOW);
  }

  if (current > RATE_LIMIT) {
    return NextResponse.json({ error: "Too Many Requests" }, { status: 429 });
  }

  try {
    const cacheKey = `${CACHE_PREFIX}${userId}`;

    // Check cache
    const cachedUser = await redis.get(cacheKey);
    if (cachedUser) {
      return NextResponse.json(JSON.parse(cachedUser));
    }

    // Fetch from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        // Select only necessary fields
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Store in cache
    await redis.set(cacheKey, JSON.stringify(user), "EX", CACHE_TTL);

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
