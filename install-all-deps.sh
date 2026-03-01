#!/bin/bash

# Complete Backend Installation Script
# Installs all dependencies in the correct order

cd /home/bakemono/Documents/quran-recitation-app/backend

echo "🔧 Installing All Backend Dependencies"
echo "======================================"
echo ""

# Activate venv
echo "Activating virtual environment..."
source venv/bin/activate

# Step 1: Upgrade core tools
echo ""
echo "1️⃣  Upgrading pip, setuptools, wheel..."
pip install --upgrade pip setuptools wheel
echo "   ✅ Done"

# Step 2: Install PyTorch (the heaviest one - may take a few minutes)
echo ""
echo "2️⃣  Installing PyTorch (this will take a few minutes)..."
pip install torch==2.1.2
echo "   ✅ Done"

# Step 3: Install transformers and audio libraries
echo ""
echo "3️⃣  Installing ML and audio libraries..."
pip install transformers==4.37.0
pip install librosa==0.10.1
pip install soundfile==0.12.1
echo "   ✅ Done"

# Step 4: Install NumPy and basic dependencies
echo ""
echo "4️⃣  Installing core dependencies..."
pip install numpy==1.24.3
pip install pydantic==2.5.3
pip install python-dotenv==1.0.0
pip install requests==2.31.0
echo "   ✅ Done"

# Step 5: Install FastAPI and web framework
echo ""
echo "5️⃣  Installing FastAPI and web server..."
pip install fastapi==0.109.0
pip install uvicorn[standard]==0.27.0
pip install websockets==12.0
pip install python-multipart==0.0.6
echo "   ✅ Done"

# Step 6: Install Arabic text processing
echo ""
echo "6️⃣  Installing Arabic text libraries..."
pip install arabic-reshaper==3.0.0
pip install python-bidi==0.4.2
pip install pyarabic==0.6.15
echo "   ✅ Done"

# Step 7: Install additional utilities
echo ""
echo "7️⃣  Installing utility packages..."
pip install difflib-fuzzy==1.0.5
pip install pydub==0.25.1
echo "   ✅ Done"

# Step 8: Install Whisper (the speech recognition model)
echo ""
echo "8️⃣  Installing OpenAI Whisper..."
pip install openai-whisper==20231117
echo "   ✅ Done"

# Verify installation
echo ""
echo "9️⃣  Verifying installation..."
python -c "import fastapi; print('   ✅ FastAPI')"
python -c "import torch; print('   ✅ PyTorch')"
python -c "import transformers; print('   ✅ Transformers')"
python -c "import librosa; print('   ✅ Librosa')"
python -c "import uvicorn; print('   ✅ Uvicorn')"

echo ""
echo "======================================"
echo "✅ ALL DEPENDENCIES INSTALLED!"
echo "======================================"
echo ""
echo "Now run:"
echo "  cd /home/bakemono/Documents/quran-recitation-app/backend"
echo "  source venv/bin/activate"
echo "  python main.py"
echo ""
