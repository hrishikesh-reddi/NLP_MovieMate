import { NextResponse } from "next/server";
import { movies, searchMovies, findSimilarMovies } from "@/lib/movieData";
import { parseMovieQuery, getMoodGenres } from "@/lib/nlu";
import ZAI from "z-ai-web-dev-sdk";

export async function POST(request: Request) {
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Messages array is required" },
        { status: 400 }
      );
    }

    const lastMessage = messages[messages.length - 1];
    const userQuery = lastMessage.content;

    // Parse the query using NLU
    const parsed = parseMovieQuery(userQuery);

    // Determine search results
    let movieResults = [];

    if (parsed.isSimilarRequest && parsed.similarToMovie) {
      // Find similar movies
      movieResults = findSimilarMovies(parsed.similarToMovie, 8);
    } else if (parsed.mood && !parsed.genre) {
      // Mood-based search - search across mood genres
      const moodGenres = getMoodGenres(parsed.mood);
      for (const genre of moodGenres) {
        const results = searchMovies({
          genre,
          yearFrom: parsed.yearFrom,
          yearTo: parsed.yearTo,
          ratingMin: parsed.ratingMin,
          limit: 3,
        });
        movieResults.push(...results);
      }
      // Remove duplicates and sort by rating
      const seen = new Set<string>();
      movieResults = movieResults
        .filter((m) => {
          if (seen.has(m.title)) return false;
          seen.add(m.title);
          return true;
        })
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 8);
    } else if (
      parsed.genre ||
      parsed.actor ||
      parsed.director ||
      parsed.yearFrom ||
      parsed.yearTo ||
      parsed.ratingMin
    ) {
      // Direct search with extracted parameters
      movieResults = searchMovies({
        genre: parsed.genre,
        yearFrom: parsed.yearFrom,
        yearTo: parsed.yearTo,
        ratingMin: parsed.ratingMin,
        actor: parsed.actor,
        director: parsed.director,
        limit: 8,
      });
    } else {
      // Fallback: text search
      movieResults = searchMovies({
        query: userQuery,
        limit: 5,
      });
    }

    // Build context for LLM
    const movieContext = movieResults
      .slice(0, 6)
      .map(
        (m, i) =>
          `${i + 1}. "${m.title}" (${m.year}) - Rating: ${m.rating}/10 - Genre: ${m.genre.join(", ")} - Director: ${m.director} - Cast: ${m.cast.join(", ")} - ${m.plot.substring(0, 100)}...`
      )
      .join("\n");

    const systemPrompt = `You are MovieMate, a friendly, knowledgeable movie expert chatbot. You help users discover movies, get recommendations, and learn about films.

You have access to a movie database and have just performed a search based on the user's query. Here are the search results:

${movieContext || "No movies found matching the criteria."}

Total results found: ${movieResults.length}

IMPORTANT RULES:
1. Be conversational, enthusiastic, and helpful - like a movie-loving friend
2. Always reference the specific movies found in the search results when making recommendations
3. Include interesting details about the movies you recommend (director, cast, what makes them special)
4. If no movies were found, suggest broader search terms or ask for clarification
5. Format movie titles in **bold** and include year and rating
6. Keep your response concise but informative (2-4 paragraphs max)
7. If the user asks a follow-up question that refines a previous search, acknowledge the refinement
8. Never make up movie information - only use the data provided in the search results
9. Add a brief recommendation at the end for what the user might want to search next

Respond to the user's message naturally and helpfully.`;

    // Prepare conversation messages for the LLM
    const conversationForLLM = messages.slice(0, -1).map((m: { role: string; content: string }) => ({
      role: m.role,
      content: m.content,
    }));

    const zai = await ZAI.create();
    const completion = await zai.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        ...conversationForLLM,
        { role: "user", content: userQuery },
      ],
      temperature: 0.7,
      max_tokens: 800,
    });

    const messageContent = completion.choices[0]?.message?.content || "I'm sorry, I couldn't process your request. Could you try again?";

    // Return the top movies as results (with limited fields for the frontend)
    const moviesForResponse = movieResults.slice(0, 8).map((m) => ({
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
      message: messageContent,
      movies: moviesForResponse,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      {
        message:
          "I'm having trouble connecting right now. Please try again in a moment!",
        movies: [],
        error: "Failed to process request",
      },
      { status: 500 }
    );
  }
}
