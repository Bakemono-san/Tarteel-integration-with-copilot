"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { X, Mic, MicOff, Loader, Sparkles, Radio, AudioWaveform as Waveform } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useRecitationWebSocket } from "@/lib/useRecitationWebSocket";

interface Ayah {
  number: number;
  text: string;
}

interface AnalysisResult {
  accuracy: number;
  score?: number;
  transcript: string;
  expected: string;
  errors: Array<{
    type: string;
    expected: string;
    received: string;
    actual?: string;
    confidence_level?: string;
  }>;
  error_count: number;
  feedback?: string;
  corrections?: string[];
  tajweed_rules?: Array<{
    rule: string;
    status: string;
    level?: string;
    description?: string;
  }>;
}

interface FullSurahRecitationProps {
  surahNumber: number;
  onBack: () => void;
}

type RecogMode = "whisper" | "browser";

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
  const [recogMode, setRecogMode] = useState<RecogMode>("whisper");

  // Refs
  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const accumulatedTranscriptRef = useRef("");
  const userStoppedRef = useRef(false);
  const browserRestartTimer = useRef<NodeJS.Timeout | null>(null);

  const { analysis: wsAnalysis, isConnected, sendAudioData, wsError } = useRecitationWebSocket();

  // ── Whisper mode: receive live transcription ──
  useEffect(() => {
    if (recogMode === "whisper" && wsAnalysis?.transcription) {
      setTranscript(wsAnalysis.transcription);
    }
  }, [wsAnalysis, recogMode]);

  // ── Auto-switch to browser STT if WebSocket fails ──
  useEffect(() => {
    if (recogMode === "whisper" && wsError && !isConnected) {
      console.log("WebSocket unavailable, switching to browser STT");
      setRecogMode("browser");
    }
  }, [wsError, isConnected, recogMode]);

  // ── Browser STT init ──
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    try {
      const r = new SpeechRecognition();
      r.continuous = true;
      r.interimResults = true;
      r.lang = "ar-SA";

      r.onstart = () => setIsListening(true);

      r.onresult = (event: any) => {
        let finalPart = "";
        let interimPart = "";
        const startIdx = event.resultIndex;

        for (let i = startIdx; i < event.results.length; i++) {
          const t = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalPart += t + " ";
          } else {
            interimPart += t;
          }
        }
        if (finalPart) {
          accumulatedTranscriptRef.current += finalPart;
        }
        setTranscript(accumulatedTranscriptRef.current + interimPart);
      };

      r.onerror = (event: any) => {
        if (event.error !== "aborted" && event.error !== "no-speech") {
          console.error("STT error:", event.error);
        }
      };

      r.onend = () => {
        if (!userStoppedRef.current) {
          // Auto-restart (browser times out sessions after ~60s)
          browserRestartTimer.current = setTimeout(() => {
            try { r.start(); } catch {}
          }, 150);
        } else {
          setIsListening(false);
        }
      };

      recognitionRef.current = r;
    } catch (e) {
      console.error("STT init error:", e);
    }

    return () => {
      if (browserRestartTimer.current) clearTimeout(browserRestartTimer.current);
      try { recognitionRef.current?.stop(); } catch {}
    };
  }, []);

  // ── Fetch surah ──
  useEffect(() => {
    const fetchSurah = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/quran/surah/${surahNumber}`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        setSurahName(data.surah?.englishName || "");
        const ayahsData: Ayah[] = (data.ayahs || []).map((x: any) => ({ number: x.number, text: x.text }));
        setAyahs(ayahsData);
        setDisplayAyahs(ayahsData.slice(0, 10));
      } catch {
        setError("Failed to load surah.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchSurah();
  }, [surahNumber]);

  // ── Start / Stop listening ──
  const startWhisper = async () => {
    userStoppedRef.current = false;
    accumulatedTranscriptRef.current = "";
    setTranscript("");
    setError("");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
          ? "audio/webm" : "audio/ogg";

      const mr = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mr;

      mr.ondataavailable = (e) => {
        if (e.data.size > 0) {
          const reader = new FileReader();
          reader.onloadend = () => {
            const b64 = reader.result?.toString().split(",")[1] || "";
            sendAudioData(b64, surahNumber, 1);
          };
          reader.readAsDataURL(e.data);
        }
      };

      mr.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        setIsListening(false);
      };

      mr.start(2000);
      setIsListening(true);
    } catch (err: any) {
      if (err.name === "NotAllowedError") setError("Microphone permission denied.");
      else setError("Could not access microphone.");
    }
  };

  const startBrowser = () => {
    userStoppedRef.current = false;
    accumulatedTranscriptRef.current = "";
    setTranscript("");
    setError("");

    if (recognitionRef.current) {
      try { recognitionRef.current.start(); } catch (err) { console.error("STT start:", err); }
    }
  };

  const stopWhisper = () => {
    userStoppedRef.current = true;
    if (mediaRecorderRef.current && isListening) {
      mediaRecorderRef.current.stop();
    }
  };

  const stopBrowser = () => {
    userStoppedRef.current = true;
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
    }
    setIsListening(false);
  };

  const startListening = recogMode === "whisper" ? startWhisper : startBrowser;
  const stopListening = recogMode === "whisper" ? stopWhisper : stopBrowser;

  // ── Analyze ──
  const handleAnalyze = useCallback(async () => {
    if (!transcript.trim()) { setError("Please recite first."); return; }
    setIsAnalyzing(true);
    try {
      const expectedText = displayAyahs.map((a) => a.text).join(" ").replace(/\s+/g, " ");
      const res = await fetch("/api/quran/analyze-recitation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript, expected_text: expectedText, surah_number: surahNumber, ayahs: displayAyahs }),
      });
      const data = await res.json();
      setAnalysisResults(data);

      if (data.errors?.length > 0) {
        const m: Record<number, any[]> = {};
        data.errors.forEach((e: any) => {
          const n = e.ayah_number || displayAyahs[0]?.number;
          (m[n] ??= []).push(e);
        });
        setHighlightedAyahs(m);
      } else {
        setHighlightedAyahs({});
      }
      setShowReview(true);
    } catch {
      setError("Analysis failed.");
    } finally {
      setIsAnalyzing(false);
    }
  }, [transcript, displayAyahs, surahNumber]);

  // ── Highlight helper ──
  const getHighlighted = useCallback((text: string, num: number) => {
    if (!highlightedAyahs[num]?.length) return text;
    let r = text;
    highlightedAyahs[num].forEach((e: any) => {
      if (e.expected) {
        const esc = e.expected.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        r = r.replace(new RegExp(esc, "g"), `<span class="bg-red-500/30 text-red-900 font-bold px-0.5 rounded">$&</span>`);
      }
    });
    return r;
  }, [highlightedAyahs]);

  // ── Loading ──
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 flex items-center justify-center">
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
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-gray-200">
        <div className="w-full px-3 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2 mb-2">
            <Button variant="outline" size="sm" onClick={onBack} className="text-xs sm:text-sm">←</Button>
            <div className="text-center flex-1 min-w-0">
              <h1 className="text-sm sm:text-2xl font-bold text-gray-900 truncate">{surahName}</h1>
              <p className="text-xs text-gray-500">Surah {surahNumber}</p>
            </div>
            <div className="flex items-center gap-1.5 min-w-[60px] justify-end">
              {isListening && <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />}
            </div>
          </div>

          {/* Mode toggle */}
          <div className="flex items-center justify-center gap-1.5">
            <button
              onClick={() => { if (!isListening) setRecogMode("whisper"); }}
              disabled={isListening}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold transition-all ${
                recogMode === "whisper"
                  ? "bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-sm"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <Sparkles className="h-3 w-3" />
              Server Whisper
            </button>
            <button
              onClick={() => { if (!isListening) setRecogMode("browser"); }}
              disabled={isListening}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold transition-all ${
                recogMode === "browser"
                  ? "bg-gradient-to-r from-sky-600 to-sky-500 text-white shadow-sm"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <Waveform className="h-3 w-3" />
              Browser STT
            </button>
            {recogMode === "whisper" && (
              <span className={`text-[10px] ${isConnected ? "text-emerald-600" : "text-amber-500"}`}>
                {isConnected ? "●" : "○"}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="w-full px-3 sm:px-6 py-4 sm:py-8 pb-36 sm:pb-40">
        {error && (
          <div className="mb-4 p-3 sm:p-4 bg-red-50 border-2 border-red-200 rounded-xl text-xs sm:text-sm">
            <p className="text-red-700 font-semibold">{error}</p>
          </div>
        )}

        {/* Quran Text */}
        <div className="card-mushaf p-4 sm:p-8 md:p-12 mb-6">
          {surahNumber !== 9 && (
            <div className="text-center mb-4 sm:mb-6 pb-4 sm:pb-6 border-b-2 border-amber-200/60">
              <p className="text-xl sm:text-3xl md:text-4xl font-semibold text-emerald-800 leading-relaxed bismillah">
                بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
              </p>
            </div>
          )}
          <div className="text-center leading-relaxed" dir="rtl">
            <p className="text-base sm:text-2xl md:text-3xl font-semibold text-gray-900 quran-page inline">
              {displayAyahs.map((ayah, i) => (
                <span key={ayah.number}>
                  <span dangerouslySetInnerHTML={{ __html: getHighlighted(ayah.text, ayah.number) }} />
                  <span className="ayah-marker">{ayah.number}</span>
                  {i < displayAyahs.length - 1 && " "}
                </span>
              ))}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col items-center gap-4">
          <button
            onClick={isListening ? stopListening : startListening}
            className={`relative w-20 h-20 sm:w-28 sm:h-28 rounded-full flex items-center justify-center transition-all transform hover:scale-110 active:scale-95 font-medium shadow-xl ${
              isListening
                ? "bg-red-500 hover:bg-red-600 text-white recording-pulse"
                : "bg-emerald-600 hover:bg-emerald-700 text-white"
            }`}
          >
            {isListening ? <MicOff className="h-8 w-8 sm:h-12 sm:w-12" /> : <Mic className="h-8 w-8 sm:h-12 sm:w-12" />}
          </button>

          <div className="text-center">
            {isListening ? (
              <p className="text-sm sm:text-lg font-semibold text-emerald-700 flex items-center gap-2">
                <Loader className="h-4 w-4 animate-spin" /> Recording...
                {recogMode === "whisper" && (
                  <span className="text-xs text-amber-600 font-normal">(streaming to server)</span>
                )}
              </p>
            ) : transcript ? (
              <p className="text-sm sm:text-lg font-semibold text-emerald-700">✅ Complete</p>
            ) : (
              <p className="text-sm sm:text-lg font-semibold text-gray-500">
                {recogMode === "whisper" ? "Tap mic to start (Whisper)" : "Tap mic to start"}
              </p>
            )}
          </div>

          {/* Live transcript */}
          {transcript && (
            <div className="w-full max-w-2xl p-4 sm:p-6 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-200">
              <h3 className="font-bold text-xs sm:text-base text-blue-900 mb-2">📝 Your Voice:</h3>
              <p className="text-xs sm:text-base text-gray-900 leading-relaxed mb-3 line-clamp-3 sm:line-clamp-none" dir="rtl">
                {transcript}
              </p>
              <Button onClick={handleAnalyze} disabled={isAnalyzing} className="w-full text-xs sm:text-sm py-2">
                {isAnalyzing ? "Analyzing..." : "📋 Review Recitation"}
              </Button>
            </div>
          )}
        </div>
      </main>

      {/* Review Dialog */}
      <Dialog open={showReview} onOpenChange={setShowReview}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogTitle className="sr-only">Recitation Review</DialogTitle>
          <div className="space-y-6">
            {analysisResults && (
              <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 border-2 border-emerald-300 rounded-xl p-6 sm:p-8 text-center">
                <p className="text-5xl sm:text-6xl font-bold text-emerald-700 mb-2 score-pop">
                  {analysisResults.score != null ? analysisResults.score : (analysisResults.accuracy * 100).toFixed(0)}
                </p>
                <p className="text-base sm:text-lg font-semibold text-emerald-900">Overall Score</p>
                <p className="text-sm text-emerald-600">Accuracy {(analysisResults.accuracy * 100).toFixed(1)}%</p>
              </div>
            )}

            {analysisResults?.feedback && (
              <div className="bg-sky-50 border-2 border-sky-200 rounded-xl p-4 text-sm text-sky-900">
                {analysisResults.feedback}
              </div>
            )}

            <div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3">You Said:</h3>
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                <p className="text-gray-900 leading-relaxed" dir="rtl">{analysisResults?.transcript || transcript}</p>
              </div>
            </div>

            <div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3">Expected:</h3>
              <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4">
                <p className="text-xl sm:text-2xl font-semibold text-gray-900 leading-relaxed quran-page" dir="rtl">
                  {displayAyahs.map((a) => a.text).join(" ")}
                </p>
              </div>
            </div>

            {analysisResults?.tajweed_rules && analysisResults.tajweed_rules.length > 0 && (
              <div>
                <h3 className="text-base sm:text-lg font-bold text-emerald-800 mb-3">Tajweed Rules</h3>
                <div className="space-y-1.5">
                  {analysisResults.tajweed_rules.map((rule, idx) => {
                    const good = rule.status === "applied_correctly";
                    const bad = rule.status === "applied_incorrectly" || rule.status === "not_applied";
                    return (
                      <div key={idx} className={`flex items-center gap-2 p-2.5 rounded-xl text-sm ${good ? "bg-emerald-50 text-emerald-800" : bad ? "bg-red-50 text-red-800" : "bg-gray-50 text-gray-500"}`}>
                        <span>{good ? "✅" : bad ? "⚠️" : "○"}</span>
                        <span className="font-medium">{rule.rule}</span>
                        <span className="text-xs text-gray-500">{rule.description}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {analysisResults?.errors && analysisResults.errors.length > 0 ? (
              <div>
                <h3 className="text-base sm:text-lg font-bold text-red-800 mb-4">
                  Issues ({analysisResults.error_count || analysisResults.errors.length})
                </h3>
                <div className="space-y-3">
                  {analysisResults.errors.map((error, idx) => (
                    <div
                      key={idx}
                      className={`${error.confidence_level === "low" ? "bg-amber-50 border-l-4 border-amber-400" : "bg-red-50 border-l-4 border-red-400"} p-3 sm:p-4 rounded-xl`}
                    >
                      <p className="font-semibold capitalize text-sm sm:text-base">
                        {error.type}
                        {error.confidence_level === "low" && (
                          <span className="ml-2 text-xs font-normal text-amber-600">(low confidence)</span>
                        )}
                      </p>
                      <p className="text-xs sm:text-sm mt-1">
                        <span className="font-medium">Expected:</span>{" "}
                        <span dir="rtl">{error.expected}</span>
                      </p>
                      <p className="text-xs sm:text-sm">
                        <span className="font-medium">You said:</span>{" "}
                        <span dir="rtl">{error.received || error.actual}</span>
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              analysisResults && (
                <div className="bg-emerald-50 border-2 border-emerald-300 rounded-xl p-8 text-center">
                  <p className="text-4xl mb-3">✅</p>
                  <p className="text-xl font-semibold text-emerald-900">Masha'Allah! Perfect Recitation!</p>
                  <p className="text-emerald-700 mt-2">No errors found</p>
                </div>
              )
            )}

            {analysisResults?.corrections && analysisResults.corrections.length > 0 && (
              <div>
                <h3 className="text-base sm:text-lg font-bold text-amber-800 mb-3">Suggestions</h3>
                <ul className="space-y-2">
                  {analysisResults.corrections.map((c, idx) => (
                    <li key={idx} className="flex gap-2 text-sm text-gray-700">
                      <span className="text-emerald-500">•</span> {c}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button variant="secondary" onClick={() => {
                setShowReview(false);
                setAnalysisResults(null);
                accumulatedTranscriptRef.current = "";
                setTranscript("");
                setHighlightedAyahs({});
              }} className="flex-1">
                🔄 Try Again
              </Button>
              <Button variant="outline" onClick={onBack} className="flex-1">
                ← Back
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}