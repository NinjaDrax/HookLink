#!/bin/bash

# HookLinks - Quick Setup Script
# Run this from the hooklinks/ root directory

echo ""
echo "🔗  HookLinks Setup"
echo "===================="

# Check Node
if ! command -v node &> /dev/null; then
  echo "❌  Node.js is not installed. Please install Node.js v18+ first."
  exit 1
fi
NODE_VER=$(node -v)
echo "✅  Node.js $NODE_VER found"

# Install backend deps
echo ""
echo "📦  Installing backend dependencies..."
cd backend && npm install
if [ $? -ne 0 ]; then echo "❌  Backend install failed"; exit 1; fi
echo "✅  Backend ready"

# Install frontend deps
echo ""
echo "📦  Installing frontend dependencies..."
cd ../frontend && npm install
if [ $? -ne 0 ]; then echo "❌  Frontend install failed"; exit 1; fi
echo "✅  Frontend ready"

echo ""
echo "🎉  Setup complete!"
echo ""
echo "👉  To start the app, open TWO terminals:"
echo ""
echo "   Terminal 1 (Backend):"
echo "   cd backend && node server.js"
echo ""
echo "   Terminal 2 (Frontend):"
echo "   cd frontend && npm run dev"
echo ""
echo "   Then open: http://localhost:3000"
echo ""
echo "⚙   Don't forget to set ADMIN_EMAIL in backend/.env"
echo ""
