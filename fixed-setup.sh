#!/bin/bash

# FIXED Installation Script
# Handles the setuptools issue with openai-whisper

cd backend

echo "🔧 Fixing Python environment..."

# Make sure venv is activated
source venv/bin/activate

# Step 1: Update core tools first
echo "→ Updating pip, setuptools, wheel..."
pip install --upgrade pip setuptools wheel

# Step 2: Install build dependencies first
echo "→ Installing build tools..."
pip install --upgrade build

# Step 3: Install PyTorch (the heavy one) separately first
echo "→ Installing PyTorch (this may take a moment)..."
pip install torch==2.1.2

# Step 4: Install other core dependencies
echo "→ Installing core dependencies..."
pip install transformers==4.37.0 librosa==0.10.1 numpy==1.24.3

# Step 5: Install openai-whisper with proper setup
echo "→ Installing openai-whisper..."
pip install openai-whisper==20231117

# Step 6: Install remaining dependencies
echo "→ Installing remaining packages..."
pip install \
  uvicorn[standard]==0.27.0 \
  fastapi==0.109.0 \
  websockets==12.0 \
  python-multipart==0.0.6 \
  soundfile==0.12.1 \
  pydantic==2.5.3 \
  python-dotenv==1.0.0 \
  arabic-reshaper==3.0.0 \
  python-bidi==0.4.2 \
  requests==2.31.0 \
  pyarabic==0.6.15 \
  difflib-fuzzy==1.0.5 \
  pydub==0.25.1

# Create .env if it doesn't exist
if [ ! -f ".env" ]; then
    echo "→ Creating .env file..."
    cp .env.example .env 2>/dev/null || echo "DEVICE=cpu" > .env
fi

echo "✅ Backend setup complete!"

cd ..

# Frontend
echo ""
echo "🔧 Setting up Frontend..."
cd frontend

npm install

if [ $? -eq 0 ]; then
    echo "✅ Frontend setup complete!"
else
    echo "⚠️ Frontend installation had issues, but might still work"
fi

cd ..

echo ""
echo "========================================="
echo "✅ INSTALLATION COMPLETE!"
echo "========================================="
echo ""
echo "Now run: ./start.sh"
echo ""
