from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Query
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import uvicorn
import json
import base64
from typing import List, Optional
from models.tarteel_model import TarteelModel
from services.tajweed_analyzer import TajweedAnalyzer
from services.quran_service import QuranService
from services.makharij_service import MakharijService, MAKHAARIJ_SERVICE
from services.progress_service import ProgressService, PROGRESS_SERVICE
from services.curriculum_service import CurriculumService, CURRICULUM_SERVICE
from services.waqf_service import WaqfService, WAQF_SERVICE
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
makharij_service = MAKHAARIJ_SERVICE
progress_service = PROGRESS_SERVICE
curriculum_service = CURRICULUM_SERVICE
curriculum_service.set_progress_service(progress_service)
waqf_service = WAQF_SERVICE

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
        "message": "Quran Recitation API with Bakemono AI",
        "version": "2.0.0",
        "endpoints": {
            "docs": "/docs",
            "health": "/health",
            "surahs": "/api/quran/surahs",
            "surah": "/api/quran/surah/{surah_number}",
            "ayah": "/api/quran/ayah/{surah_number}/{ayah_number}",
            "websocket": "{host}/ws/recitation"
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

# Per-client audio buffer for streaming chunks
client_audio_buffers: dict = {}

def get_client_key(websocket) -> int:
    return id(websocket)

@app.websocket("/ws/recitation")
async def websocket_recitation(websocket: WebSocket):
    """WebSocket endpoint for real-time recitation analysis with chunked streaming"""
    await manager.connect(websocket)
    client_id = id(websocket)
    client_key = get_client_key(websocket)
    print(f"✅ Client {client_id} connected to recitation WebSocket")

    client_audio_buffers[client_key] = {
        "buffer": b"",
        "current_surah": None,
        "current_ayah": None,
        "chunk_count": 0,
    }

    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)

            if message["type"] == "audio":
                try:
                    audio_data = base64.b64decode(message["audio"])
                    if len(audio_data) == 0:
                        continue

                    surah_num = message.get("surahNumber", 1)
                    ayah_num = message.get("ayahNumber", 1)

                    buf = client_audio_buffers[client_key]

                    # Reset buffer if new ayah
                    if buf["current_surah"] != surah_num or buf["current_ayah"] != ayah_num:
                        buf["buffer"] = b""
                        buf["current_surah"] = surah_num
                        buf["current_ayah"] = ayah_num
                        buf["chunk_count"] = 0

                    # Append to buffer
                    buf["buffer"] += audio_data
                    buf["chunk_count"] += 1
                    chunk = buf["chunk_count"]

                    print(f"🎤 Chunk #{chunk} for Surah {surah_num}:{ayah_num} (Client {client_id}) — buffer: {len(buf['buffer'])} bytes")

                    is_partial = chunk < 4

                    transcription = await tarteel_model.transcribe_audio(buf["buffer"])

                    if "error" in transcription:
                        continue

                    expected_text = quran_service.get_ayah_text(surah_num, ayah_num)

                    if not expected_text:
                        await manager.send_message({
                            "type": "error",
                            "message": f"Ayah {surah_num}:{ayah_num} not found"
                        }, websocket)
                        continue

                    tajweed_analysis = tajweed_analyzer.analyze(
                        transcribed_text=transcription.get("text", ""),
                        expected_text=expected_text,
                        phonemes=transcription.get("phonemes", []),
                        token_confidences=transcription.get("token_confidences")
                    )

                    response = {
                        "type": "analysis",
                        "transcription": transcription.get("text", ""),
                        "confidence": transcription.get("confidence", 0.0),
                        "tajweed": tajweed_analysis,
                        "expected": expected_text,
                        "surahNumber": surah_num,
                        "ayahNumber": ayah_num,
                        "model": transcription.get("model", "unknown"),
                        "partial": is_partial,
                        "timestamp": message.get("timestamp", ""),
                    }

                    await manager.send_message(response, websocket)
                    status = "partial" if is_partial else "final"
                    print(f"✅ {status} analysis sent (Score: {tajweed_analysis.get('score', 0)}, Chunk #{chunk})")

                except Exception as e:
                    print(f"❌ Error processing chunk: {str(e)}")
                    import traceback
                    traceback.print_exc()

            elif message["type"] == "ping":
                await manager.send_message({"type": "pong"}, websocket)

            elif message["type"] == "reset":
                client_key_reset = get_client_key(websocket)
                if client_key_reset in client_audio_buffers:
                    client_audio_buffers[client_key_reset]["buffer"] = b""
                    client_audio_buffers[client_key_reset]["chunk_count"] = 0
                print(f"🔄 Client {client_id} reset buffer")

    except WebSocketDisconnect:
        client_audio_buffers.pop(client_key, None)
        manager.disconnect(websocket)
        print(f"🔌 Client {client_id} disconnected from recitation WebSocket")
    except Exception as e:
        print(f"❌ WebSocket error for client {client_id}: {str(e)}")
        import traceback
        traceback.print_exc()
        client_audio_buffers.pop(client_key, None)
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

        # Use full Tajweed analysis instead of simple word comparison
        tajweed_analysis = tajweed_analyzer.analyze(
            transcribed_text=transcript,
            expected_text=expected_text
        )

        print(f"✅ Analysis complete — Score: {tajweed_analysis['score']}")

        return {
            "accuracy": tajweed_analysis["accuracy"],
            "score": tajweed_analysis["score"],
            "transcript": transcript,
            "expected": expected_text,
            "errors": tajweed_analysis["errors"][:10],
            "tajweed_rules": tajweed_analysis["tajweed_rules"],
            "feedback": tajweed_analysis["feedback"],
            "corrections": tajweed_analysis["corrections"],
            "error_count": len(tajweed_analysis["errors"]),
            "surah_number": surah_number
        }

    except Exception as e:
        print(f"❌ Analysis error: {e}")
        import traceback
        traceback.print_exc()
        return {"error": str(e)}

