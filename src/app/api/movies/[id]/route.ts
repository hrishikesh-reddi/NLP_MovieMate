import { NextResponse } from "next/server";
import { getMovieById } from "@/lib/movieData";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const index = parseInt(id);

    if (isNaN(index) || index < 0) {
      return NextResponse.json(
        { error: "Invalid movie ID" },
        { status: 400 }
      );
    }

    const movie = getMovieById(index);

    if (!movie) {
      return NextResponse.json(
        { error: "Movie not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(movie);
  } catch (error) {
    console.error("Movie details API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch movie details" },
      { status: 500 }
    );
  }
}
