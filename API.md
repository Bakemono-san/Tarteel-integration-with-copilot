# API Documentation

Complete API reference for the Quran Recitation App backend.

## Base URL

```
http://localhost:8000
```

## Authentication

Currently, no authentication is required. Future versions will include JWT-based authentication for user accounts.

## Endpoints

### Health Check

Check if the API is running.

**Request:**
```http
GET /
```

**Response:**
```json
{
  "message": "Quran Recitation API with Tarteel AI"
}
```

---

### Get Surah Details

Retrieve a complete Surah with all its Ayahs.

**Request:**
```http
GET /api/quran/surah/{surah_number}
```

**Parameters:**
- `surah_number` (integer, required): Surah number (1-114)

**Response:**
```json
{
  "surah": {
    "number": 1,
    "name": "الفاتحة",
    "englishName": "Al-Fatihah",
    "englishNameTranslation": "The Opening",
    "revelationType": "Meccan",
    "numberOfAyahs": 7
  },
  "ayahs": [
    {
      "number": 1,
      "text": "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
      "numberInSurah": 1
    }
  ]
}
```

**Example:**
```bash
curl http://localhost:8000/api/quran/surah/1
```

---

### Get Specific Ayah

Retrieve a specific Ayah from a Surah.

**Request:**
```http
GET /api/quran/ayah/{surah_number}/{ayah_number}
```

**Parameters:**
- `surah_number` (integer, required): Surah number (1-114)
- `ayah_number` (integer, required): Ayah number within the Surah

**Response:**
```json
{
  "surahNumber": 1,
  "ayahNumber": 1,
  "text": "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
  "surahName": "الفاتحة",
  "surahEnglishName": "Al-Fatihah"
}
```

**Example:**
```bash
curl http://localhost:8000/api/quran/ayah/1/1
```

---

## WebSocket API

### Recitation Analysis WebSocket

Real-time WebSocket endpoint for audio streaming and recitation analysis.

**Connection:**
```
ws://localhost:8000/ws/recitation
```

**Connection Example (JavaScript):**
```javascript
const ws = new WebSocket('ws://localhost:8000/ws/recitation');

ws.onopen = () => {
  console.log('Connected to recitation WebSocket');
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Received:', data);
};

ws.onerror = (error) => {
  console.error('WebSocket error:', error);
};

ws.onclose = () => {
  console.log('WebSocket connection closed');
};
```

### Message Types

#### 1. Audio Data (Client → Server)

Send audio data for analysis.

**Message Format:**
```json
{
  "type": "audio",
  "audio": "<base64_encoded_audio>",
  "surahNumber": 1,
  "ayahNumber": 1
}
```

**Fields:**
- `type`: Must be "audio"
- `audio`: Base64-encoded audio data (WebM or OGG format)
- `surahNumber`: The Surah being recited
- `ayahNumber`: The Ayah being recited

**Example:**
```javascript
// Record audio and convert to base64
const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
const reader = new FileReader();
reader.onloadend = () => {
  const base64Audio = reader.result.split(',')[1];
  ws.send(JSON.stringify({
    type: 'audio',
    audio: base64Audio,
    surahNumber: 1,
    ayahNumber: 1
  }));
};
reader.readAsDataURL(audioBlob);
```

#### 2. Analysis Result (Server → Client)

Receive analysis results after sending audio.

**Message Format:**
```json
{
  "type": "analysis",
  "transcription": "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
  "confidence": 0.95,
  "tajweed": {
    "accuracy": 0.98,
    "errors": [
      {
        "type": "substitution",
        "position": 5,
        "expected": "ه",
        "received": "ح",
        "severity": "high"
      }
    ],
    "tajweed_rules": [
      {
        "rule": "Qalqalah",
        "letter": "ب",
        "status": "detected",
        "description": "Echo sound required for ب"
      }
    ],
    "feedback": "Good recitation with minor improvements needed.",
    "score": 85,
    "corrections": [
      "Replace 'ح' with 'ه' at position 5"
    ]
  },
  "expected": "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
  "surahNumber": 1,
  "ayahNumber": 1
}
```

**Fields:**
- `type`: "analysis"
- `transcription`: ASR transcription of the recitation
- `confidence`: Recognition confidence (0.0-1.0)
- `tajweed`: Detailed Tajweed analysis
  - `accuracy`: Overall accuracy (0.0-1.0)
  - `errors`: List of pronunciation errors
  - `tajweed_rules`: Detected Tajweed rules
  - `feedback`: Human-readable feedback
  - `score`: Overall score (0-100)
  - `corrections`: Suggested corrections
