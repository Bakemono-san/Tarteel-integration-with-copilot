"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { X, Mic, MicOff, Loader, Sparkles, AudioWaveform as Waveform, Wifi, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useRecitationWebSocket } from "@/lib/useRecitationWebSocket";

interface Ayah { number: number; text: string }

interface AnalysisResult {
  accuracy: number; score?: number; transcript: string; expected: string;
  errors: Array<{ type: string; expected: string; received: string; actual?: string; confidence_level?: string; asr_confidence?: number | null }>;
  error_count: number; feedback?: string; corrections?: string[];
  tajweed_rules?: Array<{ rule: string; status: string; level?: string; description?: string }>;
}

interface FullSurahRecitationProps { surahNumber: number; onBack: () => void }

type RecogMode = "whisper" | "browser";

const TUNNEL_URL = "wss://messaging-lincoln-committee-monitors.trycloudflare.com/ws/recitation";

export default function FullSurahRecitation({ surahNumber, onBack }: FullSurahRecitationProps) {
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [surahName, setSurahName] = useState("");
  const [displayAyahs, setDisplayAyahs] = useState<Ayah[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult | null>(null);
  const [highlightedAyahs, setHighlightedAyahs] = useState<Record<number, any[]>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recogMode, setRecogMode] = useState<RecogMode>("whisper");
  const [wsFallbackActive, setWsFallbackActive] = useState(false);

  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const accumulatedTranscriptRef = useRef("");
  const userStoppedRef = useRef(false);
  const browserRestartTimer = useRef<NodeJS.Timeout | null>(null);
  const wsChunkCount = useRef(0);

  const { analysis: wsAnalysis, isConnected: wsConnected, sendAudioData, wsError } = useRecitationWebSocket();

  // ── WebSocket live transcription ──
  useEffect(() => {
    if (recogMode === "whisper" && wsAnalysis?.transcription && isListening) {
      setTranscript(wsAnalysis.transcription);
    }
  }, [wsAnalysis, recogMode, isListening]);

  // ── WebSocket gone? switch to REST fallback ──
  useEffect(() => {
    if (recogMode === "whisper" && !wsConnected && wsError && wsChunkCount.current >= 3) {
      if (!wsFallbackActive) {
        console.log("[WS] Fallback to REST");
        setWsFallbackActive(true);
      }
    }
  }, [wsConnected, wsError, recogMode, wsFallbackActive]);

  // ── Browser STT init ──
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
      r.onerror = (event: any) => { if (event.error !== "aborted" && event.error !== "no-speech") console.error("STT:", event.error); };
      r.onend = () => {
        if (!userStoppedRef.current) {
          browserRestartTimer.current = setTimeout(() => { try { r.start(); } catch {} }, 150);
        } else { setIsListening(false); }
      };
      recognitionRef.current = r;
    } catch (e) { console.error("STT init:", e); }
    return () => {
      if (browserRestartTimer.current) clearTimeout(browserRestartTimer.current);
      try { recognitionRef.current?.stop(); } catch {}
    };
  }, []);

  // ── Fetch surah ──
  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/quran/surah/${surahNumber}`);
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

  // ── Transcribe via REST (fallback) ──
  const transcribeViaRest = async (blob: Blob, mime: string) => {
    setIsTranscribing(true);
    try {
      const b64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result?.toString().split(",")[1] || "");
        reader.readAsDataURL(blob);
      });
      const res = await fetch("/api/transcribe", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audio: b64, surah_number: surahNumber, ayah_number: 1 }),
      });
      const data = await res.json();
      if (data.text) { setTranscript(data.text); accumulatedTranscriptRef.current = data.text; }
      else { setError("Transcription empty. Try again."); }
    } catch { setError("Transcription failed. Is backend running?"); }
    finally { setIsTranscribing(false); }
  };

  // ── Whisper: start streaming via WebSocket ──
  const startWhisperStream = async () => {
    userStoppedRef.current = false;
    audioChunksRef.current = [];
    wsChunkCount.current = 0;
    setWsFallbackActive(false);
    setTranscript("");
    setError("");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
      const mime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus" : MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "audio/ogg";
      const mr = new MediaRecorder(stream, { mimeType: mime });
      mediaRecorderRef.current = mr;

      mr.ondataavailable = (e) => {
        if (e.data.size === 0) return;
        audioChunksRef.current.push(e.data);
        wsChunkCount.current += 1;

        if (!wsFallbackActive && wsConnected) {
          // Stream to WebSocket
          const reader = new FileReader();
          reader.onloadend = () => {
            sendAudioData(reader.result?.toString().split(",")[1] || "", surahNumber, 1);
          };
          reader.readAsDataURL(e.data);
        }
      };

      mr.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        setIsListening(false);

        // If WS streaming was active, use accumulated transcript from WS
        if (!wsFallbackActive && wsAnalysis?.transcription) {
          const text = wsAnalysis.transcription;
          setTranscript(text);
          accumulatedTranscriptRef.current = text;
        } else {
          // REST fallback: transcribe full audio
          const blob = new Blob(audioChunksRef.current, { type: mime });
          await transcribeViaRest(blob, mime);
        }
      };

      mr.onerror = () => setError("Recording error.");
      mr.start(2000);
      setIsListening(true);
    } catch (err: any) {
      if (err.name === "NotAllowedError") setError("Microphone permission denied.");
      else setError("Could not access microphone.");
    }
  };

  // ── Browser STT ──
  const startBrowserSTT = () => {
    userStoppedRef.current = false;
    accumulatedTranscriptRef.current = "";
    setTranscript(""); setError("");
    if (recognitionRef.current) { try { recognitionRef.current.start(); } catch {} }
  };

  const stopBrowserSTT = () => {
    userStoppedRef.current = true;
    if (recognitionRef.current) { try { recognitionRef.current.stop(); } catch {} }
    setIsListening(false);
  };

  const startListening = recogMode === "whisper" ? startWhisperStream : startBrowserSTT;
  const stopListening = recogMode === "whisper"
    ? () => { userStoppedRef.current = true; if (mediaRecorderRef.current?.state === "recording") mediaRecorderRef.current.stop(); }
    : stopBrowserSTT;

  // ── Analyze ──
  const handleAnalyze = useCallback(async () => {
    const text = transcript || accumulatedTranscriptRef.current;
    if (!text.trim()) { setError("Please recite first."); return; }
    setIsAnalyzing(true);
    try {
      const expectedText = displayAyahs.map((a) => a.text).join(" ").replace(/\s+/g, " ");
      const res = await fetch("/api/quran/analyze-recitation", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: text, expected_text: expectedText, surah_number: surahNumber, ayahs: displayAyahs }),
      });
      const data = await res.json();
      setAnalysisResults(data);
      if (data.errors?.length > 0) {
        const m: Record<number, any[]> = {};
        data.errors.forEach((e: any) => { const n = e.ayah_number || displayAyahs[0]?.number; (m[n] ??= []).push(e); });
        setHighlightedAyahs(m);
      } else { setHighlightedAyahs({}); }
      setShowReview(true);
    } catch { setError("Analysis failed."); }
    finally { setIsAnalyzing(false); }
  }, [transcript, displayAyahs, surahNumber]);

  const getHighlight = useCallback((text: string, num: number) => {
    if (!highlightedAyahs[num]?.length) return text;
    let r = text;
    highlightedAyahs[num].forEach((e: any) => {
      if (e.expected) {
        r = r.replace(new RegExp(e.expected.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"),
          `<span class="bg-red-500/30 text-red-900 font-bold px-0.5 rounded">$&</span>`);
      }
    });
    return r;
  }, [highlightedAyahs]);

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
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-gray-200 px-2 sm:px-6">
        <div className="py-2 sm:py-4">
          <div className="flex items-center justify-between gap-1 mb-1.5">
            <Button variant="outline" size="sm" onClick={onBack} className="text-xs">←</Button>
            <div className="text-center flex-1 min-w-0">
              <h1 className="text-sm sm:text-2xl font-bold text-gray-900 truncate">{surahName}</h1>
              <p className="text-[10px] sm:text-xs text-gray-500">Surah {surahNumber}</p>
            </div>
            <div className="w-12 sm:w-20 flex justify-end">
              {isListening && <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />}
            </div>
          </div>

          {/* Mode toggle + status */}
          <div className="flex items-center justify-center gap-1 sm:gap-1.5 flex-wrap">
            <button
              onClick={() => { if (!isListening) setRecogMode("whisper"); }}
              disabled={isListening}
              className={`flex items-center gap-1 rounded-full px-2 sm:px-3 py-1 text-[10px] sm:text-[11px] font-semibold transition-all ${
                recogMode === "whisper"
                  ? "bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-sm"
                  : "bg-gray-100 text-gray-500"
              } disabled:opacity-50`}
            >
              <Sparkles className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
              Whisper
            </button>
            <button
              onClick={() => { if (!isListening) setRecogMode("browser"); }}
              disabled={isListening}
              className={`flex items-center gap-1 rounded-full px-2 sm:px-3 py-1 text-[10px] sm:text-[11px] font-semibold transition-all ${
                recogMode === "browser"
                  ? "bg-gradient-to-r from-sky-600 to-sky-500 text-white shadow-sm"
                  : "bg-gray-100 text-gray-500"
              } disabled:opacity-50`}
            >
              <Waveform className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
              Browser
            </button>
            {recogMode === "whisper" && (
              wsConnected
                ? <Wifi className="h-3 w-3 text-emerald-500" />
                : <WifiOff className="h-3 w-3 text-amber-500" />
            )}
            {wsFallbackActive && <span className="text-[10px] text-amber-600">(REST)</span>}
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="w-full px-2 sm:px-6 py-3 sm:py-8 pb-32 sm:pb-40">
        {error && (
          <div className="mb-3 sm:mb-4 p-2 sm:p-4 bg-red-50 border border-red-200 rounded-xl text-xs sm:text-sm">
            <p className="text-red-700 font-semibold">{error}</p>
          </div>
        )}

        {/* Quran Text */}
        <div className="card-mushaf p-3 sm:p-8 md:p-12 mb-4 sm:mb-6">
          {surahNumber !== 9 && (
            <div className="text-center mb-3 sm:mb-6 pb-3 sm:pb-6 border-b border-amber-200/60">
              <p className="text-lg sm:text-3xl md:text-4xl font-semibold text-emerald-800 leading-relaxed bismillah">
                بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
              </p>
            </div>
          )}
          <div className="text-center leading-relaxed" dir="rtl">
            <p className="text-sm sm:text-2xl md:text-3xl font-semibold text-gray-900 quran-page inline">
              {displayAyahs.map((ayah, i) => (
                <span key={ayah.number}>
                  <span dangerouslySetInnerHTML={{ __html: getHighlight(ayah.text, ayah.number) }} />
                  <span className="ayah-marker" style={{ width: '1.2em', height: '1.2em', fontSize: '0.5em' }}>{ayah.number}</span>
                  {i < displayAyahs.length - 1 && " "}
                </span>
              ))}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col items-center gap-3 sm:gap-4">
          <button
            onClick={isListening ? stopListening : startListening}
            disabled={isTranscribing}
            className={`relative w-16 h-16 sm:w-28 sm:h-28 rounded-full flex items-center justify-center transition-all transform hover:scale-110 active:scale-95 font-medium shadow-xl ${
              isListening
                ? "bg-red-500 hover:bg-red-600 text-white recording-pulse"
                : "bg-emerald-600 hover:bg-emerald-700 text-white"
            } disabled:opacity-50`}
          >
            {isListening ? <MicOff className="h-7 w-7 sm:h-12 sm:w-12" /> : <Mic className="h-7 w-7 sm:h-12 sm:w-12" />}
          </button>

          <div className="text-center">
            {isListening ? (
              <p className="text-xs sm:text-lg font-semibold text-emerald-700 flex items-center gap-1.5">
                <Loader className="h-3 w-3 animate-spin" /> Recording...
                {recogMode === "whisper" && !wsFallbackActive && <span className="text-[10px] text-amber-600">(streaming)</span>}
                {wsFallbackActive && <span className="text-[10px] text-amber-600">(buffering)</span>}
              </p>
            ) : isTranscribing ? (
              <p className="text-xs sm:text-lg font-semibold text-amber-600 flex items-center gap-1.5">
                <Loader className="h-3 w-3 animate-spin" /> Transcribing...
              </p>
            ) : transcript ? (
              <p className="text-xs sm:text-lg font-semibold text-emerald-700">✅ Complete</p>
            ) : (
              <p className="text-xs sm:text-lg font-semibold text-gray-500">
                {recogMode === "whisper" ? "🎤 Tap mic" : "🎤 Tap mic"}
              </p>
            )}
          </div>

          {/* Live transcript box */}
          {transcript && (
            <div className="w-full max-w-xl sm:max-w-2xl p-3 sm:p-6 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200">
              <h3 className="font-bold text-xs sm:text-base text-blue-900 mb-1.5 sm:mb-3">📝 Your Voice:</h3>
              <p className="text-xs sm:text-base text-gray-900 leading-relaxed mb-2 sm:mb-3 line-clamp-2 sm:line-clamp-none" dir="rtl">
                {transcript}
              </p>
              <Button onClick={handleAnalyze} disabled={isAnalyzing} className="w-full text-xs sm:text-sm py-1.5 sm:py-2">
                {isAnalyzing ? "Analyzing..." : "📋 Review Recitation"}
              </Button>
            </div>
          )}
        </div>
      </main>

      {/* Review Dialog */}
      <Dialog open={showReview} onOpenChange={setShowReview}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogTitle className="sr-only">Recitation Review</DialogTitle>
          <div className="space-y-4 sm:space-y-6">
            {analysisResults && (
              <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 border border-emerald-300 rounded-xl p-4 sm:p-8 text-center">
                <p className="text-3xl sm:text-6xl font-bold text-emerald-700 mb-1 sm:mb-2 score-pop">
                  {analysisResults.score ?? (analysisResults.accuracy * 100).toFixed(0)}
                </p>
                <p className="text-sm sm:text-lg font-semibold text-emerald-900">Score</p>
                <p className="text-xs sm:text-sm text-emerald-600">Acc: {(analysisResults.accuracy * 100).toFixed(1)}%</p>
              </div>
            )}

            {analysisResults?.feedback && (
              <div className="bg-sky-50 border border-sky-200 rounded-xl p-3 text-xs sm:text-sm text-sky-900">{analysisResults.feedback}</div>
            )}

            <div>
              <h3 className="text-sm sm:text-lg font-bold text-gray-900 mb-2 sm:mb-3">You Said:</h3>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 sm:p-4">
                <p className="text-xs sm:text-base text-gray-900 leading-relaxed" dir="rtl">{analysisResults?.transcript || transcript}</p>
              </div>
            </div>
            <div>
              <h3 className="text-sm sm:text-lg font-bold text-gray-900 mb-2 sm:mb-3">Expected:</h3>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 sm:p-4">
                <p className="text-base sm:text-2xl font-semibold text-gray-900 leading-relaxed quran-page" dir="rtl">
                  {displayAyahs.map((a) => a.text).join(" ")}
                </p>
              </div>
            </div>

            {analysisResults?.tajweed_rules != null && analysisResults.tajweed_rules.length > 0 && (
              <div>
                <h3 className="text-sm sm:text-lg font-bold text-emerald-800 mb-2">Tajweed Rules</h3>
                <div className="space-y-1">
                  {analysisResults.tajweed_rules.map((rule, idx) => {
                    const g = rule.status === "applied_correctly";
                    const b = rule.status === "applied_incorrectly" || rule.status === "not_applied";
                    return (
                      <div key={idx} className={`flex items-center gap-1.5 p-2 rounded-lg text-xs sm:text-sm ${g ? "bg-emerald-50 text-emerald-800" : b ? "bg-red-50 text-red-800" : "bg-gray-50 text-gray-500"}`}>
                        <span>{g ? "✅" : b ? "⚠️" : "○"}</span>
                        <span className="font-medium">{rule.rule}</span>
                        <span className="text-[10px] sm:text-xs text-gray-500 truncate">{rule.description}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {analysisResults?.errors && analysisResults.errors.length > 0 ? (
              <div>
                <h3 className="text-sm sm:text-lg font-bold text-red-800 mb-3">Issues ({analysisResults.error_count || analysisResults.errors.length})</h3>
                <div className="space-y-2">
                  {analysisResults.errors.map((error, idx) => (
                    <div key={idx} className={`${error.confidence_level === "low" ? "bg-amber-50 border-l-4 border-amber-400" : "bg-red-50 border-l-4 border-red-400"} p-2 sm:p-4 rounded-xl`}>
                      <p className="font-semibold capitalize text-xs sm:text-base">
                        {error.type}
                        {error.confidence_level === "low" && <span className="ml-1 text-[10px] font-normal text-amber-600">(low conf)</span>}
                      </p>
                      {error.expected && <p className="text-xs sm:text-sm mt-0.5"><span className="font-medium">Expected:</span> <span dir="rtl">{error.expected}</span></p>}
                      <p className="text-xs sm:text-sm"><span className="font-medium">You:</span> <span dir="rtl">{error.received || error.actual}</span></p>
                    </div>
                  ))}
                </div>
              </div>
            ) : analysisResults ? (
              <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-4 sm:p-8 text-center">
                <p className="text-2xl sm:text-4xl mb-2">✅</p>
                <p className="text-base sm:text-xl font-semibold text-emerald-900">Masha'Allah! Perfect!</p>
              </div>
            ) : null}

            {analysisResults?.corrections != null && analysisResults.corrections.length > 0 && (
              <div>
                <h3 className="text-sm sm:text-lg font-bold text-amber-800 mb-2">Suggestions</h3>
                <ul className="space-y-1">
                  {analysisResults.corrections.map((c, idx) => (
                    <li key={idx} className="flex gap-1.5 text-xs sm:text-sm text-gray-700"><span className="text-emerald-500">•</span> {c}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex gap-2 sm:gap-3 pt-3 sm:pt-4">
              <Button variant="secondary" onClick={() => {
                setShowReview(false); setAnalysisResults(null); accumulatedTranscriptRef.current = "";
                setTranscript(""); setHighlightedAyahs({});
              }} className="flex-1 text-xs sm:text-sm">🔄 Try Again</Button>
              <Button variant="outline" onClick={onBack} className="flex-1 text-xs sm:text-sm">← Back</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}