"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Mic, MicOff, Loader, Sparkles, AudioWaveform as Waveform, Wifi, WifiOff, Play, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRecitationWebSocket } from "@/lib/useRecitationWebSocket";
import { apiFetch, blobToWavBase64 } from "@/lib/utils";
import AyahDisplay from "./AyahDisplay";
import FeedbackPanel from "./FeedbackPanel";
import AudioVisualizer from "./AudioVisualizer";

interface Ayah { number: number; text: string }

interface FullSurahRecitationProps { surahNumber: number; onBack: () => void }

type RecogMode = "whisper" | "browser";

export default function FullSurahRecitation({ surahNumber, onBack }: FullSurahRecitationProps) {
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [surahName, setSurahName] = useState("");
  const [displayAyahs, setDisplayAyahs] = useState<Ayah[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [analysis, setAnalysis] = useState<any>(null);
  const [recogMode, setRecogMode] = useState<RecogMode>("whisper");
  const [wsFallbackActive, setWsFallbackActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [recordedUrl, setRecordedUrl] = useState("");
  const [isPlayingRecording, setIsPlayingRecording] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const accumulatedTranscriptRef = useRef("");
  const userStoppedRef = useRef(false);
  const browserRestartTimer = useRef<NodeJS.Timeout | null>(null);
  const wsChunkCount = useRef(0);
  const wsChunksRef = useRef<Blob[]>([]);

  const { analysis: wsAnalysis, isConnected: wsConnected, sendAudioData, wsError } = useRecitationWebSocket();

  // WebSocket → live preview only (transcription updates in real-time)
  // Final analysis always comes from REST on stop (full audio, no race condition)
  useEffect(() => {
    if (recogMode === "whisper" && wsAnalysis?.transcription) {
      setTranscript(wsAnalysis.transcription);
    }
  }, [wsAnalysis, recogMode]);

  // Browser STT init
  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    try {
      const r = new SR();
      r.continuous = true; r.interimResults = true; r.lang = "ar-SA";
      r.onstart = () => setIsListening(true);
      r.onresult = (event: any) => {
        let fp = "", ip = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const t = event.results[i][0].transcript;
          event.results[i].isFinal ? (fp += t + " ") : (ip += t);
        }
        if (fp) accumulatedTranscriptRef.current += fp;
        setTranscript(accumulatedTranscriptRef.current + ip);
      };
      r.onerror = () => {};
      r.onend = () => {
        if (!userStoppedRef.current) {
          browserRestartTimer.current = setTimeout(() => { try { r.start(); } catch {} }, 150);
        } else { setIsListening(false); }
      };
      recognitionRef.current = r;
    } catch {}
    return () => {
      if (browserRestartTimer.current) clearTimeout(browserRestartTimer.current);
      try { recognitionRef.current?.stop(); } catch {}
    };
  }, []);

  // Fetch surah
  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const res = await apiFetch(`/api/quran/surah/${surahNumber}`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        setSurahName(data.surah?.englishName || "");
        const a: Ayah[] = (data.ayahs || []).map((x: any) => ({ number: x.number, text: x.text }));
        setAyahs(a);
        setDisplayAyahs(a.slice(0, 10));
      } catch { setError("Failed to load surah."); }
      finally { setIsLoading(false); }
    })();
  }, [surahNumber]);

  // REST transcribe + analyze
  const transcribeViaRest = async (blob: Blob) => {
    try {
      const b64 = await blobToWavBase64(blob);
      const res = await apiFetch("/api/transcribe", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audio: b64, surah_number: surahNumber, ayah_number: 1 }),
      });
      const data = await res.json();
      if (data.text) {
        const text = data.text;
        setTranscript(text);
        accumulatedTranscriptRef.current = text;

        // Also trigger Tajweed analysis
        const expectedText = displayAyahs.map((a) => a.text).join(" ").replace(/\s+/g, " ");
        const ar = await apiFetch("/api/quran/analyze-recitation", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ transcript: text, expected_text: expectedText, surah_number: surahNumber, ayahs: displayAyahs }),
        });
        const ad = await ar.json();
        if (ad.score != null) setAnalysis({ tajweed: ad, transcription: text, expected: expectedText, surahNumber, ayahNumber: 1 });
      } else {
        setError("Transcription empty. Try again.");
      }
    } catch { setError("Transcription failed."); }
  };

  // Whisper start
  const startWhisper = async () => {
    userStoppedRef.current = false;
    audioChunksRef.current = []; wsChunksRef.current = [];
    wsChunkCount.current = 0; setWsFallbackActive(false);
    setTranscript(""); setError(""); setAnalysis(null);

    try {
      const s = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
      setStream(s);

      const mime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus" : "audio/webm";
      const mr = new MediaRecorder(s, { mimeType: mime });
      mediaRecorderRef.current = mr;

      mr.ondataavailable = async (e) => {
        if (e.data.size === 0) return;
        audioChunksRef.current.push(e.data);
        wsChunkCount.current += 1;

        if (!wsFallbackActive && wsConnected) {
          const b64 = await blobToWavBase64(e.data);
          sendAudioData(b64, surahNumber, 1);
        }
      };

      mr.onstop = async () => {
        s.getTracks().forEach((t) => t.stop());
        setStream(null);
        setIsListening(false);

        // Create blob URL for playback
        if (recordedUrl) URL.revokeObjectURL(recordedUrl);
        const fullBlob = new Blob(audioChunksRef.current, { type: mime });
        setRecordedUrl(URL.createObjectURL(fullBlob));
        setIsPlayingRecording(false);

        // REST for accurate transcription + analysis
        await transcribeViaRest(fullBlob);
      };

      mr.onerror = () => setError("Recording error.");
      mr.start(3000);
      setIsListening(true);
    } catch (err: any) {
      if (err.name === "NotAllowedError") setError("Microphone permission denied.");
      else setError("Could not access microphone.");
    }
  };

  // Browser start / stop
  const startBrowser = () => {
    userStoppedRef.current = false;
    accumulatedTranscriptRef.current = ""; setTranscript(""); setError(""); setAnalysis(null);
    if (recognitionRef.current) { try { recognitionRef.current.start(); } catch {} }
  };
  const stopBrowser = () => {
    userStoppedRef.current = true;
    if (recognitionRef.current) { try { recognitionRef.current.stop(); } catch {} }
    setIsListening(false);
  };

  const start = recogMode === "whisper" ? startWhisper : startBrowser;
  const stop = recogMode === "whisper"
    ? () => { userStoppedRef.current = true; if (mediaRecorderRef.current?.state === "recording") mediaRecorderRef.current.stop(); }
    : stopBrowser;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-blue-50">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-gray-200 border-t-emerald-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading Surah...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-gray-200 px-3 sm:px-6">
        <div className="py-2 sm:py-3 flex items-center justify-between gap-2">
          <Button variant="outline" size="sm" onClick={onBack} className="text-xs">← Back</Button>
          <div className="text-center flex-1 min-w-0">
            <h1 className="text-sm sm:text-xl font-bold text-gray-900 truncate">{surahName}</h1>
            <p className="text-[10px] sm:text-xs text-gray-500">Surah {surahNumber}</p>
          </div>

          {/* Mode toggle */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => { if (!isListening) setRecogMode("whisper"); }}
              disabled={isListening}
              className={`flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold transition-all ${
                recogMode === "whisper" ? "bg-emerald-600 text-white shadow-sm" : "bg-gray-100 text-gray-500"
              } disabled:opacity-50`}
            >
              <Sparkles className="h-2.5 w-2.5" /> Whisper
            </button>
            <button
              onClick={() => { if (!isListening) setRecogMode("browser"); }}
              disabled={isListening}
              className={`flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold transition-all ${
                recogMode === "browser" ? "bg-sky-600 text-white shadow-sm" : "bg-gray-100 text-gray-500"
              } disabled:opacity-50`}
            >
              <Waveform className="h-2.5 w-2.5" /> Browser
            </button>
            {recogMode === "whisper" && (
              wsConnected ? <Wifi className="h-3 w-3 text-emerald-500" /> : <WifiOff className="h-3 w-3 text-amber-500" />
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-3 sm:px-6 py-4 sm:py-6 pb-32">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{error}</div>
        )}

        {/* Two-column layout matching /recitation */}
        <div className="grid gap-5 lg:grid-cols-2">
          {/* ── Left: Ayah Display + Recording ── */}
          <div className="space-y-5">
            <AyahDisplay
              surahNumber={surahNumber}
              ayahNumber={displayAyahs[0]?.number || 1}
              surahName={surahName}
              ayahText={displayAyahs.map((a) => a.text).join(" ")}
              transcription={transcript}
              errors={analysis?.tajweed?.errors || []}
            />

            {/* Recording card */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-lg text-center sm:p-8">
              <h3 className="mb-3 text-sm font-bold sm:text-lg">
                {isListening ? "🎤 Recording…" : "Ready to Recite"}
              </h3>

              <div className="flex items-center justify-center gap-3 mb-3">
                <span className={`inline-flex items-center gap-1.5 text-xs ${wsConnected ? "text-emerald-600" : "text-amber-500"}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${wsConnected ? "bg-emerald-500" : "bg-amber-500"}`} />
                  {wsConnected ? "Server" : wsFallbackActive ? "REST" : "Connecting…"}
                </span>
                {wsFallbackActive && <span className="text-[10px] text-amber-600">(REST fallback)</span>}
                {recogMode === "whisper" && isListening && (
                  <span className="text-[10px] text-amber-600 flex items-center gap-1">
                    <Loader className="h-2.5 w-2.5 animate-spin" /> Streaming
                  </span>
                )}
              </div>

              <div className="relative my-4">
                <AudioVisualizer isRecording={isListening} stream={stream} />
              </div>

              <button
                onClick={isListening ? stop : start}
                disabled={!wsConnected && recogMode === "whisper" && !wsFallbackActive}
                className={`relative mx-auto flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-full shadow-xl transition-all active:scale-95 ${
                  isListening
                    ? "bg-red-500 recording-pulse"
                    : "bg-emerald-600 hover:bg-emerald-700"
                } disabled:opacity-40`}
              >
                {isListening ? <MicOff className="h-8 w-8 text-white" /> : <Mic className="h-8 w-8 text-white" />}
              </button>

              <p className="mt-2 text-xs text-gray-500">
                {isListening ? "Tap to stop" : !wsConnected && recogMode === "whisper" && !wsFallbackActive ? "Connecting..." : recordedUrl ? "Complete" : "Tap to start"}
              </p>

              {/* Playback button */}
              {recordedUrl && !isListening && (
                <div className="mt-3">
                  <audio ref={audioRef} src={recordedUrl} onEnded={() => setIsPlayingRecording(false)} className="hidden" />
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
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-4 py-2 text-xs font-bold text-white shadow-md transition-all hover:shadow-lg hover:scale-105 active:scale-95"
                  >
                    {isPlayingRecording ? <Square className="h-3.5 w-3.5 fill-white" /> : <Play className="h-3.5 w-3.5 fill-white" />}
                    {isPlayingRecording ? "Stop" : "Listen to my recitation"}
                  </button>
                </div>
              )}

              {/* Live transcript inside recording card */}
              {transcript && (
                <div className="mt-4 p-3 rounded-lg bg-blue-50 border border-blue-200 text-left">
                  <p className="text-xs font-semibold text-blue-800 mb-1">📝 Your voice:</p>
                  <p className="text-xs text-gray-700 leading-relaxed line-clamp-2" dir="rtl">{transcript}</p>
                </div>
              )}
            </div>
          </div>

          {/* ── Right: Live Feedback Panel ── */}
          <div>
            {analysis ? (
              <FeedbackPanel analysis={analysis} expectedText={displayAyahs.map((a) => a.text).join(" ")} />
            ) : (
              <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-lg min-h-[300px] flex flex-col items-center justify-center text-center">
                <p className="text-sm text-gray-400 mb-2">📊 Analysis Panel</p>
                <p className="text-xs text-gray-300">Recite to see live Tajweed analysis here</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}