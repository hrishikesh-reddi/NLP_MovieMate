// Natural Language Understanding utilities for extracting movie search criteria

export interface ParsedQuery {
  query: string;
  genre?: string;
  yearFrom?: number;
  yearTo?: number;
  ratingMin?: number;
  actor?: string;
  director?: string;
  mood?: string;
  isSimilarRequest?: boolean;
  similarToMovie?: string;
}

// Genre mapping with aliases and synonyms
const GENRE_ALIASES: Record<string, string> = {
  scifi: "Sci-Fi",
  "sci-fi": "Sci-Fi",
  "science fiction": "Sci-Fi",
  scifi: "Sci-Fi",
  "sci fi": "Sci-Fi",
  horror: "Horror",
  scary: "Horror",
  terrifying: "Horror",
  thriller: "Thriller",
  suspense: "Thriller",
  suspenseful: "Thriller",
  comedy: "Comedy",
  funny: "Comedy",
  humorous: "Comedy",
  drama: "Drama",
  dramatic: "Drama",
  romance: "Romance",
  romantic: "Romance",
  love: "Romance",
  action: "Action",
  action: "Action",
  adventure: "Adventure",
  animated: "Animation",
  animation: "Animation",
  cartoon: "Animation",
  documentary: "Documentary",
  docs: "Documentary",
  musical: "Musical",
  music: "Musical",
  fantasy: "Fantasy",
  magical: "Fantasy",
  mystery: "Mystery",
  detective: "Mystery",
  war: "War",
  wartime: "War",
  military: "War",
  crime: "Crime",
  criminal: "Crime",
  gangster: "Crime",
  western: "Western",
  cowboy: "Western",
  biography: "Biography",
  biopic: "Biography",
  sport: "Sport",
  sports: "Sport",
  "film-noir": "Film-Noir",
  noir: "Film-Noir",
};

// Mood to genre mapping
const MOOD_GENRES: Record<string, string[]> = {
  "feel-good": ["Comedy", "Romance", "Animation", "Musical"],
  feelgood: ["Comedy", "Romance", "Animation", "Musical"],
  happy: ["Comedy", "Romance", "Animation"],
  uplifting: ["Comedy", "Drama", "Musical", "Animation"],
  sad: ["Drama", "War"],
  depressing: ["Drama", "War"],
  emotional: ["Drama", "Romance"],
  exciting: ["Action", "Adventure", "Thriller"],
  thrilling: ["Thriller", "Action", "Crime"],
  romantic: ["Romance", "Drama"],
  scary: ["Horror", "Thriller"],
  frightening: ["Horror", "Thriller"],
  intense: ["Thriller", "Action", "Crime", "War"],
  mindblowing: ["Sci-Fi", "Thriller", "Mystery"],
  mindblowing: ["Sci-Fi", "Thriller", "Mystery"],
  "mind-bending": ["Sci-Fi", "Thriller", "Mystery"],
  thought: ["Sci-Fi", "Drama"],
  nostalgic: ["Drama", "Comedy"],
  classic: ["Drama", "Crime", "Romance"],
  epic: ["Adventure", "Drama", "War", "Fantasy"],
  fun: ["Comedy", "Adventure", "Animation"],
  dark: ["Crime", "Thriller", "Horror", "Drama"],
  inspiring: ["Drama", "Biography", "Musical"],
  educational: ["Documentary", "Biography"],
  informative: ["Documentary"],
};

// Known actors for fuzzy matching
const KNOWN_ACTORS = [
  "Leonardo DiCaprio",
  "Tom Hanks",
  "Brad Pitt",
  "Morgan Freeman",
  "Al Pacino",
  "Robert De Niro",
  "Matt Damon",
  "Christian Bale",
  "Will Smith",
  "Denzel Washington",
  "Samuel L. Jackson",
  "Anthony Hopkins",
  "Jack Nicholson",
  "Harrison Ford",
  "Keanu Reeves",
  "Tom Cruise",
  "Robert Downey Jr.",
  "Chris Evans",
  "Chris Hemsworth",
  "Scarlett Johansson",
  "Natalie Portman",
  "Angelina Jolie",
  "Meryl Streep",
  "Cate Blanchett",
  "Emma Stone",
  "Jennifer Lawrence",
  "Charlize Theron",
  "Viola Davis",
  "Joaquin Phoenix",
  "Daniel Day-Lewis",
  "Heath Ledger",
  "Javier Bardem",
  "Timothee Chalamet",
  "Ryan Gosling",
  "Ryan Reynolds",
  "Jake Gyllenhaal",
  "Ben Affleck",
  "Michael Fassbender",
  "Tom Hardy",
  "Idris Elba",
  "Gary Oldman",
  "Steve Carell",
  "Jim Carrey",
  "Adam Sandler",
  "Hugh Jackman",
  "Arnold Schwarzenegger",
  "Sylvester Stallone",
  "Bruce Willis",
  "Nicolas Cage",
  "John Travolta",
  "Mark Wahlberg",
  "Jason Statham",
  "Dwayne Johnson",
  "Chris Pratt",
];

