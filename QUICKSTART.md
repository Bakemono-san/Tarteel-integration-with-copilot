# ⚡ Quick Start Guide

Get up and running with Quran Recitation App in 5 minutes!

---

## 📋 Prerequisites Check

Before starting, ensure you have:

- [ ] **Python 3.10+** installed
  ```bash
  python3 --version  # Should show 3.10 or higher
  ```

- [ ] **Node.js 18+** installed
  ```bash
  node --version  # Should show v18 or higher
  ```

- [ ] **Git** installed (optional, for cloning)
  ```bash
  git --version
  ```

---

## 🚀 Installation (3 Steps)

### Step 1: Get the Code

```bash
# Navigate to the project
cd quran-recitation-app
```

### Step 2: Run Setup Script (Recommended)

```bash
# Make script executable
chmod +x setup.sh

# Run automated setup
./setup.sh
```

The script will:
- ✅ Check prerequisites
- ✅ Set up Python virtual environment
- ✅ Install Python dependencies
- ✅ Install Node.js dependencies
- ✅ Create configuration files
- ✅ Download AI models (first run only)

### Step 3: Start the Application

```bash
# Run the start script
chmod +x start.sh
./start.sh
```

**That's it!** 🎉

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

---

## 🔧 Manual Installation (Alternative)

If the automated script doesn't work, follow these steps:

### Backend Setup

```bash
cd backend

# Create virtual environment
python3 -m venv venv

# Activate it
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies (may take 5-10 minutes first time)
pip install -r requirements.txt

# Create config file
cp .env.example .env

# Start backend
python main.py
```

**Backend is running!** 🐍
- Server: http://localhost:8000
- API Docs: http://localhost:8000/docs

### Frontend Setup (New Terminal)

```bash
cd frontend

# Install dependencies (2-3 minutes)
npm install

# Start frontend
npm run dev
```

**Frontend is running!** ⚛️
- App: http://localhost:3000

---

## 🎯 First Time Usage

### 1. Open the App
Navigate to http://localhost:3000 in your browser

### 2. Grant Microphone Permission
When prompted, click "Allow" to let the app access your microphone