# ── Makharij Endpoints ─────────────────────────────────────────────

@app.get("/api/tajweed/makhraj/{letter}")
async def get_makhraj(letter: str):
    """Get makhraj (articulation point) for an Arabic letter"""
    try:
        makhraj = makharij_service.get_makhraj(letter)
        sifat = makharij_service.get_sifat(letter)
        return {"letter": letter, "makhraj": makhraj, "sifat": sifat}
    except Exception as e:
        return {"error": str(e)}

@app.post("/api/tajweed/compare-makhraj")
async def compare_makhraj(expected_letter: str, actual_letter: str):
    """Compare makhraj of expected vs actual letter"""
    try:
        result = makharij_service.compare_makharij(expected_letter, actual_letter)
        return result
    except Exception as e:
        return {"error": str(e)}

# ── Progress Endpoints ─────────────────────────────────────────────

class RecitationSaveRequest(BaseModel):
    surah_number: int
    ayah_number: int
    analysis: dict
    user_id: str = "default"

@app.post("/api/progress/save")
async def save_recitation(request: RecitationSaveRequest):
    """Save a recitation result and update progress"""
    try:
        progress_service.save_recitation(
            surah=request.surah_number,
            ayah=request.ayah_number,
            analysis=request.analysis,
            user_id=request.user_id,
        )
        return {"status": "saved"}
    except Exception as e:
        return {"error": str(e)}

@app.get("/api/progress/weakness-profile")
async def get_weakness_profile(user_id: str = "default"):
    """Get user's Tajweed weakness profile"""
    try:
        profile = progress_service.get_weakness_profile(user_id)
        return {"profile": profile}
    except Exception as e:
        return {"error": str(e)}

@app.get("/api/progress/trend")
async def get_accuracy_trend(days: int = 30, user_id: str = "default"):
    """Get accuracy trend over time"""
    try:
        trend = progress_service.get_accuracy_trend(days, user_id)
        return {"trend": trend}
    except Exception as e:
        return {"error": str(e)}

@app.get("/api/progress/recent")
async def get_recent_activity(limit: int = 20, user_id: str = "default"):
    """Get recent recitation activity"""
    try:
        activity = progress_service.get_recent_activity(limit, user_id)
        return {"activity": activity}
    except Exception as e:
        return {"error": str(e)}

@app.get("/api/progress/surahs")
async def get_surah_progress(user_id: str = "default"):
    """Get progress per surah"""
    try:
        surahs = progress_service.get_surah_progress(user_id)
        return {"surahs": surahs}
    except Exception as e:
        return {"error": str(e)}

# ── Curriculum Endpoints ───────────────────────────────────────────

@app.get("/api/curriculum/tiers")
async def get_all_tiers():
    """Get all curriculum tiers"""
    return {"tiers": curriculum_service.get_all_tiers()}

@app.get("/api/curriculum/current")
async def get_current_tier(user_id: str = "default"):
    """Get user's current curriculum tier"""
    try:
        tier = curriculum_service.get_current_tier(user_id)
        return tier
    except Exception as e:
        return {"error": str(e)}

@app.get("/api/curriculum/unlock-progress")
async def get_unlock_progress(user_id: str = "default", target_tier: int = 1):
    """Get progress towards unlocking a tier"""
    try:
        progress = curriculum_service.check_unlock_progress(user_id, target_tier)
        return progress
    except Exception as e:
        return {"error": str(e)}

@app.get("/api/curriculum/recommend")
async def get_recommended(user_id: str = "default"):
    """Get recommended next ayah to practice"""
    try:
        rec = curriculum_service.get_recommended_next_ayah(user_id)
        return rec
    except Exception as e:
        return {"error": str(e)}

# ── Waqf Endpoints ─────────────────────────────────────────────────

@app.get("/api/waqf/marks")
async def get_all_waqf_marks():
    """Get all waqf (stop) marks"""
    return {"marks": waqf_service.get_all_marks()}

@app.get("/api/waqf/analyze")
async def analyze_waqf(ayah_text: str):
    """Analyze waqf marks in ayah text"""
    try:
        marks = waqf_service.suggest_waqf_points(ayah_text)
        return {"marks": marks}
    except Exception as e:
        return {"error": str(e)}

@app.get("/api/waqf/evaluate")
async def evaluate_stop(ayah_text: str, position: int):
    """Evaluate whether a stop at given position is valid"""
    try:
        result = waqf_service.evaluate_stop(ayah_text, position)
        return result
    except Exception as e:
        return {"error": str(e)}

# ── Health check updated ───────────────────────────────────────────

@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "services": {
            "quran_service": "operational",
            "tarteel_model": "operational",
            "tajweed_analyzer": "operational",
            "makharij_service": "operational",
            "progress_service": "operational",
            "curriculum_service": "operational",
            "waqf_service": "operational",
        }
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8081, reload=True)
