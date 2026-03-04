from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import uvicorn
import json
import base64
from typing import List
from models.tarteel_model import TarteelModel
from services.tajweed_analyzer import TajweedAnalyzer
from services.quran_service import QuranService
from pydantic import BaseModel
from datetime import datetime

app = FastAPI(title="Quran Recitation API")

# CORS middleware - Allow connections from anywhere for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for VPS access
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
tarteel_model = TarteelModel()
tajweed_analyzer = TajweedAnalyzer()
quran_service = QuranService()

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def send_message(self, message: dict, websocket: WebSocket):
        await websocket.send_json(message)

manager = ConnectionManager()

@app.get("/")
async def root():
    return {
        "message": "Quran Recitation API with Tarteel AI",
        "version": "2.0.0",
        "endpoints": {
            "docs": "/docs",
            "health": "/health",
            "surahs": "/api/quran/surahs",
            "surah": "/api/quran/surah/{surah_number}",
            "ayah": "/api/quran/ayah/{surah_number}/{ayah_number}",
            "websocket": "ws://localhost:8081/ws/recitation"
        }
    }

@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "services": {
            "quran_service": "operational",
            "tarteel_model": "operational",
            "tajweed_analyzer": "operational"
        }
    }

@app.get("/api/quran/surahs")
async def get_all_surahs():
    """Get list of all surahs"""
    surahs = quran_service.get_all_surahs()
    return {"surahs": surahs, "count": len(surahs)}

@app.get("/api/quran/surah/{surah_number}")
async def get_surah(surah_number: int):
    """Get Surah details and ayahs"""
    surah_data = quran_service.get_surah(surah_number)
    return surah_data

@app.get("/api/quran/ayah/{surah_number}/{ayah_number}")
async def get_ayah(surah_number: int, ayah_number: int):
    """Get specific ayah with tashkeel"""
    ayah_data = quran_service.get_ayah(surah_number, ayah_number)
    return ayah_data

@app.get("/api/quran/audio/{surah_number}/{ayah_number}")
async def get_quran_audio(surah_number: int, ayah_number: int, reciter: str = "ar.alafasy"):
    """Proxy Quran audio from cdn.islamic.network to avoid CORS issues"""
    try:
        import requests

        # Format ayah number with leading zeros
        ayah_formatted = str(ayah_number).zfill(3)
        url = f"https://cdn.islamic.network/quran/{reciter}/{surah_number}{ayah_formatted}.mp3"

        # Fetch the audio
        response = requests.get(url, timeout=10)

        if response.status_code == 200:
            return StreamingResponse(
                iter([response.content]),
                media_type="audio/mpeg",
                headers={"Content-Disposition": f"inline; filename=quran_{surah_number}_{ayah_number}.mp3"}
            )
        else:
            return {"error": f"Failed to fetch audio: {response.status_code}"}
    except Exception as e:
        print(f"❌ Audio proxy error: {e}")
        return {"error": str(e)}

