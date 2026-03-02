"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { X, Mic, MicOff, Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface Ayah {
  number: number;
  text: string;
}

interface AnalysisResult {
  accuracy: number;
  transcript: string;
  expected: string;
  errors: Array<{
    type: string;
    expected: string;
    actual: string;
  }>;
  error_count: number;
}

interface FullSurahRecitationProps {
  surahNumber: number;
  onBack: () => void;
}

export default function FullSurahRecitation({
  surahNumber,
  onBack,
}: FullSurahRecitationProps) {
  // State Management
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [surahName, setSurahName] = useState("");
  const [displayAyahs, setDisplayAyahs] = useState<Ayah[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [isListening, setIsListening] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult | null>(
    null,
  );
  const [highlightedAyahs, setHighlightedAyahs] = useState<
    Record<number, any[]>
  >({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Refs
  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError(
        "Speech recognition not supported. Use Chrome, Firefox, or Edge.",
      );
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "ar-SA";

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptPart = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcriptPart + " ";
          } else {
            interimTranscript += transcriptPart;
          }
        }

        setTranscript(finalTranscript + interimTranscript);
      };

      recognition.onerror = (event: any) => {
        if (event.error !== "aborted" && event.error !== "no-speech") {
          console.error("Speech error:", event.error);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } catch (error) {
      console.error("Error initializing speech recognition:", error);
      setError("Could not initialize speech recognition.");
    }
  }, []);

  // Fetch Surah Data
  useEffect(() => {
    const fetchSurah = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(
          `https://185.245.183.209:8081/api/quran/surah/${surahNumber}`,
        );
        if (!res.ok) throw new Error("Failed to fetch surah");

        const data = await res.json();
        setSurahName(data.surah?.englishName || "");

        const ayahsData = (data.ayahs || []).map((ayah: any) => ({
          number: ayah.number,
          text: ayah.text,
        }));

        setAyahs(ayahsData);
        setDisplayAyahs(ayahsData.slice(0, 10));
      } catch (err) {
        console.error("Failed to load surah:", err);
        setError("Failed to load surah.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSurah();
  }, [surahNumber]);

  // Analyze Recitation
  const handleAnalyzeRecitation = useCallback(async () => {
    if (!transcript.trim()) {
      setError("Please recite first before reviewing.");
      return;
    }

    setIsAnalyzing(true);
    try {
      const expectedText = displayAyahs
        .map((ayah) => ayah.text)
        .join(" ")
        .replace(/\s+/g, " ");

      const response = await fetch(
        "http://185.245.183.209:8081/api/quran/analyze-recitation",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            transcript: transcript,
            expected_text: expectedText,
            surah_number: surahNumber,
            ayahs: displayAyahs,
          }),
        },
      );

      const data = await response.json();
      setAnalysisResults(data);

      if (data.errors && data.errors.length > 0) {
        const errorsByAyah: Record<number, any[]> = {};
        data.errors.forEach((error: any) => {
          const ayahNum = error.ayah_number || displayAyahs[0]?.number;
          if (!errorsByAyah[ayahNum]) {
            errorsByAyah[ayahNum] = [];
          }
          errorsByAyah[ayahNum].push(error);
        });
        setHighlightedAyahs(errorsByAyah);
      } else {
        setHighlightedAyahs({});
      }

      setShowReview(true);
    } catch (err) {
      console.error("Analysis error:", err);
      setError("Failed to analyze. Try again.");
    } finally {
      setIsAnalyzing(false);
    }
  }, [transcript, displayAyahs, surahNumber]);

  // Speech Recognition Controls
  const startListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        setTranscript("");
        recognitionRef.current.start();
      } catch (err) {
        console.error("Error starting:", err);
      }
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        console.error("Error stopping:", err);
      }
    }
  }, []);

  // Highlight Text with Errors
  const getHighlightedText = useCallback(
    (ayahText: string, ayahNumber: number) => {
      if (
        !highlightedAyahs ||
        !highlightedAyahs[ayahNumber] ||
        highlightedAyahs[ayahNumber].length === 0
      ) {
        return ayahText;
      }

      let result = ayahText;
      const errors = highlightedAyahs[ayahNumber];

      errors.forEach((error: any) => {
        if (error.expected) {
          const escaped = error.expected.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
          const regex = new RegExp(`\\b${escaped}\\b`, "g");
          result = result.replace(
            regex,
            `<span style="background-color: #ff4444; color: white; padding: 2px 4px; border-radius: 3px; font-weight: bold;">$&</span>`,
          );
        }
      });

      return result;
    },
    [highlightedAyahs],
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-gray-200 border-t-emerald-600 animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Surah...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-gray-200">
        <div className="w-full px-2 sm:px-4 py-2 sm:py-4">
          <div className="flex items-center justify-between gap-1 sm:gap-4 mb-1.5 sm:mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={onBack}
              className="text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 h-7 sm:h-10"
            >
              ←
            </Button>
            <div className="text-center flex-1 min-w-0">
              <h1 className="text-sm sm:text-2xl font-bold text-gray-900 truncate">
                {surahName}
              </h1>
              <p className="text-xs text-gray-600">Surah {surahNumber}</p>
            </div>
            <div className="w-8 sm:w-20"></div>
          </div>

          {isListening && (
            <div className="flex items-center justify-center gap-1 sm:gap-2 text-emerald-700 font-semibold text-xs sm:text-sm">
              <div className="h-1.5 w-1.5 bg-red-500 rounded-full animate-pulse"></div>
              Listening...
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full px-2 sm:px-4 py-2 sm:py-8 pb-28 sm:pb-40">
        {error && (
          <div className="mb-2 sm:mb-8 p-2 sm:p-4 bg-red-50 border-2 border-red-200 rounded-lg sm:rounded-xl text-xs sm:text-sm">
            <p className="text-red-700 font-semibold">{error}</p>
          </div>
        )}

        {/* Quran Text Display */}
        <div className="bg-gradient-to-b from-yellow-50 to-white rounded-lg sm:rounded-2xl shadow-md sm:shadow-2xl p-3 sm:p-8 md:p-12 border-2 sm:border-4 border-yellow-200 mb-4 sm:mb-8">
          {/* Bismillah */}
          {surahNumber !== 9 && (
            <div className="text-center mb-2 sm:mb-8 pb-2 sm:pb-6 border-b-2 border-yellow-300">
              <p className="text-lg sm:text-3xl md:text-4xl font-semibold text-emerald-800 leading-relaxed">
                بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
              </p>
            </div>
          )}

          {/* Ayahs */}
          <div className="text-center leading-relaxed sm:leading-loose">
            <p className="text-sm sm:text-2xl md:text-3xl font-semibold text-gray-900 inline">
              {displayAyahs.map((ayah, index) => (
                <span key={ayah.number}>
                  <span
                    dangerouslySetInnerHTML={{
                      __html: getHighlightedText(ayah.text, ayah.number),
                    }}
                  />
                  <span className="mx-0.5 sm:mx-2">
                    <span className="inline-block w-5 h-5 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200 text-emerald-900 text-xs font-bold flex items-center justify-center text-center leading-none">
                      {ayah.number}
                    </span>
                  </span>
                  {index < displayAyahs.length - 1 && " "}
                </span>
              ))}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col items-center gap-3 sm:gap-6">
          {/* Microphone Button */}
          <button
            onClick={isListening ? stopListening : startListening}
            className={`w-20 h-20 sm:w-32 sm:h-32 rounded-full flex items-center justify-center transition-all transform hover:scale-110 active:scale-95 font-medium shadow-lg sm:shadow-2xl ${
              isListening
                ? "bg-red-500 hover:bg-red-600 text-white animate-pulse"
                : "bg-emerald-600 hover:bg-emerald-700 text-white"
            }`}
          >
            {isListening ? (
              <MicOff className="h-10 w-10 sm:h-16 sm:w-16" />
            ) : (
              <Mic className="h-10 w-10 sm:h-16 sm:w-16" />
            )}
          </button>

          {/* Status */}
          <div className="text-center">
            {isListening ? (
              <p className="text-xs sm:text-lg font-semibold text-emerald-700">
                🎤 Listening...
              </p>
            ) : transcript ? (
              <p className="text-xs sm:text-lg font-semibold text-emerald-700">
                ✅ Complete
              </p>
            ) : (
              <p className="text-xs sm:text-lg font-semibold text-gray-700">
                Click mic
              </p>
            )}
          </div>

          {/* Transcription Display */}
          {transcript && (
            <div className="mt-3 sm:mt-6 p-3 sm:p-6 rounded-lg sm:rounded-xl bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-300 w-full max-w-2xl">
              <h3 className="font-bold text-xs sm:text-lg text-blue-900 mb-2 sm:mb-3">
                📝 Your Voice:
              </h3>
              <p className="text-xs sm:text-base text-gray-900 leading-relaxed mb-3 sm:mb-6 line-clamp-3 sm:line-clamp-none">
                {transcript}
              </p>
              <Button
                onClick={handleAnalyzeRecitation}
                disabled={isAnalyzing}
                className="w-full text-xs sm:text-sm py-2 sm:py-3"
              >
                {isAnalyzing ? "Analyzing..." : "📋 Review"}
              </Button>
            </div>
          )}
        </div>
      </main>

      {/* Review Dialog */}
      <Dialog open={showReview} onOpenChange={setShowReview}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="space-y-6">
            {/* Accuracy Score */}
            {analysisResults && (
              <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 border-2 border-emerald-300 rounded-xl p-8">
                <div className="text-center">
                  <p className="text-6xl font-bold text-emerald-700 mb-2">
                    {(analysisResults.accuracy * 100).toFixed(0)}%
                  </p>
                  <p className="text-lg font-semibold text-emerald-900">
                    Accuracy Score
                  </p>
                </div>
              </div>
            )}

            {/* Transcription */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                You Said:
              </h3>
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                <p className="text-gray-900">{transcript}</p>
              </div>
            </div>

            {/* Expected Text */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                Expected:
              </h3>
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
                <p className="text-2xl font-semibold text-gray-900 leading-relaxed">
                  {displayAyahs.map((a) => a.text).join(" ")}
                </p>
              </div>
            </div>

            {/* Errors */}
            {analysisResults &&
            analysisResults.errors &&
            analysisResults.errors.length > 0 ? (
              <div>
                <h3 className="text-lg font-bold text-red-800 mb-4">
                  Issues ({analysisResults.errors.length}):
                </h3>
                <div className="space-y-3">
                  {analysisResults.errors.map((error: any, idx: number) => (
                    <div
                      key={idx}
                      className="bg-red-50 border-l-4 border-red-400 p-4 rounded"
                    >
                      <p className="font-semibold text-red-900 capitalize">
                        {error.type}
                      </p>
                      <p className="text-sm text-red-800 mt-2">
                        <span className="font-medium">Expected:</span>{" "}
                        {error.expected}
                      </p>
                      <p className="text-sm text-red-800">
                        <span className="font-medium">You said:</span>{" "}
                        {error.actual}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-emerald-50 border-2 border-emerald-300 rounded-lg p-8 text-center">
                <p className="text-4xl mb-3">✅</p>
                <p className="text-xl font-semibold text-emerald-900">
                  Perfect Recitation!
                </p>
                <p className="text-emerald-700 mt-2">No errors found</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowReview(false);
                  setAnalysisResults(null);
                  setTranscript("");
                  setHighlightedAyahs({});
                }}
                className="flex-1"
              >
                Try Again
              </Button>
              <Button variant="outline" onClick={onBack} className="flex-1">
                Back
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
