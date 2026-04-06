import { NextResponse } from "next/server";
import { getStats } from "@/lib/movieData";

export async function GET() {
  try {
    const stats = getStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error("Stats API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch statistics" },
      { status: 500 }
    );
  }
}
