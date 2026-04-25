#!/bin/bash

# Vigil Frontend Setup Script

echo "🌍 Vigil Frontend Setup"
echo "======================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
    echo "✅ .env file created"
    echo ""
    echo "⚠️  Please edit .env and set your VITE_API_BASE_URL"
    echo "   Example: VITE_API_BASE_URL=http://localhost:8000"
    echo ""
else
    echo "✅ .env file already exists"
    echo ""
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Setup complete!"
    echo ""
    echo "Next steps:"
    echo "1. Make sure your backend is running"
    echo "2. Verify VITE_API_BASE_URL in .env points to your backend"
    echo "3. Run 'npm run dev' to start the development server"
    echo "4. Open http://localhost:5173 in your browser"
    echo ""
else
    echo ""
    echo "❌ Installation failed. Please check the error messages above."
    exit 1
fi