@app.websocket("/ws/recitation")
async def websocket_recitation(websocket: WebSocket):
    """WebSocket endpoint for real-time recitation analysis"""
    await manager.connect(websocket)
    client_id = id(websocket)
    print(f"✅ Client {client_id} connected to recitation WebSocket")

    try:
        while True:
            # Receive audio data from client
            data = await websocket.receive_text()
            message = json.loads(data)

            if message["type"] == "audio":
                try:
                    # Decode base64 audio
                    audio_data = base64.b64decode(message["audio"])

                    if len(audio_data) == 0:
                        await manager.send_message({
                            "type": "error",
                            "message": "Empty audio data received"
                        }, websocket)
                        continue

                    # Get context (surah and ayah being recited)
                    surah_num = message.get("surahNumber", 1)
                    ayah_num = message.get("ayahNumber", 1)

                    print(f"🎤 Processing audio for Surah {surah_num}, Ayah {ayah_num} (Client {client_id})")

                    # Process audio through Tarteel model
                    transcription = await tarteel_model.transcribe_audio(audio_data)

                    # Check for transcription errors
                    if "error" in transcription:
                        await manager.send_message({
                            "type": "error",
                            "message": f"Transcription error: {transcription['error']}"
                        }, websocket)
                        continue

                    # Get expected ayah text
                    expected_text = quran_service.get_ayah_text(surah_num, ayah_num)

                    if not expected_text:
                        await manager.send_message({
                            "type": "error",
                            "message": f"Ayah {surah_num}:{ayah_num} not found in database"
                        }, websocket)
                        continue

                    # Analyze tajweed
                    tajweed_analysis = tajweed_analyzer.analyze(
                        transcription.get("text", ""),
                        expected_text,
                        transcription.get("phonemes", [])
                    )

                    # Send response back to client
                    response = {
                        "type": "analysis",
                        "transcription": transcription.get("text", ""),
                        "confidence": transcription.get("confidence", 0.0),
                        "tajweed": tajweed_analysis,
                        "expected": expected_text,
                        "surahNumber": surah_num,
                        "ayahNumber": ayah_num,
                        "model": transcription.get("model", "unknown"),
                        "timestamp": message.get("timestamp", "")
                    }

                    await manager.send_message(response, websocket)
                    print(f"✅ Analysis sent (Score: {tajweed_analysis.get('score', 0)})")

                except Exception as e:
                    print(f"❌ Error processing audio: {str(e)}")
                    import traceback
                    traceback.print_exc()

                    await manager.send_message({
                        "type": "error",
                        "message": f"Error processing audio: {str(e)}"
                    }, websocket)

            elif message["type"] == "ping":
                await manager.send_message({"type": "pong"}, websocket)

    except WebSocketDisconnect:
        manager.disconnect(websocket)
        print(f"🔌 Client {client_id} disconnected from recitation WebSocket")
    except Exception as e:
        print(f"❌ WebSocket error for client {client_id}: {str(e)}")
        import traceback
        traceback.print_exc()
        try:
            manager.disconnect(websocket)
        except:
            pass

class TashkeelRequest(BaseModel):
    text: str
    context: str = "quran"  # Contexte pour améliorer la précision

class AnalyzeRecitationRequest(BaseModel):
    transcript: str
    expected_text: str
    surah_number: int = 1
    ayahs: List[dict] = []

@app.post("/api/speech/add-tashkeel")
async def add_tashkeel_to_speech(request: TashkeelRequest):
    """Add tashkeel (harakats) to recognized speech text and detect ayah boundaries - supports multiple consecutive ayahs"""
    try:
        text = request.text.strip()

        if not text:
            return {"error": "Empty text"}

        # Normalize the text (remove hamza variations, etc.)
        normalized_text = normalize_arabic_text(text)

        print(f"🔍 Searching for: {text[:100]}...")

        # Try to find sequential ayahs
        best_sequence = find_ayah_sequence(normalized_text)

        if best_sequence and best_sequence["confidence"] > 0.6:
            # Found a good sequence of ayahs
            full_text_with_tashkeel = " ".join([ayah["text"] for ayah in best_sequence["ayahs"]])

            print(f"✅ Found {len(best_sequence['ayahs'])} ayahs from Surah {best_sequence['surah']}")

            return {
                "original": text,
                "with_tashkeel": full_text_with_tashkeel,
                "detected_ayahs": best_sequence["ayahs"],
                "sequence_info": {
                    "surah": best_sequence["surah"],
                    "start_ayah": best_sequence["start_ayah"],
                    "end_ayah": best_sequence["end_ayah"],
                    "total_ayahs": len(best_sequence["ayahs"])
                },
                "confidence": best_sequence["confidence"],
                "type": "sequence"
            }

        # Fallback: Try single ayah matching
        single_match = find_single_ayah(normalized_text)

        if single_match and single_match["confidence"] > 0.5:
            print(f"✅ Found single ayah: Surah {single_match['surah']}, Ayah {single_match['ayah']}")
            return {
                "original": text,
                "with_tashkeel": single_match["text"],
                "detected_ayahs": [single_match],
                "confidence": single_match["confidence"],
                "type": "single"
            }

        # No match found
        print(f"⚠️  No match found for text")
        return {
            "original": text,
            "with_tashkeel": text,
            "detected_ayahs": [],
            "confidence": 0,
            "note": "No matching ayah found in Quran database"
        }

    except Exception as e:
        print(f"❌ Tashkeel error: {e}")
        import traceback
        traceback.print_exc()
        return {"error": str(e)}

