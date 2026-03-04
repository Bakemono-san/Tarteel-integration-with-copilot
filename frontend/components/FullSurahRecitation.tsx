"use client";

import { useEffect, useState, useRef } from "react";
import { ArrowLeft, X, Mic, MicOff } from "lucide-react";

interface Props {
  surahNumber: number;
  onBack: () => void;
}
interface Ayah {
  number: number;
  text: string;
}

export default function FullSurahRecitation({ surahNumber, onBack }: Props) {
  useEffect(() => {
    console.log("[FullSurahRecitation] mounted — new code loaded ✅");
  }, []);
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [surahName, setSurahName] = useState("");
  const [displayAyahs, setDisplayAyahs] = useState<Ayah[]>([]);
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
      r.onstart = () => setIsListening(true);
      r.onresult = (e: any) => {
        let f = "",
          i = "";
        for (let x = e.resultIndex; x < e.results.length; x++) {
          const t = e.results[x][0].transcript;
          e.results[x].isFinal ? (f += t + " ") : (i += t);
        }
        setTranscript(f + i);
      };
      r.onerror = (e: any) => {
        if (e.error !== "aborted" && e.error !== "no-speech")
          console.error(e.error);
      };
      r.onend = () => setIsListening(false);
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
        setDisplayAyahs(a.slice(0, 10));
      } catch {
        setError("Failed to load surah.");
      } finally {
        setIsLoading(false);
      }
    })();
  }, [surahNumber]);

  /* ── Analyse recitation ────────────────────────── */
  const handleAnalyze = async () => {
    console.log("[handleAnalyze] called, transcript:", transcript.slice(0, 60));
    if (!transcript.trim()) {
      setError("Please recite first.");
      return;
    }
    setIsAnalyzing(true);
    try {
      const expected = displayAyahs
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
          ayahs: displayAyahs,
        }),
      });
      const data = await res.json();
      console.log(
        "[analyze-recitation] response:",
        JSON.stringify(data, null, 2),
      );
      setAnalysisResults(data);
      if (data.errors?.length) {
        const m: Record<number, any> = {};
        data.errors.forEach((e: any) => {
          const n = e.ayah_number || displayAyahs[0]?.number;
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
      try {
        recognitionRef.current.start();
      } catch {}
    }
  };
  const stop = () => {
    if (recognitionRef.current)
      try {
        recognitionRef.current.stop();
      } catch {}
  };

  const highlight = (text: string, num: number) => {
    if (!highlightedAyahs[num]?.length) return text;
    let r = text;
    highlightedAyahs[num].forEach((e: any) => {
      if (e.expected) {
        const esc = e.expected.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        r = r.replace(
          new RegExp(`\\b${esc}\\b`, "g"),
          `<span class="rounded bg-red-500/90 px-1 text-white font-bold">$&</span>`,
        );
      }
    });
    return r;
  };

  /* ── Loading state ─────────────────────────────── */
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />
      </div>
    );
  }

  /* ── Main render ───────────────────────────────── */
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-gray-200/60 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-2 px-3 py-2.5 sm:px-4 sm:py-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm text-gray-600 transition hover:bg-gray-100"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back</span>
          </button>
          <div className="text-center min-w-0">
            <h1 className="truncate text-sm font-bold sm:text-lg">
              {surahName}
            </h1>
            <p className="text-xs text-gray-500">Surah {surahNumber}</p>
          </div>
          <div className="w-12 sm:w-16 flex justify-end">
            {isListening && (
              <span className="flex items-center gap-1 text-xs font-medium text-red-600">
                <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />{" "}
                REC
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Body */}
      <main className="flex-1 mx-auto w-full max-w-4xl px-3 pt-4 pb-44 sm:px-6 sm:pt-8">
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {/* ── Quran text ────────────────────────────── */}
        <div className="rounded-2xl border-2 border-amber-200/80 bg-gradient-to-b from-amber-50/80 to-white p-4 shadow-lg sm:p-8 lg:p-10">
          {surahNumber !== 9 && (
            <p
              className="mb-4 border-b border-amber-200 pb-4 text-center text-xl font-semibold text-emerald-800 sm:mb-6 sm:pb-6 sm:text-3xl"
              dir="rtl"
            >
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </p>
          )}

          <div className="quran-page" dir="rtl">
            {displayAyahs.map((ayah, i) => (
              <span key={ayah.number}>
                <span
                  dangerouslySetInnerHTML={{
                    __html: highlight(ayah.text, ayah.number),
                  }}
                />
                <span className="mx-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-800 align-middle sm:mx-1.5 sm:h-6 sm:w-6 sm:text-xs">
                  {ayah.number}
                </span>
                {i < displayAyahs.length - 1 && " "}
              </span>
            ))}
          </div>
        </div>

        {/* ── Controls ──────────────────────────────── */}
        <div className="mt-8 flex flex-col items-center gap-4 sm:gap-5">
          <button
            onClick={isListening ? stop : start}
            className={`flex h-20 w-20 items-center justify-center rounded-full shadow-xl transition-all active:scale-95 sm:h-28 sm:w-28 ${
              isListening
                ? "bg-red-500 text-white recording-pulse"
                : "bg-emerald-600 text-white hover:bg-emerald-700"
            }`}
          >
            {isListening ? (
              <MicOff className="h-9 w-9 sm:h-12 sm:w-12" />
            ) : (
              <Mic className="h-9 w-9 sm:h-12 sm:w-12" />
            )}
          </button>

          <p className="text-xs font-medium text-gray-500 sm:text-sm">
            {isListening
              ? "🎤 Listening… tap to stop"
              : transcript
                ? "✅ Done — review below"
                : "Tap mic to recite"}
          </p>

          {transcript && (
            <div className="w-full max-w-lg rounded-xl border border-sky-200 bg-sky-50 p-4 sm:p-5">
              <p className="mb-1 text-xs font-semibold text-sky-800">
                Your recitation
              </p>
              <p
                className="mb-4 text-sm leading-relaxed text-gray-800 line-clamp-4 sm:line-clamp-none"
                dir="rtl"
              >
                {transcript}
              </p>
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="w-full rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
              >
                {isAnalyzing ? "Analysing…" : "📋 See Review"}
              </button>
            </div>
          )}
        </div>
      </main>

      {/* ── Review drawer ───────────────────────────── */}
      {showReview && analysisResults && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
            onClick={() => setShowReview(false)}
          />
          <aside className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-white shadow-2xl sm:max-w-lg">
            {/* drawer header */}
            <div className="flex items-center justify-between border-b px-4 py-3 sm:px-6">
              <h2 className="text-lg font-bold">Review</h2>
              <button
                onClick={() => setShowReview(false)}
                className="rounded-lg p-1.5 transition hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* drawer body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5 sm:p-6">
              {/* score */}
              <div className="rounded-xl bg-emerald-50 p-5 text-center">
                <p className="text-5xl font-extrabold text-emerald-600 score-pop">
                  {(analysisResults.accuracy * 100).toFixed(0)}%
                </p>
                <p className="mt-1 text-sm font-medium text-emerald-800">
                  Accuracy
                </p>
              </div>

              {/* you said */}
              <div>
                <p className="mb-1.5 text-xs font-semibold text-gray-500">
                  You said
                </p>
                <div
                  className="rounded-lg border border-sky-200 bg-sky-50 p-3 text-sm"
                  dir="rtl"
                >
                  {transcript}
                </div>
              </div>

              {/* expected */}
              <div>
                <p className="mb-1.5 text-xs font-semibold text-gray-500">
                  Expected
                </p>
                <div
                  className="quran-page rounded-lg border border-amber-200 bg-amber-50 p-3 !text-base !leading-relaxed"
                  dir="rtl"
                >
                  {displayAyahs.map((a) => a.text).join(" ")}
                </div>
              </div>

              {/* errors */}
              {analysisResults.errors?.length > 0 ? (
                <div>
                  <p className="mb-2 text-xs font-semibold text-red-700">
                    Issues ({analysisResults.errors.length})
                  </p>
                  <div className="space-y-2">
                    {analysisResults.errors.map((e: any, i: number) => (
                      <div
                        key={i}
                        className="rounded-lg border-l-4 border-red-400 bg-red-50 p-3 text-sm"
                      >
                        <p className="font-semibold capitalize text-red-900">
                          {e.type}
                        </p>
                        {e.expected && (
                          <p className="text-red-800">
                            <span className="font-medium">Expected:</span>{" "}
                            {e.expected}
                          </p>
                        )}
                        {e.actual && (
                          <p className="text-red-800">
                            <span className="font-medium">You said:</span>{" "}
                            {e.actual}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="rounded-lg bg-emerald-50 p-5 text-center">
                  <p className="text-3xl">✅</p>
                  <p className="mt-1 font-semibold text-emerald-800">
                    Perfect recitation!
                  </p>
                </div>
              )}
            </div>

            {/* drawer footer */}
            <div className="flex gap-2 border-t p-4 sm:p-6">
              <button
                onClick={() => {
                  setShowReview(false);
                  setAnalysisResults(null);
                  setTranscript("");
                  setHighlightedAyahs({});
                }}
                className="flex-1 rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                Try Again
              </button>
              <button
                onClick={onBack}
                className="flex-1 rounded-lg bg-gray-100 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-200"
              >
                Back
              </button>
            </div>
          </aside>
        </>
      )}
    </div>
  );
}
