"""
Generate architecture diagram and wireframe images for README.
Run: python3 scripts/generate_assets.py
"""

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as patches
from matplotlib.patches import FancyBboxPatch, Rectangle, FancyArrowPatch
import numpy as np
import os

ASSETS_DIR = os.path.join(os.path.dirname(__file__), '..', 'assets')


def create_architecture_diagram():
    """Create a professional architecture diagram."""
    fig, ax = plt.subplots(1, 1, figsize=(14, 8))
    ax.set_xlim(0, 14)
    ax.set_ylim(0, 8)
    ax.axis('off')

    # Title
    ax.text(7, 7.5, 'MovieMate Architecture', fontsize=20, fontweight='bold', ha='center')
    ax.text(7, 7.1, 'AI-Powered Movie Discovery Pipeline', fontsize=12, ha='center', color='#666')

    # Box styles
    box_style = 'round,pad=0.5'

    # User / Gradio UI
    ax.add_patch(FancyBboxPatch((0.5, 5.5), 3, 1.8, boxstyle=box_style,
                                 edgecolor='#4285F4', facecolor='#E8F0FE', linewidth=2))
    ax.text(2, 6.7, '🌐 Gradio Web UI', fontsize=14, fontweight='bold', ha='center')
    ax.text(2, 6.2, 'Chat Interface', fontsize=11, ha='center', color='#444')
    ax.text(2, 5.8, '• Text input\n• Chat history\n• Suggestion buttons',
            fontsize=10, ha='center', color='#555')

    # Arrow: User → Chatbot
    ax.annotate('', xy=(4.5, 6.4), xytext=(3.5, 6.4),
                arrowprops=dict(arrowstyle='->', lw=2.5, color='#4285F4'))

    # Chatbot Engine
    ax.add_patch(FancyBboxPatch((4.5, 5.0), 3.5, 2.8, boxstyle=box_style,
                                 edgecolor='#EA4335', facecolor='#FCE8E6', linewidth=2))
    ax.text(6.25, 7.3, '🤖 Chatbot Engine', fontsize=14, fontweight='bold', ha='center')
    ax.text(6.25, 6.8, 'Core Logic', fontsize=11, ha='center', color='#444')
    ax.text(6.25, 6.3, '• NLU Parser\n• Intent Detection\n• Context Manager',
            fontsize=10, ha='center', color='#555')
    ax.text(6.25, 5.6, '• Response Generator\n• Conversation History',
            fontsize=10, ha='center', color='#555')

    # Arrow: Chatbot → Gemini
    ax.annotate('', xy=(9, 7.0), xytext=(8, 7.0),
                arrowprops=dict(arrowstyle='->', lw=2, color='#EA4335', linestyle='--'))

    # Gemini AI
    ax.add_patch(FancyBboxPatch((9, 6.3), 4.5, 1.5, boxstyle=box_style,
                                 edgecolor='#FBBC04', facecolor='#FEF7E0', linewidth=2))
    ax.text(11.25, 7.3, '✨ Gemini AI', fontsize=14, fontweight='bold', ha='center')
    ax.text(11.25, 6.8, 'Google Gemini 1.5 Flash', fontsize=10, ha='center', color='#444')

    # Arrow: Chatbot → Search
    ax.annotate('', xy=(9, 5.5), xytext=(8, 5.5),
                arrowprops=dict(arrowstyle='->', lw=2, color='#34A853'))

    # FAISS Search
    ax.add_patch(FancyBboxPatch((9, 4.5), 4.5, 1.8, boxstyle=box_style,
                                 edgecolor='#34A853', facecolor='#E6F4EA', linewidth=2))
    ax.text(11.25, 5.7, '🔍 FAISS Search', fontsize=14, fontweight='bold', ha='center')
    ax.text(11.25, 5.2, 'Vector Similarity Search', fontsize=10, ha='center', color='#444')

    # Sentence Transformer
    ax.add_patch(FancyBboxPatch((9, 1.5), 4.5, 2.2, boxstyle=box_style,
                                 edgecolor='#673AB7', facecolor='#EDE7F6', linewidth=2))
    ax.text(11.25, 3.1, '🧠 Sentence Transformer', fontsize=14, fontweight='bold', ha='center')
    ax.text(11.25, 2.6, 'all-MiniLM-L6-v2', fontsize=10, ha='center', color='#444')
    ax.text(11.25, 2.2, '• Query Encoding\n• Movie Embeddings\n• Semantic Vectors',
            fontsize=10, ha='center', color='#555')

    # Arrow: Search → Transformer
    ax.annotate('', xy=(11.25, 4.5), xytext=(11.25, 3.7),
                arrowprops=dict(arrowstyle='->', lw=2, color='#34A853'))

    # Dataset
    ax.add_patch(FancyBboxPatch((0.5, 1.5), 3.5, 2.2, boxstyle=box_style,
                                 edgecolor='#FF6F00', facecolor='#FFF3E0', linewidth=2))
    ax.text(2.25, 3.1, '📊 Dataset', fontsize=14, fontweight='bold', ha='center')
    ax.text(2.25, 2.6, 'IMDb Top 1000', fontsize=10, ha='center', color='#444')
    ax.text(2.25, 2.2, '• Movies.json (216)\n• imdb_top_1000.csv (1000)\n• Pre-computed .npy',
            fontsize=10, ha='center', color='#555')

    # Arrow: Dataset → Transformer
    ax.annotate('', xy=(4, 2.6), xytext=(3.5, 2.6),
                arrowprops=dict(arrowstyle='->', lw=2, color='#FF6F00'))

    # Feedback arrows
    ax.annotate('', xy=(8, 6.4), xytext=(9, 6.4),
                arrowprops=dict(arrowstyle='->', lw=1.5, color='#EA4335', linestyle='--'))
    ax.annotate('', xy=(8, 5.5), xytext=(9, 5.5),
                arrowprops=dict(arrowstyle='->', lw=1.5, color='#34A853', linestyle='--'))

    # Legend
    ax.text(2.25, 0.7, 'Data Flow: Solid → | Feedback: Dashed - - →',
            fontsize=10, ha='center', color='#888', style='italic')

    plt.tight_layout()
    path = os.path.join(ASSETS_DIR, 'images', 'diagrams', 'architecture.png')
    plt.savefig(path, dpi=150, bbox_inches='tight', facecolor='white')
    print(f"✅ Saved: {path}")
    plt.close()