// Known directors for fuzzy matching
const KNOWN_DIRECTORS = [
  "Christopher Nolan",
  "Steven Spielberg",
  "Martin Scorsese",
  "Quentin Tarantino",
  "Stanley Kubrick",
  "Ridley Scott",
  "David Fincher",
  "Denis Villeneuve",
  "James Cameron",
  "Peter Jackson",
  "Francis Ford Coppola",
  "Alfred Hitchcock",
  "Tim Burton",
  "Woody Allen",
  "Wes Anderson",
  "Coen Brothers",
  "Bong Joon-ho",
  "Park Chan-wook",
  "Hayao Miyazaki",
  "Guy Ritchie",
  "Michael Mann",
  "Oliver Stone",
  "Brian De Palma",
  "Alejandro G. Iñárritu",
  "Paul Thomas Anderson",
  "Damien Chazelle",
  "Jordan Peele",
  "Taika Waititi",
  "Rian Johnson",
  "Yorgos Lanthimos",
];

// Parse year expressions
function parseYearExpression(text: string): { yearFrom?: number; yearTo?: number } {
  const result: { yearFrom?: number; yearTo?: number } = {};

  // "after 2010" -> yearFrom: 2010
  const afterMatch = text.match(/after\s+(19|20)\d{2}/i);
  if (afterMatch) {
    result.yearFrom = parseInt(afterMatch[0].match(/\d{4}/)![0]);
  }

  // "before 2000" -> yearTo: 2000
  const beforeMatch = text.match(/before\s+(19|20)\d{2}/i);
  if (beforeMatch) {
    result.yearTo = parseInt(beforeMatch[0].match(/\d{4}/)![0]);
  }

  // "from 1990 to 2000" / "between 1990 and 2000"
  const rangeMatch = text.match(
    /(?:from|between)\s+(19|20)\d{2}\s+(?:to|and)\s+(19|20)\d{2}/i
  );
  if (rangeMatch) {
    const years = text.match(/\d{4}/g);
    if (years && years.length >= 2) {
      result.yearFrom = parseInt(years[0]);
      result.yearTo = parseInt(years[1]);
    }
  }

  // "90s" -> 1990-1999
  const decadeMatch = text.match(/(19|20)?(\d0)s/i);
  if (decadeMatch && !afterMatch && !beforeMatch && !rangeMatch) {
    const decadeStr = decadeMatch[0].replace(/s$/i, "");
    let decade = parseInt(decadeStr);
    if (decade < 100) {
      decade += 1900;
    }
    result.yearFrom = decade;
    result.yearTo = decade + 9;
  }

  // "in 2010" -> exact year
  const exactMatch = text.match(/(?:in|from)\s+(19|20)\d{2}(?!\d)/i);
  if (exactMatch && !afterMatch && !beforeMatch && !rangeMatch && !decadeMatch) {
    const year = parseInt(exactMatch[0].match(/\d{4}/)![0]);
    result.yearFrom = year;
    result.yearTo = year;
  }

  // "recent" / "latest" / "new" -> last 5 years
  if (/(?:recent|latest|new(?:est)?|modern)\s*(?:movies?|films?)/i.test(text)) {
    result.yearFrom = new Date().getFullYear() - 5;
  }

  return result;
}

// Parse rating expression
function parseRatingExpression(text: string): number | undefined {
  // "rated above 8" / "higher than 8"
  const aboveMatch = text.match(
    /(?:rated?\s*(?:above|over|higher|greater)\s*(?:than)?\s*|rating\s*(?:above|over|higher|greater)\s*(?:than)?\s*|more\s*than\s*)(\d+\.?\d*)/i
  );
  if (aboveMatch) {
    return parseFloat(aboveMatch[1]);
  }

  // "top rated" / "highly rated" / "best rated"
  if (/(?:top|highly|best)\s*rated/i.test(text)) {
    return 8.0;
  }

  // "rated at least 7"
  const atleastMatch = text.match(
    /(?:rated?\s*(?:at least|min(?:imum)?)\s*)(\d+\.?\d*)/i
  );
  if (atleastMatch) {
    return parseFloat(atleastMatch[1]);
  }

  return undefined;
}

// Extract actor from text
function extractActor(text: string): string | undefined {
  // Direct matching with known actors
  for (const actor of KNOWN_ACTORS) {
    const parts = actor.toLowerCase().split(" ");
    // Check full name match
    if (text.toLowerCase().includes(actor.toLowerCase())) {
      return actor;
    }
    // Check last name match for short forms
    if (parts.length > 1) {
      const lastName = parts[parts.length - 1];
      const firstName = parts[0];
      // Match "DiCaprio" pattern
      if (
        lastName.length > 3 &&
        text.toLowerCase().includes(lastName.toLowerCase()) &&
        text.toLowerCase().includes(firstName.toLowerCase())
      ) {
        return actor;
      }
    }
  }

  // "starring X" / "with X" / "featuring X"
  const starringMatch = text.match(
    /(?:starring|with|featuring|by\s+(?:actor|actress))\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/
  );
  if (starringMatch) {
    return starringMatch[1];
  }

  return undefined;
}

