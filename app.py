"""
MovieMate — AI Movie Discovery Chatbot
Main application entry point.

Usage:
    python3 app.py            # Run Gemini-powered chatbot (1000 movies)
    python3 app.py --backup   # Run rule-based fallback (216 movies)
"""

import os
import sys
import argparse
import pandas as pd
import numpy as np
from sentence_transformers import SentenceTransformer
from dotenv import load_dotenv

# Add src to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from moviemate.chatbot.parser import NLUQueryParser
from moviemate.chatbot.gemini_bot import GeminiResponseGenerator
from moviemate.chatbot.rule_based_bot import RuleBasedMovieBot
from moviemate.search import MovieSearchEngine
from moviemate.web.app import create_gradio_app

load_dotenv()


def get_project_root() -> str:
    """Get the project root directory."""
    return os.path.dirname(os.path.abspath(__file__))


def load_data(use_backup: bool = False):
    """
    Load movie dataset and embeddings.

    Args:
        use_backup: If True, load 216-movie JSON dataset. Else load 1000-movie CSV.

    Returns:
        Tuple of (DataFrame, embeddings np.array)
    """
    root = get_project_root()
    data_dir = os.path.join(root, 'data', 'embeddings')

    if use_backup:
        print("📊 Loading backup dataset (216 movies)...")
        df = pd.read_json(os.path.join(root, 'data', 'embeddings', 'movies.json'))
        emb_file = os.path.join(data_dir, 'movie_embeddings.npy')
    else:
        print("📊 Loading IMDb Top 1000 dataset...")
        df_raw = pd.read_csv(os.path.join(data_dir, 'imdb_top_1000.csv'))
        df = _parse_imdb_csv(df_raw)
        emb_file = os.path.join(data_dir, 'imdb_embeddings.npy')

    print(f"✅ Loaded {len(df)} movies")

    if os.path.exists(emb_file):
        print("🧠 Loading pre-computed embeddings...")
        embeddings = np.load(emb_file)
    else:
        print("🧠 Generating embeddings (this takes 1-2 minutes)...")
        model = SentenceTransformer('all-MiniLM-L6-v2')
        embeddings = model.encode(df['combined_text'].tolist(), show_progress_bar=True)
        np.save(emb_file, embeddings)
        print("✅ Embeddings saved!")

    return df, embeddings


def _parse_imdb_csv(df_raw: pd.DataFrame) -> pd.DataFrame:
    """Parse the IMDb Top 1000 CSV into a clean DataFrame."""
    import re

    def parse_title(title):
        match = re.match(r'\d+\.\s*(.*?)\s*\((\d{4})\)', str(title))
        return (match.group(1).strip(), int(match.group(2))) if match else (str(title), None)

    def parse_duration(d):
        match = re.search(r'(\d+)', str(d))
        return int(match.group(1)) if match else None

    def parse_genres(g):
        return [x.strip() for x in g.split(',')] if isinstance(g, str) else [g]

    def parse_cast_info(info):
        director, cast = "", []
        if isinstance(info, str):
            dm = re.search(r'Director(?:s)?:\s*([^|]+)', info)
            if dm:
                director = dm.group(1).strip()
            sm = re.search(r'Stars?:\s*([^|]+)', info)
            if sm:
                cast = [s.strip() for s in sm.group(1).split(',')]
        return director, cast

    def clean_text(t):
        return ' '.join(t.lower().split()) if isinstance(t, str) else t

    df = pd.DataFrame()
    df['title'] = df_raw['Title'].apply(lambda x: parse_title(x)[0])
    df['year'] = df_raw['Title'].apply(lambda x: parse_title(x)[1])
    df['duration'] = df_raw['Duration'].apply(parse_duration)
    df['rating'] = df_raw['Rate'].astype(float)
    df['metascore'] = pd.to_numeric(df_raw['Metascore'], errors='coerce')
    df['genre'] = df_raw['Genre'].apply(parse_genres)
    df['plot'] = df_raw['Description'].fillna('No plot available.')
    df['certificate'] = df_raw['Certificate'].fillna('Not Rated')

    cd = df_raw['Info'].apply(parse_cast_info)
    df['director'] = cd.apply(lambda x: x[0])
    df['cast'] = cd.apply(lambda x: x[1])

    df['title_clean'] = df['title'].apply(clean_text)
    df['director_clean'] = df['director'].apply(clean_text)
    df['plot_clean'] = df['plot'].apply(clean_text)
    df['genre_clean'] = df['genre'].apply(lambda x: sorted([g.lower() for g in x]))
    df['cast_clean'] = df['cast'].apply(lambda x: [clean_text(c) for c in x])

    df['combined_text'] = (
        "Title: " + df['title_clean'] + ". "
        + "Genres: " + df['genre_clean'].apply(lambda x: ', '.join(x)) + ". "
        + "Director: " + df['director_clean'] + ". "
        + "Cast: " + df['cast_clean'].apply(lambda x: ', '.join(x)) + ". "
        + "Plot: " + df['plot_clean'] + ". "
        + "Year: " + df['year'].astype(str) + ". "
        + "Rating: " + df['rating'].astype(str) + "."
    )

    df['rating'] = df['rating'].fillna(df['rating'].median())
    df['duration'] = df['duration'].fillna(df['duration'].median())
    df['plot_clean'] = df['plot_clean'].fillna('No plot available.')
    df['director_clean'] = df['director_clean'].fillna('Unknown')

    return df