def create_wireframe_chat():
    """Create a UI wireframe of the chat layout."""
    fig, ax = plt.subplots(1, 1, figsize=(12, 9))
    ax.set_xlim(0, 12)
    ax.set_ylim(0, 10)
    ax.axis('off')

    # Browser chrome
    ax.add_patch(Rectangle((0.3, 0.3), 11.4, 9.4, fill=False, edgecolor='#333', linewidth=1.5))
    ax.add_patch(Rectangle((0.3, 9), 11.4, 0.7, fill=True, facecolor='#f5f5f5', edgecolor='#333', linewidth=1.5))
    ax.text(6, 9.35, '🌐 localhost:7860 — MovieMate', fontsize=10, ha='center', color='#666')

    # Header
    ax.add_patch(Rectangle((0.5, 7.8), 11, 1.0, fill=True, facecolor='#4285F4', edgecolor='none'))
    ax.text(6, 8.4, '🎬 MovieMate — AI Movie Discovery', fontsize=16, fontweight='bold',
            ha='center', color='white')

    # Chat area
    ax.add_patch(Rectangle((0.5, 3.5), 11, 4.0, fill=True, facecolor='#fafafa',
                           edgecolor='#ddd', linewidth=1))
    ax.text(6, 7.2, '💬 Chat Area', fontsize=11, ha='center', color='#999')

    # User message bubble
    ax.add_patch(FancyBboxPatch((1.0, 6.0), 5, 0.8, boxstyle='round,pad=0.3',
                                 facecolor='#E3F2FD', edgecolor='#4285F4', linewidth=1))
    ax.text(3.5, 6.4, '"Suggest sci-fi movies after 2010"', fontsize=10, ha='center')

    # Bot response bubble
    ax.add_patch(FancyBboxPatch((1.0, 4.2), 10, 1.6, boxstyle='round,pad=0.3',
                                 facecolor='#F5F5F5', edgecolor='#ddd', linewidth=1))
    ax.text(6, 5.2, 'I found 8 movies for you! 🎬\n1. Interstellar (2014) ⭐ 8.6/10\n2. Inception (2010) ⭐ 8.8/10\n3. The Matrix (1999) ⭐ 8.7/10...',
            fontsize=9, ha='center')

    # Suggestion buttons
    ax.text(1.0, 3.1, '💡 Suggestions:', fontsize=10, fontweight='bold')
    btn_colors = ['#E8F5E9', '#E3F2FD', '#FFF3E0', '#F3E5F5', '#E0F7FA', '#FFF8E1']
    btn_texts = ['More sci-fi movies', 'Best rated films', 'More Christopher Nolan',
                 'Movies like Interstellar', 'Try thriller instead', 'Top rated dramas']
    for i, (color, text) in enumerate(zip(btn_colors, btn_texts)):
        x = 0.5 + i * 1.9
        ax.add_patch(FancyBboxPatch((x, 2.5), 1.7, 0.45, boxstyle='round,pad=0.1',
                                     facecolor=color, edgecolor='#888', linewidth=0.8))
        ax.text(x + 0.85, 2.72, text, fontsize=7, ha='center')

    # Input area
    ax.add_patch(Rectangle((0.5, 1.2), 8.5, 0.8, fill=True, facecolor='white',
                           edgecolor='#ccc', linewidth=1.5))
    ax.text(4.75, 1.6, 'Type your message...', fontsize=10, color='#999')

    # Send button
    ax.add_patch(FancyBboxPatch((9.2, 1.2), 2.3, 0.8, boxstyle='round,pad=0.1',
                                 facecolor='#4285F4', edgecolor='none'))
    ax.text(10.35, 1.6, 'Send', fontsize=11, fontweight='bold', ha='center', color='white')

    # Clear button
    ax.add_patch(FancyBboxPatch((9.2, 0.35), 2.3, 0.65, boxstyle='round,pad=0.1',
                                 facecolor='white', edgecolor='#ccc', linewidth=1))
    ax.text(10.35, 0.67, 'Clear', fontsize=10, ha='center', color='#666')

    # Number labels
    labels = [
        (6, 8.4, '1', '#4285F4'),
        (6, 7.2, '2', '#999'),
        (3.5, 6.4, '3', '#4285F4'),
        (6, 5.0, '4', '#EA4335'),
        (6, 2.72, '5', '#34A853'),
        (4.75, 1.6, '6', '#FBBC04'),
    ]
    for x, y, num, color in labels:
        ax.add_patch(patches.Circle((x - 2.8, y - 0.2), 0.25, facecolor=color, edgecolor='none'))
        ax.text(x - 2.8, y - 0.2, num, fontsize=9, fontweight='bold', ha='center', va='center', color='white')

    # Legend
    ax.text(6, -0.1, '1. Header  2. Chat Area  3. User Message  4. Bot Response  5. Suggestions  6. Input',
            fontsize=9, ha='center', color='#666', style='italic')

    plt.tight_layout()
    path = os.path.join(ASSETS_DIR, 'wireframes', 'chat_layout.png')
    plt.savefig(path, dpi=150, bbox_inches='tight', facecolor='white')
    print(f"✅ Saved: {path}")
    plt.close()


