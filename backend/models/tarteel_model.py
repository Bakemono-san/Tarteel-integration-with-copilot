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
    Wrapper for Tarteel AI's Arabic Quran Speech Recognition Model
    Using Tarteel's fine-tuned models optimized for Quranic recitation

    Priority order:
    1. Tarteel's Whisper models (best for Quran)
    2. Tarteel's Wav2Vec2 models
    3. General Arabic ASR models
    4. OpenAI Whisper with Arabic
    """

    def __init__(self):
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        print(f"🚀 Initializing Tarteel Model...")
        print(f"📱 Using device: {self.device}")

        # Try to load Tarteel's models (multiple options)
        self.model_loaded = False
        self.model = None
        self.processor = None
        self.pipe = None
        self.whisper_model = None

        self._load_model()

    def _load_model(self):
        """Load the best available Tarteel/Arabic Quran ASR model"""

        # Option 1: Try Tarteel's Whisper Tiny model (fastest, good accuracy)
        try:
            print("🔍 Loading Tarteel Whisper Tiny model...")
            from transformers import WhisperProcessor, WhisperForConditionalGeneration

            model_name = "tarteel-ai/whisper-tiny-ar-quran"

            self.processor = WhisperProcessor.from_pretrained(model_name)
            self.model = WhisperForConditionalGeneration.from_pretrained(model_name).to(self.device)
            self.model_type = "whisper_tarteel"
            self.model_loaded = True
            print(f"✅ Successfully loaded {model_name}")
            return
        except Exception as e:
            print(f"⚠️  Could not load Tarteel Whisper Tiny: {e}")

        # Option 2: Try Tarteel's Whisper Base model (better accuracy)
        try:
            print("🔍 Loading Tarteel Whisper Base model...")
            from transformers import WhisperProcessor, WhisperForConditionalGeneration

            model_name = "tarteel-ai/whisper-base-ar-quran"

            self.processor = WhisperProcessor.from_pretrained(model_name)
            self.model = WhisperForConditionalGeneration.from_pretrained(model_name).to(self.device)
            self.model_type = "whisper_tarteel"
            self.model_loaded = True
            print(f"✅ Successfully loaded {model_name}")
            return
        except Exception as e:
            print(f"⚠️  Could not load Tarteel Whisper Base: {e}")

        # Option 3: Try Tarteel's Wav2Vec2 model
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
                "error": str(e),
                "model": self.model_type if hasattr(self, 'model_type') else "unknown"
            }

    def _load_audio_from_bytes(self, audio_bytes: bytes):
        """Load audio from bytes - handles WebM, OGG, WAV formats"""
        try:
            # First, try with soundfile (for WAV files)
            audio_io = io.BytesIO(audio_bytes)
            audio_array, sample_rate = sf.read(audio_io)
        except Exception as e:
            print(f"⚠️  Soundfile failed: {e}")
            print("  → Trying pydub for WebM/OGG format...")

            try:
                # Try with pydub for WebM/OGG formats from MediaRecorder
                from pydub import AudioSegment

                audio_io = io.BytesIO(audio_bytes)

                # Try to detect format from bytes or assume WebM
                try:
                    audio = AudioSegment.from_file(audio_io, format="webm")
                except Exception:
                    try:
                        audio_io.seek(0)
                        audio = AudioSegment.from_file(audio_io, format="ogg")
                    except Exception:
                        audio_io.seek(0)
                        audio = AudioSegment.from_file(audio_io, format="wav")

                # Convert to numpy array
                samples = np.array(audio.get_array_of_samples())

                # Handle stereo/mono
                if audio.channels == 2:
                    samples = samples.reshape((-1, 2))
                    samples = samples.mean(axis=1)

                audio_array = samples.astype(np.float32) / 32768.0
                sample_rate = audio.frame_rate

                print(f"  ✅ Successfully loaded {len(audio_array)} samples at {sample_rate}Hz")

            except Exception as e2:
                print(f"❌ Pydub also failed: {e2}")
                raise

        # Ensure float32
        if audio_array.dtype != np.float32:
            audio_array = audio_array.astype(np.float32)

        # Normalize if needed
        if audio_array.max() > 1.0:
            audio_array = audio_array / 32768.0

        # Convert to mono if stereo
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

        return {
            "text": transcription,
            "confidence": 0.9,  # Whisper doesn't provide confidence scores easily
            "phonemes": []
        }

    def _transcribe_wav2vec2(self, audio_array: np.ndarray, sample_rate: int) -> Dict:
        """Transcribe using Wav2Vec2 model"""
        input_values = self.processor(
            audio_array,
            sampling_rate=sample_rate,
            return_tensors="pt"
        ).input_values.to(self.device)

        # Get logits
        with torch.no_grad():
            logits = self.model(input_values).logits

        # Decode
        predicted_ids = torch.argmax(logits, dim=-1)
        transcription = self.processor.batch_decode(predicted_ids)[0]

        # Calculate average confidence from logits
        probs = torch.softmax(logits, dim=-1)
        confidence = probs.max(dim=-1)[0].mean().item()

        return {
            "text": transcription,
            "confidence": confidence,
            "phonemes": []
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
            "phonemes": []
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
                "confidence": 0.9,  # Whisper doesn't provide per-token confidence easily
                "phonemes": [],
                "segments": result.get("segments", [])
            }
        except Exception as e:
            print(f"Native Whisper transcription error: {e}")
            return {
                "text": "",
                "confidence": 0.0,
                "phonemes": [],
                "error": str(e)
            }

        return {
            "text": result["text"],
            "confidence": 0.9,
            "phonemes": []
        }
