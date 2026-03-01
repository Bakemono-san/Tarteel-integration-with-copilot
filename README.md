# Quran Recitation App with Tarteel AI

A modern, production-ready web application for practicing Quran recitation with **real-time Tajweed correction** using Tarteel's open-source AI models.

![Quran Recitation App](https://img.shields.io/badge/Status-Active-success)
![Python](https://img.shields.io/badge/Python-3.10+-blue)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![License](https://img.shields.io/badge/License-MIT-green)

---

## 🚀 Quick Start

### Development
```bash
./start.sh
```

### Production Deployment
```bash
./deploy.sh
```

📖 **[Complete Deployment Guide →](DEPLOYMENT.md)**

---

## 🌟 Features

### 🎤 Advanced Speech Recognition
- **Tarteel AI Integration**: Uses Tarteel's fine-tuned Whisper and Wav2Vec2 models optimized for Quranic recitation
- **Real-time Audio Processing**: WebSocket-based streaming for instant feedback
- **Multiple Model Support**: Automatically selects best available model (Tarteel Whisper > Wav2Vec2 > OpenAI Whisper)
- **Audio Visualization**: Real-time frequency visualization during recording

### 📖 Comprehensive Tajweed Analysis
- **Ghunna (غنة)**: Nasal sound detection with duration checking
- **Qalqalah (قلقلة)**: Echo/bounce sound for ق ط ب ج د
- **Madd (مد)**: Prolongation rules (Tabee'i, Lazim, Leen)
- **Idgham (إدغام)**: Merging rules (with/without Ghunna)
- **Ikhfa (إخفاء)**: Hiding rules (Halqi & Shafawi)
- **Iqlab (إقلاب)**: Conversion of Noon Sakinah to Meem
- **Idhaar (إظهار)**: Clear pronunciation rules
- **Noon & Meem Sakinah Rules**: Complete rule coverage

### ✅ Intelligent Error Detection
- **Character-level Analysis**: Detects substitutions, omissions, and insertions
- **Severity Classification**: High, medium, low severity errors
- **Smart Corrections**: Contextual suggestions for improvement
- **Visual Feedback**: Color-coded error highlighting

### 📊 Advanced Scoring System
- **Accuracy Percentage**: Precise similarity calculation (0-100%)
- **Tajweed Score**: Overall performance score with error penalties
- **Rule-based Bonuses**: Extra points for proper Tajweed application
- **Instant Feedback**: Immediate results with detailed explanations

### 🎨 Beautiful, Modern UI
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Arabic Typography**: Beautiful Scheherazade and Amiri fonts
- **Smooth Animations**: Professional transitions and effects
- **Color-coded Rules**: Visual distinction for different Tajweed rules
- **Dark Mode Ready**: Supports system preferences

---

## 🏗️ Architecture

```
┌─────────────────┐         WebSocket          ┌─────────────────┐
│                 │◄──────────────────────────►│                 │
│  Next.js 14     │      Audio Streaming       │   FastAPI       │
│  Frontend       │      + Real-time           │   Backend       │
│  (TypeScript)   │      Analysis              │   (Python)      │
│                 │                             │                 │
└─────────────────┘                             └─────────────────┘
        │                                               │
        │                                               │
        ▼                                               ▼
  Browser APIs                              Tarteel AI Models
  - MediaRecorder                           - Whisper (Tiny/Base/Small)
  - WebSocket                               - Wav2Vec2-XLSR-53
  - Web Audio API                           - Tajweed Engine
  - Canvas (Visualizer)                     - Quran.com API
```

---

## 🚀 Quick Start

### Prerequisites

- **Python 3.10+** with pip
- **Node.js 18+** with npm/yarn/pnpm
- **4GB RAM minimum** (8GB+ recommended for models)
- **CUDA** (optional, for GPU acceleration)

### One-Command Setup

```bash
chmod +x setup.sh
./setup.sh
```

### Manual Installation

#### 1. Clone & Navigate
```bash
cd quran-recitation-app
```

#### 2. Backend Setup
```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create environment file
cp .env.example .env

# Run backend
python main.py
```

Backend will run on `http://localhost:8000`
API docs available at `http://localhost:8000/docs`

#### 3. Frontend Setup
```bash
cd ../frontend

# Install dependencies
npm install
# or
yarn install
# or
pnpm install

# Run development server
npm run dev
```

Frontend will run on `http://localhost:3000`

---

## 📖 Usage Guide

### Getting Started

1. **Open the Application**: Navigate to `http://localhost:3000`
2. **Select Surah & Ayah**: Choose which verse you want to practice
3. **Grant Microphone Permission**: Allow browser to access your microphone
4. **Start Recording**: Click the microphone button to begin
5. **Recite the Ayah**: Recite clearly and at a moderate pace
6. **Stop & Analyze**: Click stop to get instant feedback

### Understanding Feedback

#### Score Breakdown
- **90-100**: Excellent! Near-perfect recitation
- **75-89**: Good! Minor improvements needed
- **60-74**: Fair. Practice the corrections
- **<60**: Keep practicing. Review Tajweed rules

#### Error Types
- **🔴 Substitution**: Wrong letter pronounced
- **🟡 Omission**: Missing letter or word
- **🟠 Insertion**: Extra letter added

#### Tajweed Rules
- **⚠️ Critical**: Must be applied (Idgham, Ghunna, Iqlab)
- **💡 Important**: Should be applied (Ikhfa, Qalqalah, Madd)
- **✓ Detected**: Rule found in the ayah

---

## 🤖 AI Models

### Tarteel AI Models (Recommended)

#### 1. Tarteel Whisper Tiny
- **Size**: ~150 MB
- **Speed**: Fastest ⚡
- **Accuracy**: Good
- **Model ID**: `tarteel-ai/whisper-tiny-ar-quran`
- **Best For**: Real-time applications, slower devices

#### 2. Tarteel Whisper Base
- **Size**: ~290 MB
- **Speed**: Fast
- **Accuracy**: Very Good
- **Model ID**: `tarteel-ai/whisper-base-ar-quran`
- **Best For**: Balanced performance and accuracy

#### 3. Tarteel Wav2Vec2 XLSR
- **Size**: ~1.2 GB
- **Speed**: Medium
- **Accuracy**: Excellent
- **Model ID**: `Tarteel/wav2vec2-large-xlsr-53-quran`
- **Best For**: High accuracy requirements

### Fallback Models

#### Arabic Wav2Vec2
- **Model**: `jonatasgrosman/wav2vec2-large-xlsr-53-arabic`
- General Arabic ASR (not Quran-specific)

#### OpenAI Whisper
- **Model**: `openai/whisper-base`
- Multi-language support with Arabic

### Model Selection

The application automatically tries models in this order:
1. Tarteel Whisper Tiny
2. Tarteel Whisper Base  
3. Tarteel Wav2Vec2
4. Arabic Wav2Vec2
5. OpenAI Whisper

To force a specific model, edit `backend/.env`:
```env
PREFERRED_MODEL=tarteel_whisper
```

---

## 🎯 Tajweed Rules Reference

### Noon Sakinah & Tanween Rules

| Rule | Letters | Description | Example |
|------|---------|-------------|---------|
| **Idhaar Halqi** | ء ه ع ح غ خ | Clear pronunciation | مِنْ أَمْرِ |
| **Idgham with Ghunna** | ي ن م و | Merge with nasal | مِنْ مَال |
| **Idgham without Ghunna** | ل ر | Merge without nasal | مِنْ رَّبِّكَ |
| **Iqlab** | ب | Convert to meem | مِنْ بَعْدِ |
| **Ikhfa** | 15 letters | Hide with ghunna | مِنْ تَحْتِهَا |

### Meem Sakinah Rules

| Rule | Description | Example |
|------|-------------|---------|
| **Idhaar Shafawi** | Clear except before م and ب | يَعْتَصِمْ بِاللَّهِ |
| **Idgham Mutamathilayn** | Merge مْ + م | لَكُمْ مَّا |
| **Ikhfa Shafawi** | Hide before ب | تَرْمِيهِمْ بِحِجَارَةٍ |

### Madd (Prolongation)

| Type | Duration | Description |
|------|----------|-------------|
| **Madd Tabee'i** | 2 counts | Natural prolongation |
| **Madd Lazim** | 6 counts | Necessary prolongation |
| **Madd Muttasil** | 4-5 counts | Connected prolongation |
| **Madd Munfasil** | 2-4 counts | Separated prolongation |

---

## 🐳 Docker Deployment

### Using Docker Compose (Recommended)

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

Application will be available at:
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8000`
- API Docs: `http://localhost:8000/docs`

### Manual Docker Build

```bash
# Backend
cd backend
docker build -t quran-backend .
docker run -p 8000:8000 quran-backend

# Frontend
cd frontend
docker build -t quran-frontend .
docker run -p 3000:3000 quran-frontend
```

---

## 🔧 Configuration

### Backend Configuration (`backend/.env`)

```env
# Server
HOST=0.0.0.0
PORT=8000

# CORS
CORS_ORIGINS=http://localhost:3000

# Model
DEVICE=cpu  # or 'cuda' for GPU
PREFERRED_MODEL=tarteel_whisper

# Quran API
ENABLE_API_FETCH=True
QURAN_API_URL=http://api.alquran.cloud/v1
```

### Frontend Configuration

Edit `frontend/lib/useRecitationWebSocket.ts` to change WebSocket URL:
```typescript
const ws = new WebSocket('ws://your-backend-url:8000/ws/recitation')
```

---
- **WebSocket**: Real-time communication

---
yarn dev
# or
pnpm dev
```

Frontend will run on `http://localhost:3000`

3. **Open your browser** and navigate to `http://localhost:3000`

## 📁 Project Structure

```
quran-recitation-app/
├── backend/
│   ├── main.py                    # FastAPI application
│   ├── requirements.txt           # Python dependencies
│   ├── models/
│   │   └── tarteel_model.py      # Tarteel AI model wrapper
│   ├── services/
│   │   ├── tajweed_analyzer.py   # Tajweed rules engine
│   │   └── quran_service.py      # Quran text service
│   └── README.md
├── frontend/
│   ├── app/
│   │   ├── page.tsx              # Home page
│   │   ├── layout.tsx            # Root layout
│   │   ├── globals.css           # Global styles
│   │   └── recitation/
│   │       └── page.tsx          # Recitation page
│   ├── components/
│   │   ├── SurahSelector.tsx
│   │   ├── RecitationInterface.tsx
│   │   ├── AyahDisplay.tsx
│   │   └── FeedbackPanel.tsx
│   ├── lib/
│   │   └── useRecitationWebSocket.ts
│   ├── package.json
│   └── README.md
└── README.md
```

## 🤖 Tarteel AI Models

This application supports multiple Tarteel/Arabic ASR models:

### Primary Model (Recommended)
- **tarteel-ai/whisper-small-ar-quran**: Fine-tuned Whisper model specifically for Quranic recitation

### Fallback Models
- **jonatasgrosman/wav2vec2-large-xlsr-53-arabic**: Robust Arabic speech recognition
- **openai/whisper-base**: General-purpose speech recognition with Arabic support

The backend automatically loads the best available model based on what's accessible.

## 📖 Usage Guide

1. **Select Surah and Ayah**: Choose which verse you want to practice
2. **Start Recording**: Click the microphone button to begin recording
3. **Recite**: Recite the Ayah clearly with proper Tajweed
4. **Get Feedback**: Stop recording to receive instant analysis including:
   - Transcription of your recitation
   - Accuracy score
   - Tajweed rules detected
   - Errors and corrections
5. **Improve**: Use the feedback to correct mistakes and practice again

## 🎯 Tajweed Rules Analyzed

| Rule | Arabic Letters | Description |
|------|---------------|-------------|
| **Qalqalah** | ق ط ب ج د | Echo/bounce sound |
| **Ghunna** | ن م | Nasal sound (2 counts) |
| **Madd** | ا و ي | Prolongation |
| **Idgham** | ي ن م و ل ر | Merging with/without Ghunna |
| **Ikhfa** | 15 letters | Hiding of Noon Sakinah |

## 🛠️ Development

### Backend Development

```bash
cd backend
source venv/bin/activate

# Run with auto-reload
python main.py

# Or with uvicorn directly
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Development

```bash
cd frontend

# Development mode
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Lint code
npm run lint
```

## 🔧 Configuration

### Backend Configuration

Edit `backend/.env`:
```env
PORT=8000
HOST=0.0.0.0
CORS_ORIGINS=http://localhost:3000
MODEL_NAME=tarteel-ai/whisper-small-ar-quran
DEVICE=cuda  # or cpu
```

### Frontend Configuration

Create `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
```

## 🚀 Deployment

### Backend (Docker)

```bash
cd backend

# Build Docker image
docker build -t quran-recitation-backend .

# Run container
docker run -p 8000:8000 quran-recitation-backend
```

### Frontend (Vercel)

```bash
cd frontend

# Deploy to Vercel
vercel deploy
```

Or use any Node.js hosting platform (Netlify, AWS, etc.)

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 TODO / Future Enhancements

- [ ] Add more Tajweed rules detection
- [ ] Implement user authentication and progress tracking
- [ ] Add audio playback of correct recitation
- [ ] Support for complete Surah recitation
- [ ] Mobile app (React Native)
- [ ] Offline mode with cached models
- [ ] Multiple Quranic text sources
- [ ] Different recitation styles (Hafs, Warsh, etc.)
- [ ] Community features (share recordings, compete)
- [ ] Advanced analytics and statistics

## 🙏 Acknowledgments

- **Tarteel AI**: For providing open-source Arabic ASR models
- **Hugging Face**: For model hosting and transformers library
- **Tanzil.net**: For Quranic text with tashkeel
- **Next.js Team**: For the amazing React framework
- **FastAPI Team**: For the modern Python web framework

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📧 Contact

For questions, suggestions, or issues, please open an issue on GitHub.

---

**May Allah accept our efforts and make this tool beneficial for the Ummah. Ameen.** 🤲

بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