def normalize_arabic_text(text: str) -> str:
    """Normalize Arabic text for better matching"""
    # Remove tashkeel
    text = remove_arabic_diacritics(text)
    # Normalize alef variations
    text = text.replace("أ", "ا").replace("إ", "ا").replace("آ", "ا")
    # Normalize other letters
    text = text.replace("ى", "ي").replace("ة", "ه")
    # Remove extra spaces
    text = " ".join(text.split())
    return text.strip()

def find_ayah_sequence(normalized_text: str) -> dict:
    """Find a sequence of consecutive ayahs that match the text"""
    best_sequence = None
    best_score = 0

    total_surahs_checked = 0
    surahs_with_errors = []

    # Search through all surahs
    for surah_num in range(1, 115):
        try:
            surah_data = quran_service.get_surah(surah_num)
            if "ayahs" not in surah_data:
                surahs_with_errors.append(surah_num)
                continue

            total_surahs_checked += 1

            ayahs = surah_data["ayahs"]

            # Try different starting points
            for start_idx in range(len(ayahs)):
                # Try different lengths (1 to 10 ayahs)
                for length in range(1, min(11, len(ayahs) - start_idx + 1)):
                    # Build concatenated text for this sequence
                    sequence_ayahs = ayahs[start_idx:start_idx + length]
                    sequence_text = " ".join([
                        normalize_arabic_text(ayah["text"])
                        for ayah in sequence_ayahs
                    ])

                    # Calculate similarity
                    similarity = calculate_text_similarity(normalized_text, sequence_text)

                    # Check if this is a better match
                    if similarity > best_score and similarity > 0.6:
                        best_score = similarity
                        best_sequence = {
                            "surah": surah_num,
                            "start_ayah": sequence_ayahs[0]["number"],
                            "end_ayah": sequence_ayahs[-1]["number"],
                            "ayahs": [
                            {
                                "surah": surah_num,
                                "ayah": ayah["number"],
                                "text": ayah["text"],
                                "similarity": similarity
                            }
                            for ayah in sequence_ayahs
                        ],
                        "confidence": similarity
                    }
        except Exception as e:
            print(f"⚠️  Error processing Surah {surah_num}: {e}")
            surahs_with_errors.append(surah_num)

    # Log diagnostic info
    print(f"🔍 Searched {total_surahs_checked}/114 surahs for ayah sequence")
    if surahs_with_errors:
        print(f"⚠️  Failed to process surahs: {surahs_with_errors}")

    return best_sequence

def find_single_ayah(normalized_text: str) -> dict:
    """Find a single ayah that matches the text"""
    best_match = None
    best_similarity = 0

    total_surahs_checked = 0
    total_ayahs_checked = 0
    surahs_with_errors = []

    for surah_num in range(1, 115):
        try:
            surah_data = quran_service.get_surah(surah_num)
            if "ayahs" not in surah_data:
                surahs_with_errors.append(surah_num)
                continue

            total_surahs_checked += 1

            for ayah in surah_data["ayahs"]:
                total_ayahs_checked += 1
                ayah_normalized = normalize_arabic_text(ayah["text"])
                similarity = calculate_text_similarity(normalized_text, ayah_normalized)

                if similarity > best_similarity:
                    best_similarity = similarity
                    best_match = {
                        "surah": surah_num,
                        "ayah": ayah["number"],
                        "text": ayah["text"],
                        "similarity": similarity,
                        "confidence": similarity
                    }
        except Exception as e:
            print(f"⚠️  Error processing Surah {surah_num}: {e}")
            surahs_with_errors.append(surah_num)

    # Log diagnostic info
    print(f"🔍 Searched {total_ayahs_checked} ayahs across {total_surahs_checked}/114 surahs")
    if surahs_with_errors:
        print(f"⚠️  Failed to process surahs: {surahs_with_errors}")

    return best_match