- `expected`: The correct Ayah text
- `surahNumber`: Surah number
- `ayahNumber`: Ayah number

#### 3. Ping (Client → Server)

Keep the connection alive.

**Message Format:**
```json
{
  "type": "ping"
}
```

#### 4. Pong (Server → Client)

Response to ping.

**Message Format:**
```json
{
  "type": "pong"
}
```

---

## Error Responses

### HTTP Errors

**404 Not Found:**
```json
{
  "error": "Surah not found"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Internal server error",
  "detail": "Error message here"
}
```

### WebSocket Errors

If an error occurs during WebSocket processing, the connection may be closed. Check server logs for details.

---

## Data Models

### Surah Information

```typescript
interface SurahInfo {
  number: number;
  name: string;              // Arabic name
  englishName: string;
  englishNameTranslation: string;
  revelationType: 'Meccan' | 'Medinan';
  numberOfAyahs: number;
}
```

### Ayah

```typescript
interface Ayah {
  number: number;
  text: string;              // Arabic text with tashkeel
  numberInSurah: number;
}
```

### Tajweed Error

```typescript
interface TajweedError {
  type: 'substitution' | 'omission' | 'insertion';
  position: number;
  expected: string;
  received: string;
  severity: 'high' | 'medium' | 'low';
}
```

### Tajweed Rule

```typescript
interface TajweedRule {
  rule: string;              // Rule name (Qalqalah, Ghunna, etc.)
  letter?: string;           // Specific letter if applicable
  status: string;
  description: string;
}
```

### Tajweed Analysis

```typescript
interface TajweedAnalysis {
  accuracy: number;          // 0.0 - 1.0
  errors: TajweedError[];
  tajweed_rules: TajweedRule[];
  feedback: string;
  score: number;             // 0 - 100
  corrections: string[];
}
```

---

## Rate Limiting

Currently, no rate limiting is implemented. In production, consider implementing:
- 100 requests per minute per IP for REST endpoints
- 1 concurrent WebSocket connection per user

---

## CORS Configuration

The API allows requests from:
- `http://localhost:3000`
- `http://localhost:3001`

To add more origins, edit `backend/.env`:
```env
CORS_ORIGINS=http://localhost:3000,https://yourdomain.com
```

---

## Audio Requirements

### Supported Formats
- WebM (recommended)
- OGG
- WAV

### Recommended Settings
- **Sample Rate**: 16kHz
- **Channels**: Mono
- **Bit Depth**: 16-bit
- **Duration**: 3-30 seconds per chunk

### Size Limits
- Maximum audio chunk size: 10MB
- Recommended chunk duration: 5-10 seconds

---

## Performance Considerations

### Response Times
- REST endpoints: < 100ms
- WebSocket audio processing: 1-5 seconds (depending on audio length and model)
- First request (model loading): 30-60 seconds

### Optimization Tips
1. Use GPU for faster inference (set `DEVICE=cuda` in `.env`)
2. Use smaller models for faster processing
3. Send audio in smaller chunks (3-5 seconds)
4. Enable model quantization for production

---

## Testing

### Using cURL

**Test health endpoint:**
```bash
curl http://localhost:8000/
```

**Get Surah:**
```bash
curl http://localhost:8000/api/quran/surah/1
```

**Get Ayah:**
```bash
curl http://localhost:8000/api/quran/ayah/1/1
```

### Using Python

```python
import requests

# Get Ayah
response = requests.get('http://localhost:8000/api/quran/ayah/1/1')
data = response.json()
print(data['text'])
```

### Using WebSocket (Python)

```python
import asyncio
import websockets
import json
import base64

async def test_recitation():
    async with websockets.connect('ws://localhost:8000/ws/recitation') as ws:
        # Read audio file
        with open('test_audio.webm', 'rb') as f:
            audio_data = base64.b64encode(f.read()).decode('utf-8')
        
        # Send audio
        message = {
            'type': 'audio',
            'audio': audio_data,
            'surahNumber': 1,
            'ayahNumber': 1
        }
        await ws.send(json.dumps(message))
        
        # Receive response
        response = await ws.recv()
        result = json.loads(response)
        print(f"Score: {result['tajweed']['score']}")

asyncio.run(test_recitation())
```

---

## Interactive API Documentation

Visit `http://localhost:8000/docs` for interactive Swagger UI documentation where you can:
- View all endpoints
- Test endpoints directly
- See request/response schemas
- Download OpenAPI specification

---

## Support

For issues or questions:
- Check the main [README.md](README.md)
- Review the [QUICKSTART.md](QUICKSTART.md)
- Open an issue on GitHub
