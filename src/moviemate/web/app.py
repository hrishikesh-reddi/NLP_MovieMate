"""
Gradio Web Interface for MovieMate.
Creates the chat UI with dynamic suggestion buttons.
"""

import gradio as gr
from functools import partial


def generate_suggestions(intent: dict, movies: list) -> list:
    """Generate contextual suggestion buttons based on conversation."""
    suggestions = []

    if intent['genres']:
        for genre in intent['genres'][:2]:
            suggestions.append(f"More {genre} movies")
            suggestions.append(f"Best rated {genre} films")

    if intent.get('min_year'):
        suggestions.append(f"Movies after {intent['min_year'] + 5}")
    if intent.get('max_year'):
        suggestions.append(f"Movies before {intent['max_year'] - 5}")

    if movies:
        if not intent['actor'] and len(movies) > 0:
            cast_list = movies[0].get('cast', [])
            if isinstance(cast_list, list) and cast_list:
                suggestions.append(f"More {cast_list[0]} movies")

        if not intent['director'] and len(movies) > 0:
            director = movies[0].get('director', '')
            if director and director != 'Unknown':
                suggestions.append(f"More {director} films")

        if movies:
            suggestions.append(f"Movies like {movies[0]['title']}")

    if intent['genres']:
        other = ['comedy', 'drama', 'thriller', 'action', 'romance', 'sci-fi', 'horror']
        for g in other:
            if g not in intent['genres'] and len(suggestions) < 8:
                suggestions.append(f"Try {g} instead")
                break

    fallbacks = [
        "Show me top rated movies",
        "Suggest something random",
        "Feel-good movies",
        "Movies from the 90s",
        "Award-winning dramas",
        "Best action movies",
    ]
    while len(suggestions) < 3 and fallbacks:
        fb = fallbacks.pop(0)
        if fb not in suggestions:
            suggestions.append(fb)

    return suggestions[:6]


def create_gradio_app(bot, use_suggestions: bool = True):
    """
    Create and configure the Gradio chat interface.

    Args:
        bot: MovieBot instance with chat() method
        use_suggestions: Whether to show dynamic suggestion buttons

    Returns:
        Gradio Blocks app
    """
    with gr.Blocks(
        title="MovieMate - AI Movie Discovery",
        theme=gr.themes.Soft(),
        css="""
        .suggestion-btn { min-width: 150px !important; margin: 4px !important; }
        .gradio-container { max-width: 900px !important; }
        """
    ) as demo:
        gr.Markdown("# 🎬 MovieMate — AI Movie Discovery")
        gr.Markdown(
            "**Your intelligent movie assistant!** Ask about genres, actors, "
            "directors, decades, or 'movies like X'."
        )

        chatbot = gr.Chatbot(label="Conversation", height=500)
        msg = gr.Textbox(
            label="Your Message",
            placeholder="e.g. 'Suggest sci-fi movies after 2010' or 'Movies like Inception'...",
            lines=2,
        )

        with gr.Row():
            submit_btn = gr.Button("Send", variant="primary", scale=1)
            clear_btn = gr.Button("Clear Chat", variant="secondary", scale=1)

        suggestion_btns = []
        if use_suggestions:
            with gr.Column():
                gr.Markdown("**💡 Suggestions (click any to ask):**")
                suggestion_btns = [
                    gr.Button("", variant="secondary", elem_classes="suggestion-btn")
                    for _ in range(6)
                ]

        gr.Examples(
            examples=[
                "Suggest sci-fi movies after 2010",
                "Movies similar to The Shawshank Redemption",
                "Christopher Nolan films",
                "Feel-good comedy movies",
                "Horror movies from the 90s",
                "Leonardo DiCaprio movies",
            ],
            inputs=msg,
            label="Try these",
        )

        def respond(message, chat_history):
            if not message or not message.strip():
                empty = [""] * 6
                return "", chat_history, *empty

            bot.history.append({'role': 'user', 'content': message})
            intent = bot.parser.parse(message, bot.history)
            movies = bot.retrieve(intent)
            response = bot.ai.generate(message, intent, movies, bot.history)

            bot.history.append({
                'role': 'assistant',
                'content': response,
                '_meta': {'genres': intent['genres'], 'min_year': intent['min_year']}
            })

            chat_history.append((message, response))

            suggestions = generate_suggestions(intent, movies)
            buttons = suggestions + [""] * (6 - len(suggestions))

            return "", chat_history, *buttons

        def use_suggestion(text, chat_history):
            if not text:
                empty = [""] * 6
                return "", chat_history, *empty
            return respond(text, chat_history)

        submit_btn.click(respond, inputs=[msg, chatbot], outputs=[msg, chatbot] + suggestion_btns)
        msg.submit(respond, inputs=[msg, chatbot], outputs=[msg, chatbot] + suggestion_btns)

        for btn in suggestion_btns:
            btn.click(
                use_suggestion,
                inputs=[btn, chatbot],
                outputs=[msg, chatbot] + suggestion_btns,
            )

        def clear():
            bot.history = []
            return "", []

        clear_btn.click(clear, outputs=[msg, chatbot])

    return demo
