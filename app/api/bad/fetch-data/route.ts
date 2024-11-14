import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  // Simulate data processing or fetching
  const data = await heavyDataProcessing();

  return NextResponse.json({ data });
}

async function heavyDataProcessing() {
  // Simulate a heavy computation or database query
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ message: "Processed Data" });
    }, 3000); // 3 seconds delay
  });
}