class MovieBot:
    """Unified movie chatbot interface."""

    def __init__(self, df, embeddings, use_gemini: bool = True):
        self.df = df
        self.history = []
        self.parser = NLUQueryParser(df)
        self.search = MovieSearchEngine(df, embeddings, SentenceTransformer('all-MiniLM-L6-v2'))
        self.ai = GeminiResponseGenerator(df, use_gemini=use_gemini)

    def retrieve(self, intent: dict, k: int = 8) -> list:
        """Retrieve movies based on parsed intent."""
        if intent.get('specific_movie'):
            movie = self.search.get_movie_by_title(intent['specific_movie'])
            return [movie] if movie else []

        if intent.get('similar_to'):
            candidates = self.search.search_similar_to(intent['similar_to'], k)
            return self.search.filter_results(candidates, intent) or candidates

        candidates = self.search.search_by_query(intent['raw_query'], k)
        filtered = self.search.filter_results(candidates, intent)
        return filtered if len(filtered) >= 3 else candidates[:k]

    def chat(self, query: str) -> tuple:
        """
        Process a chat message and return response + movies.

        Returns:
            Tuple of (response_text, movies_list)
        """
        self.history.append({'role': 'user', 'content': query})
        intent = self.parser.parse(query, self.history)
        movies = self.retrieve(intent)
        response = self.ai.generate(query, intent, movies, self.history)

        self.history.append({
            'role': 'assistant',
            'content': response,
            '_meta': {'genres': intent['genres'], 'min_year': intent['min_year']}
        })

        return response, movies


def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(description="MovieMate - AI Movie Discovery")
    parser.add_argument('--backup', action='store_true', help='Use backup 216-movie dataset')
    parser.add_argument('--port', type=int, default=7860, help='Server port')
    args = parser.parse_args()

    print("\n🎬 MovieMate — AI Movie Discovery")
    print("=" * 40)

    # Load data
    df, embeddings = load_data(use_backup=args.backup)

    # Check Gemini availability
    use_gemini = bool(os.getenv('GEMINI_API_KEY'))
    mode = "Gemini AI (1000 movies)" if use_gemini and not args.backup else "Rule-based (216 movies)"
    print(f"🤖 Mode: {mode}")

    # Initialize bot
    bot = MovieBot(df, embeddings, use_gemini=use_gemini)

    # Create and launch app
    app = create_gradio_app(bot, use_suggestions=True)

    print(f"\n🚀 Launching at http://localhost:{args.port}")
    print("💡 Press Ctrl+C to stop\n")

    app.launch(server_name="0.0.0.0", server_port=args.port, inbrowser=True)


if __name__ == "__main__":
    main()