### 3. Select an Ayah
- Choose a Surah (try Surah Al-Fatihah #1)
- Select an Ayah number
- Click "Start Practice"

### 4. Test Recording
- Click the 🎤 microphone button
- Say "Bismillah" or recite any ayah
- Click 🔴 to stop
- Wait for analysis (2-5 seconds)

### 5. View Results
You'll see:
- ✅ Your transcription
- 📊 Accuracy score
- 📝 Tajweed rules detected
- 🔧 Corrections and suggestions

---

## 🐛 Troubleshooting

### Backend Won't Start

**Problem**: Port 8000 already in use
```bash
# Find and kill process on port 8000
lsof -ti:8000 | xargs kill -9

# Or use different port
uvicorn main:app --port 8001
```

**Problem**: Model download fails
```bash
# Check internet connection
# Models are downloaded from Hugging Face
# First run may take 5-15 minutes depending on connection
```

**Problem**: CUDA errors
```bash
# Force CPU mode in backend/.env
DEVICE=cpu
```

### Frontend Won't Start

**Problem**: Port 3000 already in use
```bash
# Kill process
lsof -ti:3000 | xargs kill -9

# Or specify different port
npm run dev -- -p 3001
```

**Problem**: Module not found
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### WebSocket Connection Failed

**Problem**: Can't connect to backend
- Ensure backend is running on http://localhost:8000
- Check console for CORS errors
- Verify WebSocket URL in `frontend/lib/useRecitationWebSocket.ts`

### Microphone Not Working

**Problem**: Can't access microphone
- Check browser permissions (usually top-left of address bar)
- Try a different browser (Chrome/Firefox recommended)
- Ensure no other app is using the microphone
- Use HTTPS in production (HTTP is fine for localhost)

### Poor Recognition Quality

**Problem**: Inaccurate transcriptions
- Ensure quiet environment
- Speak clearly and at moderate pace
- Hold microphone 15-20cm from mouth
- Wait for models to fully download (first run)
- Try different model in backend/.env

---

## 🔍 Verify Installation

### Backend Health Check

```bash
curl http://localhost:8000/health
```

Expected response:
```json
{
  "status": "healthy",
  "model_loaded": true,
  "model_type": "whisper_tarteel",
  "device": "cpu"
}
```

### Test API Endpoint

```bash
curl http://localhost:8000/api/quran/ayah/1/1
```

Expected response:
```json
{
  "surahNumber": 1,
  "ayahNumber": 1,
  "text": "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
  "surahName": "الفاتحة",
  "surahEnglishName": "Al-Fatihah"
}
```

### Frontend Loading

Open http://localhost:3000 - You should see:
- Beautiful homepage with gradient background
- "Quran Recitation App" title
- "Start Practicing" button
- No console errors

---

## 📚 Next Steps

1. **Read Full Documentation**: Check [README.md](README.md)
2. **Explore API**: Visit http://localhost:8000/docs
3. **Practice**: Try different surahs and ayahs
4. **Customize**: Edit `.env` files for your needs
5. **Deploy**: See deployment guide in README

---

## 🆘 Still Need Help?

1. **Check Logs**:
   ```bash
   # Backend logs
   cd backend && tail -f logs/app.log
   
   # Frontend console
   Open browser DevTools (F12)
   ```

2. **Common Issues**: See [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

3. **Report Bug**: Create an issue with:
   - Operating System
   - Python/Node versions
   - Error message
   - Steps to reproduce

---

## ✅ Installation Checklist

- [ ] Python 3.10+ installed
- [ ] Node.js 18+ installed
- [ ] Backend dependencies installed
- [ ] Frontend dependencies installed
- [ ] Backend running on port 8000
- [ ] Frontend running on port 3000
- [ ] Can access http://localhost:3000
- [ ] Microphone permission granted
- [ ] Successfully recorded and got feedback

**All checked?** You're ready to practice! 🎉

---

## 🎓 Learning Resources

- **Tajweed Rules**: [Islamic Online University](https://tajweedinstitute.com)
- **Quran Recitation**: [QuranAcademy.org](https://quranacademy.org)
- **Arabic Pronunciation**: [ArabicPod101](https://www.arabicpod101.com)
- **Tarteel AI**: [Tarteel.io](https://www.tarteel.io)

Happy Learning! 📖✨

## Prerequisites Check

Before starting, ensure you have:
- ✅ Python 3.10 or higher
- ✅ Node.js 18 or higher
- ✅ At least 4GB free disk space (for AI models)
- ✅ Microphone access in your browser

## Option 1: Automatic Setup (Recommended)

### Step 1: Run Setup Script

```bash
cd /home/bakemono/Documents/quran-recitation-app
chmod +x setup.sh start.sh
./setup.sh
```

This will:
- Create Python virtual environment
- Install all Python dependencies
- Install all Node.js dependencies
- Set up configuration files

### Step 2: Start the Application

```bash
./start.sh
```

This starts both backend and frontend servers automatically.

### Step 3: Open Your Browser

Navigate to: **http://localhost:3000**

## Option 2: Manual Setup

### Backend Setup

```bash
cd backend

# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create environment file
cp .env.example .env

# Start server
python main.py
```

Backend will run on **http://localhost:8000**

### Frontend Setup

Open a **new terminal**:

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will run on **http://localhost:3000**

## Option 3: Docker Setup

```bash
# Build and start all services
docker-compose up --build

# Or run in background
docker-compose up -d
```

Access the app at **http://localhost:3000**

## First Run Notes

⚠️ **Important**: The first time you start the backend, it will download AI models from Hugging Face. This may take 5-10 minutes depending on your internet speed.

Models being downloaded:
- Tarteel Whisper model (~500MB)
- Arabic Wav2Vec2 model (~1.2GB)

## Testing the Application

1. **Home Page** (http://localhost:3000)
   - You should see the landing page with "Start Reciting" button

2. **API Health Check** (http://localhost:8000)
   - Should return: `{"message": "Quran Recitation API with Tarteel AI"}`

3. **API Documentation** (http://localhost:8000/docs)
   - Interactive Swagger UI for testing endpoints

4. **WebSocket Connection**
   - Navigate to recitation page
   - Check browser console for "WebSocket connected" message

## Troubleshooting

### Backend Issues

**Problem**: `ModuleNotFoundError: No module named 'XXX'`
```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt --force-reinstall
```

**Problem**: `CUDA out of memory`
```bash
# Edit backend/.env and set:
DEVICE=cpu
```

**Problem**: Models not downloading
```bash
# Check your internet connection
# Alternatively, manually download models:
python -c "from transformers import pipeline; pipeline('automatic-speech-recognition', model='openai/whisper-base')"
```

### Frontend Issues

**Problem**: `Module not found` errors
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

**Problem**: Port 3000 already in use
```bash
# Kill the process using port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
npm run dev -- -p 3001
```

**Problem**: WebSocket connection failed
- Ensure backend is running on port 8000
- Check CORS settings in backend/.env
- Check browser console for detailed errors

### Microphone Issues

**Problem**: Microphone permission denied
- Check browser settings → Site settings → Microphone
- Ensure you're using HTTPS or localhost
- Try a different browser (Chrome/Firefox recommended)

**Problem**: No audio being recorded
- Check system microphone is not muted
- Test microphone in system settings
- Check browser DevTools → Console for errors

## Performance Tips

### For Better Speed:

1. **Use GPU** (if available)
   ```bash
   # Install CUDA-enabled PyTorch
   pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
   ```

2. **Reduce Model Size**
   - Use `whisper-tiny` or `whisper-base` instead of larger models
   - Edit `backend/models/tarteel_model.py` and change model name

3. **Optimize Audio Settings**
   - Record in 16kHz sample rate
   - Use mono audio instead of stereo

## Next Steps

Once everything is running:

1. **Select a Surah** - Start with Al-Fatihah (Surah 1)
2. **Click "Start Reciting"**
3. **Allow microphone access** when prompted
4. **Click the microphone button** and recite
5. **Click again to stop** and receive feedback

## Development Mode

For active development:

### Backend with auto-reload:
```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend with auto-reload:
```bash
cd frontend
npm run dev
```

Both will automatically reload when you make code changes.

## Getting Help

- Check the main [README.md](README.md) for detailed documentation
- View API docs at http://localhost:8000/docs
- Check browser console for frontend errors
- Check terminal output for backend errors

## Default Test Data

The app comes with sample Surahs:
- Surah 1 (Al-Fatihah) - 7 ayahs
- Surah 2 (Al-Baqarah) - First 5 ayahs
- Surah 112 (Al-Ikhlas) - 4 ayahs

You can add more Surahs by extending `backend/services/quran_service.py`

---

**Ready to start? Run `./setup.sh` then `./start.sh`** 🚀
