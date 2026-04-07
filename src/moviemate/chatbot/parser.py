"""
NLU Query Parser - Parses natural language queries into structured intents.
Handles genre aliases, mood detection, year ranges, actors, directors, and question types.
"""

import re
import pandas as pd


class NLUQueryParser:
    """Parses natural language movie queries into structured intent objects."""

    GENRE_ALIASES = {
        'scary': 'horror', 'frightening': 'horror', 'creepy': 'horror',
        'funny': 'comedy', 'hilarious': 'comedy', 'laugh': 'comedy',
        'romantic': 'romance', 'love': 'romance',
        'action': 'action', 'fight': 'action', 'explosions': 'action',
        'drama': 'drama', 'emotional': 'drama',
        'sci-fi': 'sci-fi', 'science fiction': 'sci-fi', 'space': 'sci-fi', 'futuristic': 'sci-fi',
        'thriller': 'thriller', 'suspense': 'thriller', 'tension': 'thriller',
        'animation': 'animation', 'animated': 'animation', 'cartoon': 'animation',
        'comedy': 'comedy', 'horror': 'horror', 'crime': 'crime',
        'detective': 'crime', 'murder': 'crime', 'adventure': 'adventure',
        'quest': 'adventure', 'journey': 'adventure', 'fantasy': 'fantasy',
        'magic': 'fantasy', 'mystery': 'mystery', 'whodunit': 'mystery',
        'musical': 'musical', 'music': 'musical', 'war': 'war', 'military': 'war',
        'western': 'western', 'documentary': 'documentary', 'biography': 'biography',
        'biopic': 'biography', 'history': 'history', 'historical': 'history',
        'sport': 'sport', 'superhero': 'action', 'feel-good': 'comedy', 'feel good': 'comedy',
        'uplifting': 'animation', 'mind-bending': 'sci-fi', 'mind bending': 'sci-fi',
        'psychological': 'thriller', 'dark': 'thriller', 'intense': 'thriller',
        'family': 'animation', 'kids': 'animation', 'children': 'animation',
    }

    MOOD_GENRE = {
        'feel-good': ['comedy', 'animation', 'romance'],
        'happy': ['comedy', 'animation', 'romance'],
        'sad': ['drama', 'romance'],
        'excited': ['action', 'adventure', 'sci-fi'],
        'scared': ['horror', 'thriller'],
        'thoughtful': ['drama', 'sci-fi', 'mystery'],
        'nostalgic': ['drama', 'romance', 'history'],
        'inspired': ['biography', 'drama', 'sport'],
    }

    def __init__(self, df: pd.DataFrame):
        """Initialize parser with movie dataframe for entity lookup."""
        self.df = df
        # Pre-compute lookup sets for faster matching
        self._actor_set = set()
        for cl in df['cast']:
            self._actor_set.update([c.lower() for c in cl])
        self._director_set = set(df['director'].str.lower().unique())

    def parse(self, query: str, history: list = None) -> dict:
        """
        Parse a natural language query into a structured intent.

        Args:
            query: The user's natural language query
            history: Optional conversation history for context

        Returns:
            dict: Structured intent with genres, year filters, entities, etc.
        """
        ql = query.lower()
        intent = {
            'genres': [],
            'min_year': None,
            'max_year': None,
            'min_rating': None,
            'actor': None,
            'director': None,
            'similar_to': None,
            'specific_movie': None,
            'query_type': 'general',
            'raw_query': query,
            'question_type': None,
        }

        # Check for specific movie mention
        self._detect_specific_movie(intent, ql)

        # Determine question type
        self._detect_question_type(intent, ql)

        # Extract similar-to intent
        m = re.search(r'(?:movies?|films?)\s+(?:like|similar\s+to|about)\s+(.+)', ql)
        if m:
            intent['similar_to'] = m.group(1).strip()
            intent['query_type'] = 'similar'

        # Extract year filters
        ya = re.search(r'(?:after|since|from)\s+(\d{4})', ql)
        if ya:
            intent['min_year'] = int(ya.group(1))

        yb = re.search(r'(?:before)\s+(\d{4})', ql)
        if yb:
            intent['max_year'] = int(yb.group(1))

        dm = re.search(r'(\d{3})0s', ql)
        if dm:
            d = int(dm.group(1) + '0')
            intent['min_year'] = d
            intent['max_year'] = d + 9

        # Rating filter
        if re.search(r'(?:highly\s+rated|best|good|top|great)', ql):
            intent['min_rating'] = 7.5

        # Genre detection
        self._detect_genres(intent, ql)

        # Entity detection (actors, directors)
        self._detect_entities(intent, ql)

        # Intent classification
        if any(w in ql for w in ['recommend', 'suggest', 'show', 'find']):
            intent['query_type'] = 'recommend'

        # Context from history
        if history:
            self._apply_history_context(intent, history)

        return intent

    def _detect_specific_movie(self, intent: dict, ql: str):
        """Detect if user is asking about a specific movie."""
        for _, movie in self.df.iterrows():
            title_lower = movie['title'].lower()
            title_clean = movie['title_clean']

            if len(title_lower) > 2:
                if title_lower in ql or title_clean in ql:
                    intent['specific_movie'] = movie['title']
                    intent['query_type'] = 'about_movie'
                    break
            elif len(title_lower) <= 2:
                if re.search(r'\b' + re.escape(title_lower) + r'\b', ql):
                    intent['specific_movie'] = movie['title']
                    intent['query_type'] = 'about_movie'
                    break

    def _detect_question_type(self, intent: dict, ql: str):
        """Determine what aspect of a movie the user is asking about."""
        if any(w in ql for w in ['plot', 'story', 'about', 'what is', "what's"]):
            intent['question_type'] = 'plot'
        elif any(w in ql for w in ['director', 'directed', 'who directed']):
            intent['question_type'] = 'director'
        elif any(w in ql for w in ['actor', 'cast', 'star', 'who starred', 'who acted']):
            intent['question_type'] = 'cast'
        elif any(w in ql for w in ['rating', 'rated', 'how good', 'imdb', 'score']):
            intent['question_type'] = 'rating'
        elif any(w in ql for w in ['when', 'year', 'release', 'when came', 'when released']):
            intent['question_type'] = 'year'
        elif any(w in ql for w in ['how long', 'duration', 'runtime', 'minutes']):
            intent['question_type'] = 'duration'
        elif any(w in ql for w in ['genre', 'type', 'category', 'kind of']):
            intent['question_type'] = 'genre'
        elif any(w in ql for w in ['similar', 'like', 'recommend', 'suggest']):
            intent['question_type'] = 'similar'

    def _detect_genres(self, intent: dict, ql: str):
        """Detect genres from aliases and mood keywords."""
        for alias, genre in self.GENRE_ALIASES.items():
            if alias in ql and genre not in intent['genres']:
                intent['genres'].append(genre)

        for mood, genres in self.MOOD_GENRE.items():
            if mood in ql:
                intent['genres'].extend(genres)
                intent['genres'] = list(set(intent['genres']))

    def _detect_entities(self, intent: dict, ql: str):
        """Detect actor and director names in the query."""
        for a in self._actor_set:
            if a in ql:
                intent['actor'] = a.title()
                break

        for d in self._director_set:
            if d in ql:
                intent['director'] = d.title()
                break

    def _apply_history_context(self, intent: dict, history: list):
        """Apply context from conversation history."""
        for msg in history[-4:]:
            if msg.get('role') == 'assistant' and msg.get('_meta'):
                meta = msg['_meta']
                if not intent['genres'] and meta.get('genres'):
                    intent['genres'] = meta['genres']
                if not intent['min_year'] and meta.get('min_year'):
                    intent['min_year'] = meta['min_year']
