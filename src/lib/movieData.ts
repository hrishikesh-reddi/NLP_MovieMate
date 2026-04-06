import moviesData from "../../data/movies.json";

export interface Movie {
  title: string;
  year: number;
  rating: number;
  genre: string[];
  director: string;
  cast: string[];
  duration: number;
  plot: string;
  poster?: string;
}

// Enrich movies with poster URLs
export const movies: Movie[] = (moviesData as Omit<Movie, "poster">[]).map(
  (m) => ({
    ...m,
    poster: `https://placehold.co/300x450/1a1a2e/e94560?text=${encodeURIComponent(
      m.title.length > 20 ? m.title.substring(0, 20) + "..." : m.title
    )}`,
  })
);

// Get all unique genres
export function getAllGenres(): string[] {
  const genreSet = new Set<string>();
  movies.forEach((m) => m.genre.forEach((g) => genreSet.add(g)));
  return Array.from(genreSet).sort();
}

// Get all unique directors
export function getAllDirectors(): string[] {
  const directorSet = new Set<string>();
  movies.forEach((m) => directorSet.add(m.director));
  return Array.from(directorSet).sort();
}

// Get all unique actors
export function getAllActors(): string[] {
  const actorSet = new Set<string>();
  movies.forEach((m) => m.cast.forEach((c) => actorSet.add(c)));
  return Array.from(actorSet).sort();
}

// Search parameters interface
export interface SearchParams {
  query?: string;
  genre?: string;
  yearFrom?: number;
  yearTo?: number;
  ratingMin?: number;
  actor?: string;
  director?: string;
  limit?: number;
  sortBy?: "rating" | "year" | "title";
  sortOrder?: "asc" | "desc";
}

// Filter movies based on search parameters
export function searchMovies(params: SearchParams): Movie[] {
  let results = [...movies];

  // Text-based search on title and plot
  if (params.query) {
    const q = params.query.toLowerCase();
    results = results.filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        m.plot.toLowerCase().includes(q) ||
        m.director.toLowerCase().includes(q)
    );
  }

  // Genre filter
  if (params.genre) {
    const genre = params.genre.toLowerCase();
    results = results.filter((m) =>
      m.genre.some((g) => g.toLowerCase() === genre)
    );
  }

  // Year range
  if (params.yearFrom) {
    results = results.filter((m) => m.year >= params.yearFrom!);
  }
  if (params.yearTo) {
    results = results.filter((m) => m.year <= params.yearTo!);
  }

  // Minimum rating
  if (params.ratingMin) {
    results = results.filter((m) => m.rating >= params.ratingMin!);
  }

  // Actor filter
  if (params.actor) {
    const actor = params.actor.toLowerCase();
    results = results.filter((m) =>
      m.cast.some((c) => c.toLowerCase().includes(actor))
    );
  }

  // Director filter
  if (params.director) {
    const director = params.director.toLowerCase();
    results = results.filter((m) =>
      m.director.toLowerCase().includes(director)
    );
  }

  // Sorting
  if (params.sortBy) {
    const order = params.sortOrder === "asc" ? 1 : -1;
    results.sort((a, b) => {
      if (params.sortBy === "rating") return (a.rating - b.rating) * order;
      if (params.sortBy === "year") return (a.year - b.year) * order;
      if (params.sortBy === "title")
        return a.title.localeCompare(b.title) * order;
      return 0;
    });
  } else {
    // Default: sort by rating descending
    results.sort((a, b) => b.rating - a.rating);
  }

  // Limit
  if (params.limit) {
    results = results.slice(0, params.limit);
  }

  return results;
}

// Find similar movies based on shared genres, director, cast
export function findSimilarMovies(movieTitle: string, limit: number = 5): Movie[] {
  const target = movies.find(
    (m) => m.title.toLowerCase() === movieTitle.toLowerCase()
  );
  if (!target) return [];

  const scored = movies
    .filter((m) => m.title.toLowerCase() !== movieTitle.toLowerCase())
    .map((m) => {
      let score = 0;

      // Shared genres
      const sharedGenres = m.genre.filter((g) => target.genre.includes(g));
      score += sharedGenres.length * 2;

      // Same director
      if (m.director === target.director) score += 3;

      // Shared cast
      const sharedCast = m.cast.filter((c) => target.cast.includes(c));
      score += sharedCast.length;

      // Similar rating (within 0.5)
      if (Math.abs(m.rating - target.rating) <= 0.5) score += 1;

      // Similar year (within 5 years)
      if (Math.abs(m.year - target.year) <= 5) score += 1;

      return { movie: m, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return scored.map((s) => s.movie);
}

// Get movie by index (ID)
export function getMovieById(index: number): Movie | undefined {
  return movies[index];
}

// Get EDA statistics
export function getStats() {
  const totalMovies = movies.length;
  const avgRating =
    movies.reduce((sum, m) => sum + m.rating, 0) / totalMovies;

  // Genre distribution
  const genreDistribution: Record<string, number> = {};
  movies.forEach((m) =>
    m.genre.forEach((g) => {
      genreDistribution[g] = (genreDistribution[g] || 0) + 1;
    })
  );
  const topGenre = Object.entries(genreDistribution).sort(
    (a, b) => b[1] - a[1]
  )[0]?.[0];

  // Rating distribution
  const ratingBuckets: Record<string, number> = {
    "1-2": 0,
    "2-3": 0,
    "3-4": 0,
    "4-5": 0,
    "5-6": 0,
    "6-7": 0,
    "7-8": 0,
    "8-9": 0,
    "9-10": 0,
  };
  movies.forEach((m) => {
    const bucket = Math.floor(m.rating).toString();
    const key = `${bucket}-${parseInt(bucket) + 1}`;
    if (ratingBuckets[key] !== undefined) {
      ratingBuckets[key]++;
    } else {
      ratingBuckets["9-10"]++;
    }
  });

  // Year distribution by decade
  const decadeDistribution: Record<string, number> = {};
  movies.forEach((m) => {
    const decade = `${Math.floor(m.year / 10) * 10}s`;
    decadeDistribution[decade] = (decadeDistribution[decade] || 0) + 1;
  });

  // Movies this decade
  const currentDecade = Math.floor(new Date().getFullYear() / 10) * 10;
  const moviesThisDecade = movies.filter(
    (m) => m.year >= currentDecade
  ).length;

  // Top directors by movie count
  const directorCount: Record<string, number> = {};
  movies.forEach((m) => {
    directorCount[m.director] = (directorCount[m.director] || 0) + 1;
  });
  const topDirectors = Object.entries(directorCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, count]) => ({ name, count }));

  // Top actors by movie count
  const actorCount: Record<string, number> = {};
  movies.forEach((m) =>
    m.cast.forEach((c) => {
      actorCount[c] = (actorCount[c] || 0) + 1;
    })
  );
  const topActors = Object.entries(actorCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, count]) => ({ name, count }));

  // Top rated movies
  const topRated = [...movies]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 10);

  return {
    totalMovies,
    avgRating: Math.round(avgRating * 10) / 10,
    topGenre,
    moviesThisDecade,
    genreDistribution,
    ratingBuckets,
    decadeDistribution,
    topDirectors,
    topActors,
    topRated,
  };
}
