"""
Gemini-powered response generator with fallback to rule-based responses.
Handles conversational AI, context building, and dynamic prompt generation.
"""

import os


class GeminiResponseGenerator:
    """Generates AI-powered conversational responses using Google Gemini."""

    def __init__(self, df, use_gemini: bool = True):
        """
        Initialize response generator.

        Args:
            df: Movie DataFrame
            use_gemini: Whether to use Gemini API (falls back to rules if False)
        """
        self.df = df
        self.use_gemini = use_gemini
        self.model = None

        if use_gemini:
            self._init_gemini()

    def _init_gemini(self):
        """Initialize Gemini API client."""
        api_key = os.getenv('GEMINI_API_KEY')
        if not api_key:
            self.use_gemini = False
            return

        try:
            import google.generativeai as genai
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel('gemini-1.5-flash')
            print("✅ Gemini API configured successfully!")
        except Exception as e:
            print(f"⚠️  Gemini API error: {e}")
            print("   Falling back to rule-based responses")
            self.use_gemini = False

    def generate(self, query: str, intent: dict, movies: list, history: list = None) -> str:
        """
        Generate a response using Gemini or fallback.

        Args:
            query: User's query
            intent: Parsed intent dict
            movies: Retrieved movie candidates
            history: Conversation history

        Returns:
            Generated response string
        """
        if self.use_gemini and self.model:
            return self._gemini_response(query, intent, movies, history)
        return self._fallback_response(query, intent, movies)

    def _gemini_response(self, query, intent, movies, history=None) -> str:
        """Generate response via Gemini API."""
        try:
            context = self._build_context(intent, movies)

            history_context = ""
            if history and len(history) > 0:
                history_context = "\nCONVERSATION HISTORY:\n"
                for msg in history[-6:]:
                    role = "User" if msg.get('role') == 'user' else "MovieMate"
                    content = msg.get('content', '')[:200]
                    history_context += f"{role}: {content}\n"
                history_context += "\n"

            system_prompt = self._build_prompt(intent, query, context, history_context)
            response = self.model.generate_content(system_prompt)
            return response.text

        except Exception as e:
            print(f"Gemini error: {e}")
            return self._fallback_response(query, intent, movies)

    def _build_prompt(self, intent, query, context, history_context) -> str:
        """Build dynamic system prompt based on conversation context."""
        question_type = intent.get('question_type', 'general')

        if intent.get('specific_movie') and question_type:
            return f"""You are MovieMate, a passionate film buff and expert movie critic having a friendly conversation with a movie lover.

{history_context}CURRENT MOVIE: {context}

USER'S QUESTION: {query}

HOW TO RESPOND:
- Talk like a knowledgeable friend who LOVES movies
- Be enthusiastic and share your passion for cinema
- Answer their specific question directly and thoroughly
- Share interesting insights, behind-the-scenes facts, or analysis
- Use natural language - NOT robotic or template-like
- Include relevant emojis naturally (not every sentence)
- Keep it conversational: use phrases like "Oh great choice!", "Here's the thing..."
- End with an engaging follow-up question to keep the conversation going
- Reference previous messages if relevant to show you're listening

IMPORTANT: Don't just list facts. Have a real conversation about the movie!"""

        elif intent.get('specific_movie'):
            return f"""You are MovieMate, an enthusiastic film expert chatting with someone about movies.

{history_context}MOVIE TO DISCUSS: {context}

USER ASKED: {query}

RESPONSE STYLE:
- Be warm, friendly, and passionate about cinema
- Give a comprehensive but engaging overview
- Share what makes this movie special and worth watching
- Use conversational tone: "This film is absolutely...", "You're going to love..."
- Add interesting tidbits or why it matters in cinema history
- Emojis: Use naturally to add personality
- End by asking what aspect they'd like to explore more

Make it feel like you're recommending a movie to a friend!"""

        elif movies and len(movies) > 0:
            return f"""You are MovieMate, a friendly movie enthusiast helping someone discover great films.

{history_context}RETRIEVED MOVIES: {context}

USER WANTS: {query}

HOW TO RECOMMEND:
- Be excited about sharing these movies!
- For each movie, explain WHY they should watch it
- Share what makes each one special or unique
- Compare them if relevant: "If you liked X, you'll love Y because..."
- Use natural, enthusiastic language
- Include key info (year, director, rating) naturally in conversation
- End with: Ask what sounds interesting or if they want more suggestions

Make recommendations feel personal and thoughtful, not like a list!"""

        else:
            return f"""You are MovieMate, a helpful and knowledgeable movie fan.

{history_context}USER ASKED: {query}
{context}

HOW TO HELP:
- Be friendly and conversational
- If you have results, present them engagingly
- If no results, be helpful and suggest alternatives
- Keep the conversation flowing
- Ask what they're in the mood for

Be helpful and keep chatting!"""

    def _build_context(self, intent, movies) -> str:
        """Build context string for Gemini."""
        context = ""

        if intent.get('specific_movie'):
            movie = self.df[self.df['title'] == intent['specific_movie']]
            if movie.empty:
                movie = self.df[self.df['title_clean'] == intent['specific_movie'].lower()]

            if not movie.empty:
                m = movie.iloc[0]
                genres = ', '.join(m['genre']) if isinstance(m['genre'], list) else m['genre']
                cast = ', '.join(m['cast'][:6]) if isinstance(m['cast'], list) and m['cast'] else 'N/A'
                director = m['director'] if m['director'] else 'N/A'

                context = f"""Title: {m['title']} ({m['year']})
Rating: {m['rating']}/10 | Genre: {genres}
Director: {director} | Cast: {cast}
Duration: {m['duration']} min
Plot: {m['plot']}"""

        elif movies:
            context = "RECOMMENDATIONS:\n"
            for i, m in enumerate(movies[:8], 1):
                genres = ', '.join(m['genre']) if isinstance(m['genre'], list) else m['genre']
                cast = ', '.join(m['cast'][:3]) if isinstance(m['cast'], list) else 'N/A'
                context += f"{i}. {m['title']} ({m['year']}) ⭐{m['rating']} | {genres} | Dir: {m['director']}\n"

        return context or "No specific movies found. Provide general movie knowledge."

    def _fallback_response(self, query, intent, movies) -> str:
        """Rule-based fallback when Gemini is unavailable."""
        if intent.get('specific_movie'):
            return self._about_movie(intent['specific_movie'])

        if movies:
            response = f"🎬 **Found {len(movies)} great movies!**\n\n"
            for i, m in enumerate(movies[:6], 1):
                genres = ', '.join(m['genre']) if isinstance(m['genre'], list) else m['genre']
                emoji = "🏆" if m['rating'] >= 9 else "⭐" if m['rating'] >= 8.5 else "👍"
                response += f"**{i}. {m['title']} ({m['year']})** {emoji} ⭐{m['rating']}\n"
                response += f"   🎭 {genres} | 🎬 {m['director']}\n"
                response += f"   {m['plot'][:120]}...\n\n"
            return response + "\n💡 Ask me about any movie for details!"

        return f"I couldn't find movies for '{query}'. Try genres, actors, or decades!"

    def _about_movie(self, title: str) -> str:
        """Generate info card for a specific movie."""
        movie = self.df[self.df['title_clean'] == title.lower()]
        if movie.empty:
            movie = self.df[self.df['title'] == title]
        if movie.empty:
            return f"I couldn't find '{title}'. Try another movie?"

        m = movie.iloc[0]
        genres = ', '.join(m['genre']) if isinstance(m['genre'], list) else m['genre']
        cast = ', '.join(m['cast'][:5]) if isinstance(m['cast'], list) else str(m['cast'])

        return f"""🎬 **{m['title']} ({m['year']})**

⭐ **Rating:** {m['rating']}/10
🎭 **Genre:** {genres}
🎬 **Director:** {m['director']}
👥 **Cast:** {cast}
⏱️ **Duration:** {m['duration']} minutes

📖 **Plot:**
{m['plot']}

💡 Ask about: plot • cast • similar movies • behind the scenes"""
