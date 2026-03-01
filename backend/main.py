from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import json
import base64
from typing import List
from models.tarteel_model import TarteelModel
from services.tajweed_analyzer import TajweedAnalyzer
from services.quran_service import QuranService

app = FastAPI(title="Quran Recitation API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
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
            "websocket": "ws://localhost:8000/ws/recitation"
        }
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "model_loaded": tarteel_model.model_loaded,
        "model_type": tarteel_model.model_type if tarteel_model.model_loaded else None,
        "device": tarteel_model.device
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

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