def create_query_examples():
    """Create a visual of example queries."""
    fig, ax = plt.subplots(1, 1, figsize=(10, 5))
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 5)
    ax.axis('off')

    ax.text(5, 4.6, '💬 Example Queries', fontsize=18, fontweight='bold', ha='center')
    ax.text(5, 4.2, 'Try these natural language questions', fontsize=12, ha='center', color='#666')

    queries = [
        ('🎭', 'Suggest sci-fi movies after 2010', '#E8F0FE'),
        ('👤', 'Leonardo DiCaprio movies', '#E8F5E9'),
        ('🎬', 'Christopher Nolan films', '#FFF3E0'),
        ('🎯', 'Movies like Shawshank Redemption', '#F3E5F5'),
        ('😊', 'Feel-good comedy movies', '#E0F7FA'),
        ('📅', 'Horror movies from the 90s', '#FFF8E1'),
    ]

    for i, (icon, text, color) in enumerate(queries):
        row = i // 3
        col = i % 3
        x = 0.5 + col * 3.2
        y = 3.5 - row * 1.3

        ax.add_patch(FancyBboxPatch((x, y - 0.2), 3, 0.8, boxstyle='round,pad=0.2',
                                     facecolor=color, edgecolor='#ccc', linewidth=1))
        ax.text(x + 0.3, y + 0.15, icon, fontsize=14)
        ax.text(x + 0.7, y + 0.15, text, fontsize=10, va='center')

    plt.tight_layout()
    path = os.path.join(ASSETS_DIR, 'wireframes', 'query_examples.png')
    plt.savefig(path, dpi=150, bbox_inches='tight', facecolor='white')
    print(f"✅ Saved: {path}")
    plt.close()


if __name__ == '__main__':
    print("🎨 Generating assets for README...")
    create_architecture_diagram()
    create_wireframe_chat()
    create_query_examples()
    print("✅ All assets generated!")
