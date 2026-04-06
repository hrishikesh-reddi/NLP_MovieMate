import { NextResponse } from "next/server";
import { searchMovies, type SearchParams } from "@/lib/movieData";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const params: SearchParams = {
      query: body.query,
      genre: body.genre,
      yearFrom: body.yearFrom ? parseInt(body.yearFrom) : undefined,
      yearTo: body.yearTo ? parseInt(body.yearTo) : undefined,
      ratingMin: body.ratingMin ? parseFloat(body.ratingMin) : undefined,
      actor: body.actor,
      director: body.director,
      limit: body.limit ? parseInt(body.limit) : undefined,
      sortBy: body.sortBy,
      sortOrder: body.sortOrder,
    };

    const results = searchMovies(params);

    // Return limited fields
    const moviesForResponse = results.map((m) => ({
      title: m.title,
      year: m.year,
      rating: m.rating,
      genre: m.genre,
      director: m.director,
      cast: m.cast,
      duration: m.duration,
      poster: m.poster,
    }));

    return NextResponse.json({
      movies: moviesForResponse,
      total: results.length,
    });
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json(
      { error: "Failed to search movies" },
      { status: 500 }
    );
  }
}