def calculate_text_similarity(text1: str, text2: str) -> float:
    """Calculate similarity between two texts using multiple methods"""
    if not text1 or not text2:
        return 0.0

    # Method 1: Exact substring match
    if text1 in text2 or text2 in text1:
        shorter = min(len(text1), len(text2))
        longer = max(len(text1), len(text2))
        return shorter / longer

    # Method 2: Word-based similarity
    words1 = set(text1.split())
    words2 = set(text2.split())

    if not words1 or not words2:
        return 0.0

    intersection = words1.intersection(words2)
    union = words1.union(words2)

    jaccard = len(intersection) / len(union) if union else 0.0

    # Method 3: Character-based similarity (for short texts)
    if len(text1) < 50 or len(text2) < 50:
        # Simple character overlap
        chars1 = set(text1)
        chars2 = set(text2)
        char_similarity = len(chars1.intersection(chars2)) / len(chars1.union(chars2))
        return (jaccard * 0.7 + char_similarity * 0.3)

    return jaccard

def remove_arabic_diacritics(text: str) -> str:
    """Remove all Arabic diacritics (tashkeel) from text"""
    import re
    # Arabic diacritics Unicode range
    arabic_diacritics = re.compile(r'[\u064B-\u0652\u0670\u0640]')
    return arabic_diacritics.sub('', text).strip()

@app.post("/api/quran/analyze-recitation")
async def analyze_recitation(request: AnalyzeRecitationRequest):
    """Analyze user's Quran recitation against expected text"""
    try:
        transcript = request.transcript.strip()
        expected_text = request.expected_text.strip()
        surah_number = request.surah_number
        ayahs = request.ayahs

        if not transcript or not expected_text:
            return {"error": "Missing transcript or expected text"}

        print(f"🔍 Analyzing recitation for Surah {surah_number}")
        print(f"Expected: {expected_text[:100]}...")
        print(f"Got: {transcript[:100]}...")

        # Normalize both texts
        expected_norm = normalize_arabic_text(expected_text)
        transcript_norm = normalize_arabic_text(transcript)

        # Calculate similarity
        from difflib import SequenceMatcher
        similarity = SequenceMatcher(None, expected_norm, transcript_norm).ratio()
        accuracy = max(0, min(1, similarity))

        print(f"Accuracy: {accuracy * 100:.1f}%")

        # Find errors by comparing word by word
        expected_words = expected_norm.split()
        transcript_words = transcript_norm.split()

        errors = []
        error_types = {"omission": 0, "substitution": 0, "insertion": 0}

        # Simple word-by-word comparison
        i, j = 0, 0
        while i < len(expected_words) or j < len(transcript_words):
            if i >= len(expected_words):
                # Extra words (insertion)
                errors.append({
                    "type": "insertion",
                    "expected": "",
                    "actual": transcript_words[j] if j < len(transcript_words) else "",
                    "word": transcript_words[j] if j < len(transcript_words) else "",
                    "ayah_number": None
                })
                j += 1
                error_types["insertion"] += 1
            elif j >= len(transcript_words):
                # Missing words (omission)
                errors.append({
                    "type": "omission",
                    "expected": expected_words[i],
                    "actual": "",
                    "word": expected_words[i],
                    "ayah_number": None
                })
                i += 1
                error_types["omission"] += 1
            elif expected_words[i] != transcript_words[j]:
                # Different words (substitution)
                errors.append({
                    "type": "substitution",
                    "expected": expected_words[i],
                    "actual": transcript_words[j],
                    "word": transcript_words[j],
                    "ayah_number": None
                })
                i += 1
                j += 1
                error_types["substitution"] += 1
            else:
                # Match
                i += 1
                j += 1

        print(f"✅ Found {len(errors)} errors")

        return {
            "accuracy": accuracy,
            "transcript": transcript,
            "expected": expected_text,
            "errors": errors[:10],  # Limit to 10 errors to avoid clutter
            "error_count": len(errors),
            "error_summary": error_types,
            "surah_number": surah_number
        }

    except Exception as e:
        print(f"❌ Analysis error: {e}")
        import traceback
        traceback.print_exc()
        return {"error": str(e)}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8081, reload=True)
