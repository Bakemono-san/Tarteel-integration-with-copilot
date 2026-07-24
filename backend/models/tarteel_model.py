import torch
import librosa
import soundfile as sf
import numpy as np
from transformers import AutoModelForCTC, Wav2Vec2Processor, pipeline
import io
from typing import Dict, List
import os

class TarteelModel:
    """
    Wrapper for Bakemono AI's Arabic Quran Speech Recognition Model
    Using fine-tuned models optimized for Quranic recitation

    Priority order:
    1. Whisper models (best for Quran)
    2. Wav2Vec2 models
    3. General Arabic ASR models
    4. OpenAI Whisper with Arabic
    """

    def __init__(self):
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        print(f"🚀 Initializing Bakemono Model...")
        print(f"📱 Using device: {self.device}")

        self.model_loaded = False
        self.model = None
        self.processor = None
        self.pipe = None
        self.whisper_model = None

        self._load_model()

    def _load_model(self):
        """Load the best available Arabic Quran ASR model"""

        # Option 1: Try Tiny Whisper model (fastest, good accuracy)
        try:
            print("🔍 Loading Whisper Tiny model...")
            from transformers import WhisperProcessor, WhisperForConditionalGeneration

            model_name = "tarteel-ai/whisper-tiny-ar-quran"

            self.processor = WhisperProcessor.from_pretrained(model_name)
            self.model = WhisperForConditionalGeneration.from_pretrained(model_name).to(self.device)
            self.model_type = "whisper_tarteel"
            self.model_loaded = True
            print(f"✅ Successfully loaded {model_name}")
            return
        except Exception as e:
            print(f"⚠️  Could not load Whisper Tiny: {e}")

        # Option 2: Try Whisper Base model (better accuracy)
        try:
            print("🔍 Loading Whisper Base model...")
            from transformers import WhisperProcessor, WhisperForConditionalGeneration

            model_name = "tarteel-ai/whisper-base-ar-quran"

            self.processor = WhisperProcessor.from_pretrained(model_name)
            self.model = WhisperForConditionalGeneration.from_pretrained(model_name).to(self.device)
            self.model_type = "whisper_tarteel"
            self.model_loaded = True
            print(f"✅ Successfully loaded {model_name}")
            return
        except Exception as e:
            print(f"⚠️  Could not load Whisper Base: {e}")

        # Option 3: Try Tarteel Wav2Vec2 model
        try:
            print("🔍 Loading Tarteel Wav2Vec2 model...")
            model_name = "Tarteel/wav2vec2-large-xlsr-53-quran"

            self.processor = Wav2Vec2Processor.from_pretrained(model_name)
            self.model = AutoModelForCTC.from_pretrained(model_name).to(self.device)
            self.model_type = "wav2vec2_tarteel"
            self.model_loaded = True
            print(f"✅ Successfully loaded {model_name}")
            return
        except Exception as e:
            print(f"⚠️  Could not load Tarteel Wav2Vec2: {e}")

        # Option 4: Try general Arabic Wav2Vec2 model (robust fallback)
        try:
            print("🔍 Loading Arabic Wav2Vec2 model...")
            model_name = "jonatasgrosman/wav2vec2-large-xlsr-53-arabic"

            self.processor = Wav2Vec2Processor.from_pretrained(model_name)
            self.model = AutoModelForCTC.from_pretrained(model_name).to(self.device)
            self.model_type = "wav2vec2"
            self.model_loaded = True
            print(f"✅ Successfully loaded {model_name}")
            return
        except Exception as e:
            print(f"⚠️  Could not load Wav2Vec2 model: {e}")

        # Option 5: Try OpenAI Whisper with native library (best quality)
        try:
            print("🔍 Loading OpenAI Whisper native...")
            import whisper
            self.whisper_model = whisper.load_model("base")
            self.model_type = "whisper_native"
            self.model_loaded = True
            print("✅ Successfully loaded OpenAI Whisper base model")
            return
        except Exception as e:
            print(f"⚠️  Could not load native Whisper: {e}")

        # Option 6: Try OpenAI Whisper pipeline
        try:
            print("🔍 Loading OpenAI Whisper pipeline...")
            self.pipe = pipeline(
                "automatic-speech-recognition",
                model="openai/whisper-base",
                device=0 if self.device == "cuda" else -1
            )
            self.model_type = "whisper_pipeline"
            self.model_loaded = True
            print("✅ Successfully loaded OpenAI Whisper base model")
            return
        except Exception as e:
            print(f"⚠️  Could not load Whisper pipeline: {e}")

        print("⚠️  No model loaded. Using mock responses for testing.")
        print("💡 To use real models, run: pip install transformers torch")
        self.model_type = "mock"

    async def transcribe_audio(self, audio_bytes: bytes) -> Dict:
        """
        Transcribe audio bytes to Arabic text

        Args:
            audio_bytes: Raw audio data in bytes

        Returns:
            Dictionary with transcription text, confidence, and phonemes
        """
        try:
            # Load audio from bytes
            audio_array, sample_rate = self._load_audio_from_bytes(audio_bytes)

            if not self.model_loaded or self.model_type == "mock":
                # Mock response for testing
                return {
                    "text": "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
                    "confidence": 0.95,
                    "phonemes": [],
                    "token_confidences": None,
                    "model": "mock"
                }

            # Resample to 16kHz (standard for most speech models)
            if sample_rate != 16000:
                print(f"  → Resampling from {sample_rate}Hz to 16000Hz...")
                from scipy import signal
                num_samples = int(len(audio_array) * 16000 / sample_rate)
                audio_array = signal.resample(audio_array, num_samples)
                sample_rate = 16000
                print(f"  ✅ Resampled to {len(audio_array)} samples")

            # Transcribe based on model type
            if self.model_type in ["whisper", "whisper_tarteel"]:
                result = self._transcribe_whisper(audio_array, sample_rate)
            elif self.model_type == "whisper_native":
                result = self._transcribe_whisper_native(audio_array, sample_rate)
            elif self.model_type in ["wav2vec2", "wav2vec2_tarteel"]:
                result = self._transcribe_wav2vec2(audio_array, sample_rate)
            elif self.model_type == "whisper_pipeline":
                result = self._transcribe_whisper_pipeline(audio_array, sample_rate)
            else:
                result = {
                    "text": "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
                    "confidence": 0.0,
                    "phonemes": [],
                    "token_confidences": None,
                    "model": self.model_type
                }

            result["model"] = self.model_type
            return result

        except Exception as e:
            print(f"❌ Transcription error: {e}")
            import traceback
            traceback.print_exc()
            return {
                "text": "",
                "confidence": 0.0,
                "phonemes": [],
                "token_confidences": None,
                "error": str(e),
                "model": self.model_type if hasattr(self, 'model_type') else "unknown"
            }

    def _load_audio_from_bytes(self, audio_bytes: bytes):
        """Load audio from bytes - handles WAV and raw PCM"""
        audio_array = None
        sample_rate = 16000

        # Method 1: soundfile (WAV, FLAC, OGG)
        try:
            audio_io = io.BytesIO(audio_bytes)
            audio_array, sample_rate = sf.read(audio_io)
        except Exception:
            pass

        # Method 2: raw WAV via manual header parsing
        if audio_array is None and audio_bytes[:4] == b'RIFF':
            try:
                import struct
                # Parse WAV header manually
                riff_size = struct.unpack('<I', audio_bytes[4:8])[0]
                fmt_type = audio_bytes[8:12]
                if fmt_type == b'WAVE':
                    # Find fmt chunk
                    pos = 12
                    while pos < len(audio_bytes) - 8:
                        chunk_id = audio_bytes[pos:pos+4]
                        chunk_size = struct.unpack('<I', audio_bytes[pos+4:pos+8])[0]
                        if chunk_id == b'fmt ':
                            audio_format = struct.unpack('<H', audio_bytes[pos+8:pos+10])[0]
                            num_channels = struct.unpack('<H', audio_bytes[pos+10:pos+12])[0]
                            sample_rate = struct.unpack('<I', audio_bytes[pos+12:pos+16])[0]
                            bits_per_sample = struct.unpack('<H', audio_bytes[pos+22:pos+24])[0]
                        elif chunk_id == b'data':
                            data = audio_bytes[pos+8:pos+8+chunk_size]
                            if bits_per_sample == 16:
                                audio_array = np.frombuffer(data, dtype=np.int16).astype(np.float32) / 32768.0
                            elif bits_per_sample == 8:
                                audio_array = np.frombuffer(data, dtype=np.uint8).astype(np.float32) / 255.0 * 2 - 1
                            if num_channels == 2:
                                audio_array = audio_array.reshape(-1, 2).mean(axis=1)
                            break
                        pos += 8 + chunk_size
            except Exception:
                pass

        # Method 3: try raw PCM (16-bit, mono, 16kHz)
        if audio_array is None:
            try:
                raw = np.frombuffer(audio_bytes, dtype=np.int16)
                if len(raw) > 100:
                    audio_array = raw.astype(np.float32) / 32768.0
            except Exception:
                pass

        # Method 4: try raw float32
        if audio_array is None:
            try:
                raw = np.frombuffer(audio_bytes, dtype=np.float32)
                if len(raw) > 100:
                    audio_array = raw
            except Exception:
                pass

        # Last resort: return silence
        if audio_array is None:
            print("⚠️  Could not decode audio, returning silence")
            audio_array = np.zeros(16000, dtype=np.float32)

        if audio_array.dtype != np.float32:
            audio_array = audio_array.astype(np.float32)

        if len(audio_array.shape) > 1:
            audio_array = audio_array.mean(axis=1)

        return audio_array, sample_rate

    def _transcribe_whisper(self, audio_array: np.ndarray, sample_rate: int) -> Dict:
        """Transcribe using Whisper model"""
        input_features = self.processor(
            audio_array,
            sampling_rate=sample_rate,
            return_tensors="pt"
        ).input_features.to(self.device)

        # Generate transcription
        with torch.no_grad():
            predicted_ids = self.model.generate(input_features)

        transcription = self.processor.batch_decode(
            predicted_ids,
            skip_special_tokens=True
        )[0]

        # Strip Whisper special tokens like <|ar|>, <|transcribe|>, <|notimestamps|>
        import re
        transcription = re.sub(r'<\|[^|]+\|>', '', transcription).strip()
        # Remove leading/trailing quotes or spaces
        transcription = transcription.strip('" \'')

        return {
            "text": transcription,
            "confidence": 0.9,
            "phonemes": [],
            "token_confidences": None
        }

    def _transcribe_wav2vec2(self, audio_array: np.ndarray, sample_rate: int) -> Dict:
        """Transcribe using Wav2Vec2 model with per-token confidence"""
        input_values = self.processor(
            audio_array,
            sampling_rate=sample_rate,
            return_tensors="pt"
        ).input_values.to(self.device)

        with torch.no_grad():
            logits = self.model(input_values).logits

        predicted_ids = torch.argmax(logits, dim=-1)
        transcription = self.processor.batch_decode(predicted_ids)[0]

        probs = torch.softmax(logits, dim=-1)
        confidence = probs.max(dim=-1)[0].mean().item()

        # Per-token confidence
        token_probs = probs.max(dim=-1)[0]
        token_confidences = token_probs[0].tolist()

        return {
            "text": transcription,
            "confidence": confidence,
            "phonemes": [],
            "token_confidences": token_confidences
        }

    def _transcribe_whisper_pipeline(self, audio_array: np.ndarray, sample_rate: int) -> Dict:
        """Transcribe using Whisper pipeline"""
        result = self.pipe(
            audio_array,
            generate_kwargs={"language": "arabic", "task": "transcribe"}
        )

        return {
            "text": result["text"],
            "confidence": 0.9,
            "phonemes": [],
            "token_confidences": None
        }

    def _transcribe_whisper_native(self, audio_array: np.ndarray, sample_rate: int) -> Dict:
        """Transcribe using native Whisper library"""
        try:
            # Whisper expects float32 audio normalized to [-1, 1]
            if audio_array.dtype != np.float32:
                audio_array = audio_array.astype(np.float32)

            # Normalize
            if audio_array.max() > 1.0:
                audio_array = audio_array / 32768.0

            # Transcribe
            result = self.whisper_model.transcribe(
                audio_array,
                language="ar",
                task="transcribe"
            )

            return {
                "text": result["text"].strip(),
                "confidence": 0.9,
                "phonemes": [],
                "token_confidences": None,
                "segments": result.get("segments", [])
            }
        except Exception as e:
            print(f"Native Whisper transcription error: {e}")
            return {
                "text": "",
                "confidence": 0.0,
                "phonemes": [],
                "token_confidences": None,
                "error": str(e)
            }

        return {
            "text": result["text"],
            "confidence": 0.9,
            "phonemes": [],
            "token_confidences": None
        }
