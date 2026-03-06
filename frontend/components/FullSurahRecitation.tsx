"use client";

import { useEffect, useState, useRef } from "react";
import { ArrowLeft, X, Mic, MicOff, AlertCircle } from "lucide-react";

interface Props {
  surahNumber: number;
  onBack: () => void;
}
interface Ayah {
  number: number;
  text: string;
}

export default function FullSurahRecitation({ surahNumber, onBack }: Props) {
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [surahName, setSurahName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [highlightedAyahs, setHighlightedAyahs] = useState<Record<number, any>>(
    {},
  );

  const recognitionRef = useRef<any>(null);
  const accumulatedTranscript = useRef<string>("");
  const isManualStop = useRef<boolean>(false);

  /* ── Speech recognition ────────────────────────── */
  useEffect(() => {
    const SR =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SR) {
      setError("Speech recognition not supported. Use Chrome or Edge.");
      return;
    }
    try {
      const r = new SR();
      r.continuous = true;
      r.interimResults = true;
      r.lang = "ar-SA";
      r.maxAlternatives = 1;

      r.onstart = () => {
        setIsListening(true);
      };

      r.onresult = (e: any) => {
        let finalText = "";
        let interimText = "";

        for (let x = e.resultIndex; x < e.results.length; x++) {
          const t = e.results[x][0].transcript;
          if (e.results[x].isFinal) {
            finalText += t + " ";
            accumulatedTranscript.current += t + " ";
          } else {
            interimText += t;
          }
        }

        const fullTranscript = accumulatedTranscript.current + interimText;
        setTranscript(fullTranscript);
      };

      r.onerror = (e: any) => {
        if (e.error !== "aborted" && e.error !== "no-speech") {
          console.error(e.error);
        }
      };

      r.onend = () => {
        if (!isManualStop.current && recognitionRef.current) {
          setTimeout(() => {
            try {
              recognitionRef.current.start();
            } catch (err) {
              setIsListening(false);
            }
          }, 100);
        } else {
          setIsListening(false);
        }
      };

      recognitionRef.current = r;
    } catch {
      setError("Could not initialise speech recognition.");
    }
  }, []);

  /* ── Fetch surah ───────────────────────────────── */
  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/quran/surah/${surahNumber}`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        setSurahName(data.surah?.englishName || "");
        const a: Ayah[] = (data.ayahs || []).map((x: any) => ({
          number: x.number,
          text: x.text,
        }));
        setAyahs(a);
      } catch {
        setError("Failed to load surah.");
      } finally {
        setIsLoading(false);
      }
    })();
  }, [surahNumber]);

  /* ── Analyse recitation ────────────────────────── */
  const handleAnalyze = async () => {
    if (!transcript.trim()) {
      setError("Please recite first.");
      return;
    }
    setIsAnalyzing(true);
    try {
      const expected = ayahs
        .map((a) => a.text)
        .join(" ")
        .replace(/\s+/g, " ");
      const res = await fetch("/api/quran/analyze-recitation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript,
          expected_text: expected,
          surah_number: surahNumber,
          ayahs: ayahs,
        }),
      });
      const data = await res.json();
      console.log("[analyze-recitation] response:", data);

      setAnalysisResults(data);
      if (data.errors?.length) {
        const m: Record<number, any> = {};
        data.errors.forEach((e: any) => {
          const n = e.ayah_number || ayahs[0]?.number;
          (m[n] ??= []).push(e);
        });
        setHighlightedAyahs(m);
      } else setHighlightedAyahs({});
      setShowReview(true);
    } catch {
      setError("Analysis failed.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const start = () => {
    if (recognitionRef.current) {
      setTranscript("");
      accumulatedTranscript.current = "";
      isManualStop.current = false;

      try {
        recognitionRef.current.start();
      } catch (err) {
        console.log("Start error:", err);
      }
    }
  };

  const stop = () => {
    if (recognitionRef.current) {
      isManualStop.current = true;
      try {
        recognitionRef.current.stop();
      } catch (err) {
        console.log("Stop error:", err);
      }
    }
  };

  const normalizeArabic = (str: string) =>
    str
      .replace(
        /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7\u06E8\u06EA-\u06ED]/g,
        "",
      )
      .replace(/[\u0622\u0623\u0625\u0671]/g, "\u0627")
      .replace(/\u0629/g, "\u0647")
      .replace(/\u0624/g, "\u0648")
      .replace(/\u0626/g, "\u064A")
      .replace(/\u0649/g, "\u064A")
      .replace(/\u0640/g, "")
      .replace(/[\uFEFF\u200B\u200C\u200D\u00AD]/g, "")
      .replace(/\s+/g, " ")
      .trim();

  const highlightTranscript = (): string => {
    if (!analysisResults) return transcript;
    const errors: any[] = analysisResults.errors ?? [];
    const wrongSet = new Set(
      errors
        .filter(
          (e) =>
            (e.type === "substitution" || e.type === "insertion") && e.actual,
        )
        .map((e) => normalizeArabic(e.actual)),
    );
    const raw: string = analysisResults.transcript || transcript;
    return raw
      .trim()
      .split(/\s+/)
      .map((w) =>
        wrongSet.has(normalizeArabic(w))
          ? `<span style="background:rgba(239,68,68,0.9);color:#fff;font-weight:700;border-radius:3px;padding:0 3px;">${w}</span>`
          : w,
      )
      .join(" ");
  };

  const highlightExpected = (): string => {
    if (!analysisResults) return ayahs.map((a) => a.text).join(" ");
    const errors: any[] = analysisResults.errors ?? [];
    const omitSet = new Set(
      errors
        .filter(
          (e) =>
            (e.type === "omission" || e.type === "substitution") && e.expected,
        )
        .map((e) => normalizeArabic(e.expected)),
    );
    const raw: string =
      analysisResults.expected || ayahs.map((a) => a.text).join(" ");
    return raw
      .trim()
      .split(/\s+/)
      .map((w) =>
        omitSet.has(normalizeArabic(w))
          ? `<span style="text-decoration:underline;text-decoration-color:#f59e0b;text-decoration-thickness:2px;text-underline-offset:4px;color:#b45309;font-weight:700;">${w}</span>`
          : w,
      )
      .join(" ");
  };

  const highlight = (text: string, num: number) => {
    if (!highlightedAyahs[num]?.length) return text;
    let r = text;
    highlightedAyahs[num].forEach((e: any) => {
      if (e.expected) {
        const esc = e.expected.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        r = r.replace(
          new RegExp(`\\b${esc}\\b`, "g"),
          `<span style="background:rgba(239,68,68,0.9);color:#fff;font-weight:700;border-radius:3px;padding:0 4px;">$&</span>`,
        );
      }
    });
    return r;
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 to-sky-50">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />
          <p className="mt-4 text-sm font-medium text-gray-600">
            Loading Surah...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-emerald-50/30 to-sky-50/30">
      <header className="sticky top-0 z-30 border-b border-gray-200/60 bg-white/95 backdrop-blur-md shadow-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-all hover:bg-gray-100 hover:text-gray-900 active:scale-95"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back</span>
          </button>
          <div className="text-center min-w-0 flex-1">
            <h1 className="truncate text-base font-bold text-gray-900 sm:text-xl">
              {surahName}
            </h1>
            <p className="text-xs text-gray-500 sm:text-sm">
              Surah {surahNumber}
            </p>
          </div>
          <div className="w-16 sm:w-20 flex justify-end">
            {isListening && (
              <span className="flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600">
                <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
                REC
              </span>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 mx-auto w-full max-w-4xl px-4 pt-6 pb-36 sm:px-6 sm:pt-8 md:pb-32">
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 shadow-sm animate-in slide-in-from-top-2">
            <AlertCircle className="h-5 w-5 shrink-0 text-red-600 mt-0.5" />
            <p className="text-sm font-medium text-red-700 leading-relaxed">
              {error}
            </p>
          </div>
        )}

        <div className="relative rounded-3xl border-2 border-amber-200/80 bg-gradient-to-br from-amber-50 via-white to-amber-50/40 p-5 shadow-xl sm:p-8 lg:p-12 transition-all hover:shadow-2xl">
          <div className="absolute top-0 left-0 h-20 w-20 border-l-2 border-t-2 border-emerald-200 rounded-tl-3xl opacity-30" />
          <div className="absolute bottom-0 right-0 h-20 w-20 border-r-2 border-b-2 border-emerald-200 rounded-br-3xl opacity-30" />

          {surahNumber !== 9 && (
            <div className="mb-6 sm:mb-8">
              <p
                className="border-b-2 border-amber-200/60 pb-5 text-center text-2xl font-bold text-emerald-800 sm:pb-6 sm:text-4xl leading-relaxed"
                dir="rtl"
              >
                بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
              </p>
            </div>
          )}

          <div className="quran-page relative" dir="rtl">
            {ayahs.map((ayah, i) => (
              <span key={ayah.number}>
                <span
                  dangerouslySetInnerHTML={{
                    __html: highlight(ayah.text, ayah.number),
                  }}
                />
                <span className="mx-1.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-emerald-100 to-emerald-50 text-xs font-bold text-emerald-800 align-middle ring-1 ring-emerald-200/50 sm:mx-2 sm:h-7 sm:w-7 transition-transform hover:scale-110">
                  {ayah.number}
                </span>
                {i < ayahs.length - 1 && " "}
              </span>
            ))}
          </div>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-gray-200/60 bg-white/98 backdrop-blur-xl shadow-[0_-8px_32px_rgba(0,0,0,0.08)]">
        <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6 sm:py-5">
          {transcript && !showReview && (
            <div className="mb-3 rounded-xl border border-sky-200/80 bg-gradient-to-br from-sky-50 to-sky-100/50 px-4 py-2.5 shadow-sm animate-in slide-in-from-bottom-2">
              <div className="flex items-start gap-2">
                <span className="text-xs font-semibold text-sky-700 shrink-0">
                  📝
                </span>
                <p
                  className="text-xs leading-relaxed text-gray-700 line-clamp-2 flex-1"
                  dir="rtl"
                >
                  {transcript}
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-center gap-5 sm:gap-8">
            <button
              onClick={isListening ? stop : start}
              className={`relative flex h-16 w-16 shrink-0 items-center justify-center rounded-full shadow-xl transition-all active:scale-95 sm:h-20 sm:w-20 ${
                isListening
                  ? "bg-gradient-to-br from-red-500 to-red-600 text-white recording-pulse ring-4 ring-red-200"
                  : "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 hover:shadow-2xl"
              }`}
            >
              {isListening ? (
                <MicOff className="h-7 w-7 sm:h-9 sm:w-9 drop-shadow-sm" />
              ) : (
                <Mic className="h-7 w-7 sm:h-9 sm:w-9 drop-shadow-sm" />
              )}
            </button>

            <div className="flex flex-col gap-2.5 min-w-0 flex-1 max-w-xs">
              <p className="text-xs font-semibold text-gray-700 sm:text-sm leading-tight">
                {isListening
                  ? "🎤 Recording..."
                  : transcript
                    ? "✅ Recording complete"
                    : "🎙️ Tap mic to start"}
              </p>
              {transcript && !isListening && (
                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  className="rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-5 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:shadow-lg hover:from-emerald-700 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                >
                  {isAnalyzing ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Analysing…
                    </span>
                  ) : (
                    "📋 See Review"
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {showReview && analysisResults && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity animate-in fade-in"
            onClick={() => setShowReview(false)}
          />
          <aside className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-white shadow-2xl sm:max-w-lg animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-sky-50 px-5 py-4 sm:px-6">
              <h2 className="text-xl font-bold text-gray-900">📊 Review</h2>
              <button
                onClick={() => setShowReview(false)}
                className="rounded-lg p-2 transition-all hover:bg-white/80 hover:shadow-sm active:scale-95"
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-6 sm:p-6">
              <div className="rounded-2xl bg-gradient-to-br from-emerald-100 via-emerald-50 to-white p-6 text-center shadow-lg border-2 border-emerald-200/50">
                <div className="mb-2 inline-flex items-center justify-center h-12 w-12 rounded-full bg-emerald-200/50">
                  <span className="text-2xl">🎯</span>
                </div>
                <p className="text-6xl font-black text-emerald-600 score-pop tracking-tight">
                  {(analysisResults.accuracy * 100).toFixed(0)}%
                </p>
                <p className="mt-2 text-sm font-bold text-emerald-800 uppercase tracking-wide">
                  Accuracy Score
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">💬</span>
                  <p className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                    You said
                  </p>
                </div>
                <div
                  className="rounded-xl border-2 border-sky-200/80 bg-gradient-to-br from-sky-50 to-white p-4 text-base leading-loose shadow-sm"
                  dir="rtl"
                  dangerouslySetInnerHTML={{ __html: highlightTranscript() }}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">📖</span>
                  <p className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                    Expected
                  </p>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-amber-100/50 px-3 py-2 text-xs font-medium text-amber-800">
                  <span className="inline-block h-3 w-6 rounded-sm border-b-2 border-amber-500 bg-amber-200/80" />
                  <span>Underlined = omitted or mispronounced</span>
                </div>
                <div
                  className="quran-page rounded-xl border-2 border-amber-200/80 bg-gradient-to-br from-amber-50 to-white p-4 !text-base !leading-loose shadow-sm"
                  dir="rtl"
                  dangerouslySetInnerHTML={{ __html: highlightExpected() }}
                />
              </div>

              {analysisResults.errors?.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">⚠️</span>
                    <p className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                      Issues ({analysisResults.errors.length})
                    </p>
                  </div>
                  <div className="space-y-2.5">
                    {analysisResults.errors.map((e: any, i: number) => (
                      <div
                        key={i}
                        className="rounded-xl border-l-4 border-red-400 bg-gradient-to-r from-red-50 to-white p-4 shadow-sm"
                      >
                        <p className="mb-2 inline-flex items-center gap-1.5 rounded-md bg-red-100 px-2 py-1 text-xs font-bold uppercase text-red-900">
                          <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                          {e.type}
                        </p>
                        {e.expected && (
                          <p className="mb-1 text-sm text-red-900">
                            <span className="font-bold">Expected:</span>{" "}
                            <span className="font-semibold" dir="rtl">
                              {e.expected}
                            </span>
                          </p>
                        )}
                        {e.actual && (
                          <p className="text-sm text-red-900">
                            <span className="font-bold">You said:</span>{" "}
                            <span className="font-semibold" dir="rtl">
                              {e.actual}
                            </span>
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-50 p-8 text-center shadow-lg border-2 border-emerald-200/50">
                  <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-200/50">
                    <span className="text-4xl">✅</span>
                  </div>
                  <p className="text-xl font-bold text-emerald-900">
                    Perfect recitation!
                  </p>
                  <p className="mt-1 text-sm text-emerald-700">
                    No errors detected. Keep up the excellent work!
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3 border-t border-gray-200 bg-gray-50/80 p-5 sm:p-6">
              <button
                onClick={() => {
                  setShowReview(false);
                  setAnalysisResults(null);
                  setTranscript("");
                  setHighlightedAyahs({});
                  accumulatedTranscript.current = "";
                  isManualStop.current = false;
                }}
                className="flex-1 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 py-3 text-sm font-bold text-white shadow-md transition-all hover:shadow-lg hover:from-emerald-700 hover:to-emerald-600 active:scale-95"
              >
                🔄 Try Again
              </button>
              <button
                onClick={onBack}
                className="flex-1 rounded-xl bg-white border-2 border-gray-200 py-3 text-sm font-bold text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:border-gray-300 hover:shadow-md active:scale-95"
              >
                ← Back
              </button>
            </div>
          </aside>
        </>
      )}
    </div>
  );
}
