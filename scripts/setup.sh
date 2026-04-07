#!/bin/bash
# MovieMate Setup Script
# Installs dependencies and sets up the environment

set -e

echo "🎬 MovieMate — Setup"
echo "===================="
echo ""

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required but not installed."
    echo "   Install from: https://www.python.org/downloads/"
    exit 1
fi

echo "✅ Python $(python3 --version)"

# Create virtual environment
if [ ! -d ".venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv .venv
fi

# Activate and install
echo "📦 Installing dependencies..."
source .venv/bin/activate
pip install -q -r requirements.txt

# Setup .env
if [ ! -f ".env" ] && [ -f ".env.example" ]; then
    echo "🔑 Copying .env.example to .env..."
    cp .env.example .env
    echo ""
    echo "⚠️  Edit .env and add your GEMINI_API_KEY:"
    echo "   Get one free at: https://makersuite.google.com/app/apikey"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "To start the chatbot:"
echo "   source .venv/bin/activate"
echo "   python3 app.py"
echo ""
echo "Or run without activation:"
echo "   python3 app.py"
