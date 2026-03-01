#!/bin/bash

# INSTANT FIX SCRIPT
# Run this if you got errors from start.sh

echo "🔧 Quick Fix - Installing Everything Now"
echo "========================================="
echo ""

# Go to project directory
cd "$(dirname "$0")"

echo "📍 Current directory: $(pwd)"
echo ""

# Check prerequisites
echo "1️⃣  Checking prerequisites..."

if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 not found!"
    echo ""
    echo "Please install Python 3.10+ first:"
    echo "   Ubuntu/Debian: sudo apt install python3 python3-venv python3-pip"
    echo "   macOS: brew install python@3.10"
    exit 1
fi
echo "   ✅ Python3: $(python3 --version)"

if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found!"
    echo ""
    echo "Please install Node.js 18+ first:"
    echo "   Ubuntu/Debian: curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - && sudo apt-get install -y nodejs"
    echo "   macOS: brew install node"
    exit 1
fi
echo "   ✅ Node.js: $(node --version)"
echo "   ✅ npm: $(npm --version)"

echo ""
echo "2️⃣  Setting up Backend..."
cd backend

if [ ! -d "venv" ]; then
    echo "   → Creating virtual environment..."
    python3 -m venv venv
    echo "   ✅ Virtual environment created"
fi

echo "   → Installing Python packages (may take 5-10 min)..."
source venv/bin/activate
pip install -q --upgrade pip
pip install -q -r requirements.txt

if [ $? -eq 0 ]; then
    echo "   ✅ Python packages installed"
else
    echo "   ❌ Failed to install Python packages"
    exit 1
fi

if [ ! -f ".env" ]; then
    cp .env.example .env 2>/dev/null || echo "DEVICE=cpu" > .env
fi

cd ..

echo ""
echo "3️⃣  Setting up Frontend..."
cd frontend

echo "   → Installing Node packages (may take 2-5 min)..."
npm install --silent

if [ $? -eq 0 ]; then
    echo "   ✅ Node packages installed"
else
    echo "   ❌ Failed to install Node packages"
    exit 1
fi

cd ..

echo ""
echo "========================================="
echo "✅ SETUP COMPLETE!"
echo "========================================="
echo ""
echo "Now run: ./start.sh"
echo ""