// Extract director from text
function extractDirector(text: string): string | undefined {
  // "directed by X" / "X directed" / "X films" / "X movies"
  const directedByMatch = text.match(
    /(?:directed\s*by|director)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)?)/
  );
  if (directedByMatch) {
    return directedByMatch[1];
  }

  // Check known directors
  for (const director of KNOWN_DIRECTORS) {
    if (text.toLowerCase().includes(director.toLowerCase())) {
      return director;
    }
    // Last name match
    const parts = director.toLowerCase().split(" ");
    if (parts.length > 1) {
      const lastName = parts[parts.length - 1];
      if (
        lastName.length > 3 &&
        text.toLowerCase().includes(lastName.toLowerCase())
      ) {
        return director;
      }
    }
  }

  // "X's films" / "X's movies" / "films by X"
  const filmsByMatch = text.match(
    /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)['']?\s*(?:films?|movies?)/
  );
  if (filmsByMatch) {
    return filmsByMatch[1];
  }

  return undefined;
}

// Extract mood keywords
function extractMood(text: string): string | undefined {
  const lower = text.toLowerCase();
  for (const mood of Object.keys(MOOD_GENRES)) {
    if (lower.includes(mood)) {
      return mood;
    }
  }
  return undefined;
}

// Extract genre from text
function extractGenre(text: string): string | undefined {
  const lower = text.toLowerCase();

  for (const [alias, genre] of Object.entries(GENRE_ALIASES)) {
    // Word boundary matching
    const regex = new RegExp(`\\b${alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
    if (regex.test(lower)) {
      return genre;
    }
  }

  return undefined;
}

// Check if it's a "movies like X" query
function checkSimilarRequest(text: string): { isSimilar: boolean; movie?: string } {
  const patterns = [
    /(?:movies?|films?|something)\s+(?:like|similar to|similar)\s+(?:to\s+)?["']?([A-Z][^"']+)["']?/i,
    /(?:similar|comparable)\s+(?:to|with|movies?|films?)\s+["']?([A-Z][^"']+)["']?/i,
    /anything\s+(?:like|similar to)\s+["']?([A-Z][^"']+)["']?/i,
    /can\s+you\s+(?:recommend|suggest)\s+(?:something|anything)\s+(?:like|similar to)\s+["']?([A-Z][^"']+)["']?/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return { isSimilar: true, movie: match[1].trim() };
    }
  }

  return { isSimilar: false };
}

// Main NLU function
export function parseMovieQuery(input: string): ParsedQuery {
  const result: ParsedQuery = { query: input };

  // Check for similar movie requests
  const { isSimilar, movie: similarMovie } = checkSimilarRequest(input);
  if (isSimilar && similarMovie) {
    result.isSimilarRequest = true;
    result.similarToMovie = similarMovie;
    // Remove the "like X" part for further processing
    input = input.replace(
      /(?:movies?|films?|something)\s+(?:like|similar to)\s+(?:to\s+)?["']?[A-Z][^"']*["']?/i,
      ""
    );
  }

  // Extract genre
  const genre = extractGenre(input);
  if (genre) result.genre = genre;

  // Extract mood
  const mood = extractMood(input);
  if (mood) result.mood = mood;

  // Extract year expressions
  const yearResult = parseYearExpression(input);
  if (yearResult.yearFrom) result.yearFrom = yearResult.yearFrom;
  if (yearResult.yearTo) result.yearTo = yearResult.yearTo;

  // Extract rating
  const ratingMin = parseRatingExpression(input);
  if (ratingMin) result.ratingMin = ratingMin;

  // Extract actor
  const actor = extractActor(input);
  if (actor) result.actor = actor;

  // Extract director
  const director = extractDirector(input);
  if (director) result.director = director;

  return result;
}

// Convert parsed query to search params for movieData.ts
export function toSearchParams(parsed: ParsedQuery): {
  genre?: string;
  yearFrom?: number;
  yearTo?: number;
  ratingMin?: number;
  actor?: string;
  director?: string;
  query?: string;
} {
  const params: Record<string, unknown> = {};

  if (parsed.genre) params.genre = parsed.genre;
  if (parsed.yearFrom) params.yearFrom = parsed.yearFrom;
  if (parsed.yearTo) params.yearTo = parsed.yearTo;
  if (parsed.ratingMin) params.ratingMin = parsed.ratingMin;
  if (parsed.actor) params.actor = parsed.actor;
  if (parsed.director) params.director = parsed.director;
  if (parsed.query) params.query = parsed.query;

  return params;
}

// Get mood-based genres
export function getMoodGenres(mood: string): string[] {
  return MOOD_GENRES[mood.toLowerCase()] || [];
}
