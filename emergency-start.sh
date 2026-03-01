#!/bin/bash

# EMERGENCY START SCRIPT
# Use this if setup.sh or start.sh fail

echo "🆘 Emergency Setup & Start"
echo "=========================="
echo ""

# Check Python3
if ! command -v python3 &> /dev/null; then
    echo "❌ ERROR: python3 not found"
    echo "Please install Python 3.10+ first:"
    echo "  Ubuntu/Debian: sudo apt install python3 python3-venv python3-pip"
    echo "  macOS: brew install python@3.10"
    echo "  Arch: sudo pacman -S python"
    exit 1
fi

# Check Node
if ! command -v node &> /dev/null; then
    echo "❌ ERROR: node not found"
    echo "Please install Node.js 18+ first:"
    echo "  Ubuntu/Debian: curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - && sudo apt-get install -y nodejs"
    echo "  macOS: brew install node"
    echo "  Arch: sudo pacman -S nodejs npm"
    exit 1
fi

echo "✅ Python3: $(python3 --version)"
echo "✅ Node: $(node --version)"
echo "✅ npm: $(npm --version)"
echo ""

# Backend Setup
echo "📦 Setting up Backend..."
cd backend || exit 1

# Create venv
if [ ! -d "venv" ]; then
    echo "  → Creating virtual environment..."
    python3 -m venv venv || {
        echo "❌ Failed to create venv"
        echo "Try: sudo apt install python3-venv"
        exit 1
    }
fi

# Activate and install
echo "  → Installing dependencies (this may take 5-10 minutes)..."
source venv/bin/activate
pip install --upgrade pip > /dev/null 2>&1
pip install -r requirements.txt || {
    echo "❌ Failed to install Python dependencies"
    echo "Check your internet connection and try again"
    exit 1
}

# Create .env
if [ ! -f ".env" ]; then
    cp .env.example .env 2>/dev/null || echo "DEVICE=cpu" > .env
fi

echo "✅ Backend ready"
cd ..

# Frontend Setup
echo ""
echo "📦 Setting up Frontend..."
cd frontend || exit 1

echo "  → Installing dependencies (this may take 2-5 minutes)..."
npm install || {
    echo "❌ Failed to install Node dependencies"
    echo "Check your internet connection and try again"
    exit 1
}

echo "✅ Frontend ready"
cd ..

echo ""
echo "========================================"
echo "✅ Setup Complete!"
echo "========================================"
echo ""
echo "Starting servers now..."
echo ""

# Start Backend
echo "🐍 Starting Backend..."
cd backend
source venv/bin/activate
python main.py > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..

echo "⏳ Waiting for backend to start..."
sleep 5

# Check if backend started
if ps -p $BACKEND_PID > /dev/null; then
    echo "✅ Backend running (PID: $BACKEND_PID)"
else
    echo "❌ Backend failed to start"
    echo "Check backend.log for errors"
    exit 1
fi

# Start Frontend
echo ""
echo "⚛️  Starting Frontend..."
cd frontend
npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

echo "⏳ Waiting for frontend to start..."
sleep 5

# Check if frontend started
if ps -p $FRONTEND_PID > /dev/null; then
    echo "✅ Frontend running (PID: $FRONTEND_PID)"
else
    echo "❌ Frontend failed to start"
    echo "Check frontend.log for errors"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

echo ""
echo "========================================"
echo "🎉 SUCCESS! Application is running!"
echo "========================================"
echo ""
echo "📍 URLs:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:8000"
echo "   API Docs: http://localhost:8000/docs"
echo ""
echo "📄 Logs:"
echo "   Backend:  backend.log"
echo "   Frontend: frontend.log"
echo ""
echo "🛑 To stop:"
echo "   kill $BACKEND_PID $FRONTEND_PID"
echo "   or press Ctrl+C and run: pkill -f 'python main.py' && pkill -f 'next dev'"
echo ""
echo "💡 Open http://localhost:3000 in your browser now!"
echo ""

# Function to cleanup
cleanup() {
    echo ""
    echo "🛑 Shutting down..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    echo "✅ Stopped"
    exit 0
}

trap cleanup SIGINT SIGTERM

# Keep script running
echo "Press Ctrl+C to stop all servers"
wait
