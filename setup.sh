#!/bin/bash

# Quran Recitation App - Setup Script
# This script sets up both backend and frontend

set -e  # Exit on error

echo "🕌 Quran Recitation App - Setup Script"
echo "======================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Python
echo "📋 Checking prerequisites..."
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python 3 is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Python 3 found${NC}"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js found${NC}"

echo ""

# Backend Setup
echo "🐍 Setting up Backend..."
echo "------------------------"
cd backend

# Create virtual environment
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# Copy .env if not exists
if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cp .env.example .env
fi

echo -e "${GREEN}✓ Backend setup complete${NC}"
echo ""

# Frontend Setup
echo "⚛️  Setting up Frontend..."
echo "-------------------------"
cd ../frontend

# Install dependencies
echo "Installing Node.js dependencies..."
npm install

echo -e "${GREEN}✓ Frontend setup complete${NC}"
echo ""

# Success message
echo ""
echo "======================================"
echo -e "${GREEN}✨ Setup Complete!${NC}"
echo "======================================"
echo ""
echo "To start the application:"
echo ""
echo "1. Start the Backend:"
echo "   cd backend"
echo "   source venv/bin/activate"
echo "   python main.py"
echo ""
echo "2. Start the Frontend (in a new terminal):"
echo "   cd frontend"
echo "   npm run dev"
echo ""
echo "3. Open http://localhost:3000 in your browser"
echo ""
echo -e "${YELLOW}Note: First run may take longer as AI models are downloaded${NC}"
echo ""
