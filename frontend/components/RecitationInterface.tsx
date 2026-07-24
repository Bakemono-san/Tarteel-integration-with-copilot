"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ArrowLeft, Mic, MicOff, Loader, AlertCircle, Play, Square } from "lucide-react";
import AyahDisplay from "./AyahDisplay";
import FeedbackPanel from "./FeedbackPanel";
import AudioVisualizer from "./AudioVisualizer";
import { useRecitationWebSocket } from "@/lib/useRecitationWebSocket";
import { apiFetch, blobToWavBase64 } from "@/lib/utils";

interface Props {
  surahNumber: number;
  ayahNumber: number;
  onBack: () => void;
}

export default function RecitationInterface({
  surahNumber,
  ayahNumber,
  onBack,
}: Props) {
  const [isRecording, setIsRecording] = useState(false);
  const [ayahText, setAyahText] = useState("");
  const [surahName, setSurahName] = useState("");
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState("");
  const [audioLevel, setAudioLevel] = useState(0);
  const [finalAnalysis, setFinalAnalysis] = useState<any>(null);
  const [recordedUrl, setRecordedUrl] = useState<string>("");
  const [isPlayingRecording, setIsPlayingRecording] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number>(0);
  const audioChunksRef = useRef<Blob[]>([]);
  const mimeTypeRef = useRef<string>("audio/webm");

  const { analysis, isConnected, sendAudioData, resetAnalysis } =
    useRecitationWebSocket();

  useEffect(() => {
    fetchAyahData();
    resetAnalysis();
    setError("");
  }, [surahNumber, ayahNumber]);

  const fetchAyahData = async () => {
    try {
      const res = await apiFetch(`/api/quran/ayah/${surahNumber}/${ayahNumber}`);
      const data = await res.json();
      setAyahText(data.text || "");
      setSurahName(data.surahEnglishName || "");
    } catch {
      if (surahNumber === 1 && ayahNumber === 1) {
        setAyahText("بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ");
        setSurahName("Al-Fatihah");
      }
    }
  };

  const monitorAudioLevel = useCallback((stream: MediaStream) => {
    try {
      const ctx = new AudioContext();
      const src = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      src.connect(analyser);
      audioContextRef.current = ctx;
      analyserRef.current = analyser;

      const buffer = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        analyser.getByteFrequencyData(buffer);
        const avg = buffer.reduce((s, v) => s + v, 0) / buffer.length;
        setAudioLevel(avg);
        animFrameRef.current = requestAnimationFrame(tick);
      };
      tick();
    } catch {
      // Audio level monitoring is optional
    }
  }, []);

  const startRecording = async () => {
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      setMediaStream(stream);
      monitorAudioLevel(stream);

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
          ? "audio/webm"
          : "audio/ogg";
      mimeTypeRef.current = mimeType;

      const mr = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mr;
      audioChunksRef.current = [];

      // Chunks → WebSocket for live preview, also accumulated for REST final
      mr.ondataavailable = async (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
          // WebSocket for live preview
          const b64 = await blobToWavBase64(e.data);
          sendAudioData(b64, surahNumber, ayahNumber);
        }
      };

      mr.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        setMediaStream(null);
        setAudioLevel(0);
        if (audioContextRef.current) audioContextRef.current.close();
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        setIsRecording(false);

        // Revoke previous recording URL
        if (recordedUrl) URL.revokeObjectURL(recordedUrl);
        // Create blob URL for playback
        const fullBlob = new Blob(audioChunksRef.current, { type: mimeType });
        setRecordedUrl(URL.createObjectURL(fullBlob));
        setIsPlayingRecording(false);

        // REST final: accurate transcription + analysis
        await transcribeFullAudio(fullBlob, mimeType);
      };

      mr.onerror = () => {
        setError("Recording error. Please try again.");
      };

      mr.start(3000);
      setIsRecording(true);
      resetAnalysis();
    } catch (err: any) {
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setError("Microphone permission denied. Please allow mic access in your browser settings.");
      } else if (err.name === "NotFoundError") {
        setError("No microphone found. Please connect a microphone.");
      } else {
        setError("Could not access microphone. Please check your device settings.");
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // REST transcribe + analyze for accurate final result
  const transcribeFullAudio = async (blob: Blob, mime: string) => {
    try {
      const b64 = await blobToWavBase64(blob);
      const res = await apiFetch("/api/transcribe", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audio: b64, surah_number: surahNumber, ayah_number: ayahNumber }),
      });
      const data = await res.json();
      if (!data.text) return;

      const ar = await apiFetch("/api/quran/analyze-recitation", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript: data.text,
          expected_text: ayahText,
          surah_number: surahNumber,
          ayahs: [{ number: ayahNumber, text: ayahText }],
        }),
      });
      const ad = await ar.json();
      if (ad.score != null) {
        setFinalAnalysis({
          type: "analysis",
          transcription: data.text,
          confidence: data.confidence || 0.9,
          tajweed: ad,
          expected: ayahText,
          surahNumber,
          ayahNumber,
        });
      }
    } catch { /* silent */ }
  };

  return (
    <div className="mx-auto max-w-5xl">
      <button
        onClick={onBack}
        className="mb-5 flex items-center gap-1.5 text-sm text-gray-500 transition hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" /> Choose different Ayah
      </button>

      {error && (
        <div className="mb-5 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-5 w-5 shrink-0" />
          {error}
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Left */}
        <div className="space-y-5">
          <AyahDisplay
            surahNumber={surahNumber}
            ayahNumber={ayahNumber}
            surahName={surahName}
            ayahText={ayahText}
            transcription={analysis?.transcription}
            errors={analysis?.tajweed?.errors || []}
          />

          {/* Recording card */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-lg text-center sm:p-8">
            <h3 className="mb-4 text-base font-bold sm:text-lg">
              {isRecording ? "🎤 Recording…" : "Ready to Recite"}
            </h3>

            <div className="flex items-center justify-center gap-3 mb-4">
              <span
                className={`inline-flex items-center gap-1.5 text-xs ${
                  isConnected ? "text-emerald-600" : "text-red-500"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    isConnected ? "bg-emerald-500" : "bg-red-500"
                  }`}
                />
                {isConnected ? "Connected" : "Connecting…"}
              </span>

              {isRecording && (
                <span className="inline-flex items-center gap-1 text-xs text-amber-600">
                  <Loader className="h-3 w-3 animate-spin" />
                  Streaming
                </span>
              )}
            </div>

            {/* Audio visualizer */}
            <div className="relative my-5">
              <AudioVisualizer
                isRecording={isRecording}
                stream={mediaStream}
              />
            </div>

            {/* Mic button */}
            <button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={!isConnected && !isRecording}
              className={`relative mx-auto flex h-24 w-24 items-center justify-center rounded-full shadow-xl transition-all active:scale-95 sm:h-28 sm:w-28 ${
                isRecording
                  ? "bg-red-500 recording-pulse"
                  : "bg-emerald-600 hover:bg-emerald-700"
              } disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              {isRecording ? (
                <MicOff className="h-10 w-10 text-white" />
              ) : (
                <Mic className="h-10 w-10 text-white" />
              )}
            </button>

            <p className="mt-3 text-xs text-gray-500 sm:text-sm">
              {isRecording
                ? "Tap to stop"
                : !isConnected
                  ? "Connecting to server..."
                  : recordedUrl
                    ? "Recitation complete"
                    : "Tap to start"}
            </p>

            {/* Playback button */}
            {recordedUrl && !isRecording && (
              <div className="mt-4">
                <audio
                  ref={audioRef}
                  src={recordedUrl}
                  onEnded={() => setIsPlayingRecording(false)}
                  className="hidden"
                />
                <button
                  onClick={() => {
                    if (isPlayingRecording) {
                      audioRef.current?.pause();
                      audioRef.current!.currentTime = 0;
                      setIsPlayingRecording(false);
                    } else {
                      audioRef.current?.play();
                      setIsPlayingRecording(true);
                    }
                  }}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-5 py-2.5 text-xs font-bold text-white shadow-md transition-all hover:shadow-lg hover:scale-105 active:scale-95"
                >
                  {isPlayingRecording ? (
                    <Square className="h-4 w-4 fill-white" />
                  ) : (
                    <Play className="h-4 w-4 fill-white" />
                  )}
                  {isPlayingRecording ? "Stop" : "Play my recitation"}
                </button>
              </div>
            )}

            {analysis?.partial && (
              <p className="mt-2 text-xs text-amber-600">
                ⏳ Analysing partial recitation…
              </p>
            )}
          </div>
        </div>

        {/* Right — feedback */}
        <FeedbackPanel analysis={finalAnalysis || analysis} expectedText={ayahText} />
      </div>
    </div>
  );
}