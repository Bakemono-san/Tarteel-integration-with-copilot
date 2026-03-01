# Quran Recitation Backend API

Backend service for real-time Quran recitation analysis using Tarteel AI models.

## Features

- **Real-time Audio Processing**: WebSocket-based audio streaming
- **Tarteel AI Integration**: Arabic speech recognition using Tarteel's fine-tuned models
- **Tajweed Analysis**: Automated detection of Tajweed rules and errors
- **Quran Text Service**: Access to Quranic text with full tashkeel

## Tech Stack

- **FastAPI**: Modern web framework for building APIs
- **PyTorch**: Deep learning framework for running models
- **Transformers**: Hugging Face library for pre-trained models
- **Librosa**: Audio processing library
- **WebSockets**: Real-time bidirectional communication

## Installation

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

## Running the Server

Development mode:
```bash
python main.py
```

Or using uvicorn directly:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`

API documentation: `http://localhost:8000/docs`

## API Endpoints

### REST Endpoints

- `GET /`: Health check
- `GET /api/quran/surah/{surah_number}`: Get surah details and ayahs
- `GET /api/quran/ayah/{surah_number}/{ayah_number}`: Get specific ayah

### WebSocket Endpoints

- `WS /ws/recitation`: Real-time recitation analysis

#### WebSocket Message Format

**Client → Server:**
```json
{
  "type": "audio",
  "audio": "<base64_encoded_audio>",
  "surahNumber": 1,
  "ayahNumber": 1
}
```

**Server → Client:**
```json
{
  "type": "analysis",
  "transcription": "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
  "confidence": 0.95,
  "tajweed": {
    "accuracy": 0.98,
    "errors": [],
    "tajweed_rules": [...],
    "feedback": "Excellent recitation!",
    "score": 98
  },
  "expected": "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ"
}
```

## Model Information

The backend supports multiple Tarteel AI models:

1. **Primary**: `tarteel-ai/whisper-small-ar-quran` (Recommended)
2. **Fallback**: `jonatasgrosman/wav2vec2-large-xlsr-53-arabic`
3. **Alternative**: OpenAI Whisper base model

The system automatically loads the best available model.

## Tajweed Rules Analyzed

- **Qalqalah** (ق ط ب ج د): Echo/bounce sounds
- **Ghunna** (ن م): Nasal sounds with proper duration
- **Idgham**: Merging of letters
- **Ikhfa**: Hiding of noon sakinah
- **Madd**: Prolongation rules
- **Makharij**: Proper articulation points

## Development

### Project Structure

```
backend/
├── main.py                 # FastAPI application
├── models/
│   ├── __init__.py
│   └── tarteel_model.py   # Tarteel AI model wrapper
├── services/
│   ├── __init__.py
│   ├── tajweed_analyzer.py  # Tajweed rules engine
│   └── quran_service.py     # Quran text service
├── requirements.txt
└── README.md
```

### Adding New Tajweed Rules

Edit `services/tajweed_analyzer.py` and add your rule logic to the `_check_tajweed_rules` method.

### Extending Quran Data

The `QuranService` currently uses in-memory data. To integrate a full Quran database:

1. Download Quran JSON from [Tanzil.net](http://tanzil.net/download/)
2. Place in `data/quran.json`
3. Update `_load_quran_data()` method to read from file

## License

MIT
