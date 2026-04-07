"""
FAISS-based movie search engine using sentence embeddings.
Supports semantic search, similarity lookup, and filtered retrieval.
"""

import numpy as np
import faiss
import pandas as pd


class MovieSearchEngine:
    """FAISS-powered search engine for movie retrieval."""

    def __init__(self, df: pd.DataFrame, embeddings: np.ndarray, embedding_model):
        """
        Initialize the search engine.

        Args:
            df: Pandas DataFrame with movie data
            embeddings: NumPy array of movie embeddings
            embedding_model: Sentence transformer model for encoding queries
        """
        self.df = df
        self.embeddings = embeddings
        self.model = embedding_model
        self.index = self._build_index(embeddings)

    def _build_index(self, embeddings: np.ndarray) -> faiss.IndexFlatIP:
        """Build and return a FAISS index from embeddings."""
        faiss.normalize_L2(embeddings)
        dim = embeddings.shape[1]
        index = faiss.IndexFlatIP(dim)
        index.add(embeddings)
        return index

    def search_by_query(self, query: str, k: int = 8) -> list:
        """
        Search movies by natural language query using semantic similarity.

        Args:
            query: Natural language search query
            k: Number of results to return

        Returns:
            List of movie dicts with similarity scores
        """
        query_emb = self.model.encode([query])
        faiss.normalize_L2(query_emb)
        scores, indices = self.index.search(query_emb, k * 3)

        candidates = []
        for i, idx in enumerate(indices[0]):
            if idx < len(self.df):
                movie = self.df.iloc[idx].to_dict()
                movie['similarity_score'] = float(scores[0][i])
                candidates.append(movie)

        return candidates

    def search_similar_to(self, movie_title: str, k: int = 8) -> list:
        """
        Find movies similar to a given title.

        Args:
            movie_title: Reference movie title
            k: Number of results to return

        Returns:
            List of similar movie dicts (excluding the reference)
        """
        ref = self.df[self.df['title_clean'].str.contains(movie_title, case=False, na=False)]
        if ref.empty:
            return []

        ref_movie = ref.iloc[0]
        ref_emb = self.model.encode([ref_movie['combined_text']])
        faiss.normalize_L2(ref_emb)
        scores, indices = self.index.search(ref_emb, k + 5)

        results = []
        for i, idx in enumerate(indices[0]):
            if idx < len(self.df) and self.df.iloc[idx]['title'] != ref_movie['title']:
                movie = self.df.iloc[idx].to_dict()
                movie['similarity_score'] = float(scores[0][i])
                results.append(movie)
                if len(results) >= k:
                    break

        return results

    def filter_results(self, candidates: list, intent: dict) -> list:
        """
        Filter candidate results based on user intent.

        Args:
            candidates: List of candidate movie dicts
            intent: Parsed user intent

        Returns:
            Filtered list of movies
        """
        filtered = []
        for movie in candidates:
            if intent['genres'] and not any(
                g in [x.lower() for x in movie['genre']] for g in intent['genres']
            ):
                continue
            if intent['min_year'] and movie['year'] < intent['min_year']:
                continue
            if intent['max_year'] and movie['year'] > intent['max_year']:
                continue
            if intent['min_rating'] and movie['rating'] < intent['min_rating']:
                continue
            if intent['actor'] and intent['actor'].lower() not in [
                c.lower() for c in movie['cast']
            ]:
                continue
            if intent['director'] and intent['director'].lower() != movie['director'].lower():
                continue
            filtered.append(movie)

        return filtered

    def get_movie_by_title(self, title: str) -> dict:
        """Get a single movie by exact or partial title match."""
        movie = self.df[self.df['title_clean'] == title.lower()]
        if movie.empty:
            movie = self.df[self.df['title'].str.lower() == title.lower()]
        if not movie.empty:
            return movie.iloc[0].to_dict()
        return None
