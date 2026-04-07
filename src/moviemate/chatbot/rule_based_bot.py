"""
Rule-based movie bot fallback.
Provides structured responses without requiring an LLM.
"""

import pandas as pd


class RuleBasedMovieBot:
    """Rule-based movie chatbot — no API key required."""

    def __init__(self, df: pd.DataFrame):
        self.df = df

    def respond(self, query: str, movies: list, intent: dict) -> str:
        """
        Generate a rule-based response.

        Args:
            query: User query
            movies: Retrieved movie candidates
            intent: Parsed intent

        Returns:
            Formatted response string
        """
        if not movies:
            return (
                f"I couldn't find movies matching '{query}'. "
                "Try broadening your search:\n"
                "• Try 'horror movies' instead of '90s horror'\n"
                "• Search for a specific actor or director\n"
                "• Try a different genre or decade"
            )

        resp = f"I found **{len(movies)} movies** for you! 🎬\n\n"
        for i, m in enumerate(movies, 1):
            g = ', '.join(m['genre']) if isinstance(m['genre'], list) else m['genre']
            c = ', '.join(m['cast'][:3]) if isinstance(m['cast'], list) else m['cast']
            resp += f"**{i}. {m['title']}** ({m['year']}) ⭐ {m['rating']}/10\n"
            resp += f"   🎭 Genre: {g}\n"
            resp += f"   🎬 Director: {m['director']}\n"
            resp += f"   👥 Cast: {c}\n"
            resp += f"   ⏱️ Duration: {m['duration']} min\n"
            resp += f"   📖 {m['plot'][:150]}...\n\n"

        return resp

    def get_movie_info(self, title: str) -> str:
        """Get formatted info card for a movie."""
        movie = self.df[self.df['title_clean'] == title.lower()]
        if movie.empty:
            movie = self.df[self.df['title'] == title]
        if movie.empty:
            return f"Movie '{title}' not found."

        m = movie.iloc[0]
        g = ', '.join(m['genre']) if isinstance(m['genre'], list) else m['genre']
        c = ', '.join(m['cast'][:5]) if isinstance(m['cast'], list) else str(m['cast'])

        return (
            f"🎬 **{m['title']} ({m['year']})**\n\n"
            f"⭐ {m['rating']}/10 | 🎭 {g}\n"
            f"🎬 {m['director']} | 👥 {c}\n"
            f"📖 {m['plot']}"
        )
