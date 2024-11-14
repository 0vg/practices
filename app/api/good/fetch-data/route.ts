import { NextRequest, NextResponse } from "next/server";
// @ts-ignore
import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL); // Ensure REDIS_URL is set in your environment

const CACHE_KEY = "processed_data";
const CACHE_TTL = 60 * 5; // 5 minutes

export async function GET(req: NextRequest) {
  try {
    // Check if data is in cache
    const cachedData = await redis.get(CACHE_KEY);
    if (cachedData) {
      return NextResponse.json({
        data: JSON.parse(cachedData),
        source: "cache",
      });
    }

    // Perform heavy data processing
    const data = await heavyDataProcessing();

    // Store the processed data in cache
    await redis.set(CACHE_KEY, JSON.stringify(data), "EX", CACHE_TTL);

    return NextResponse.json({ data, source: "processed" });
  } catch (error) {
    console.error("Error fetching data:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

async function heavyDataProcessing() {
  // Simulate a heavy computation or database query
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ message: "Processed Data" });
    }, 3000); // 3 seconds delay
  });
}
