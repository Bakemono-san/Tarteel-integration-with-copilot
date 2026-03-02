"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, MicOff, Copy, Check } from "lucide-react";

interface Props {
  onTranscriptionComplete?: (text: string) => void;
  language?: string;
}

export default function SpeechToText({
  onTranscriptionComplete,
  language = "ar-SA",
}: Props) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [withTashkeel, setWithTashkeel] = useState("");
  const [detectedAyahs, setDetectedAyahs] = useState<any[]>([]);
  const [isCopied, setIsCopied] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const SR =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SR) {
      setIsSupported(false);
      return;
    }
    try {
      const r = new SR();
      r.continuous = true;
      r.interimResults = true;
      r.lang = language;
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
      r.onend = () => {
        setIsListening(false);
        if (transcript && onTranscriptionComplete)
          onTranscriptionComplete(transcript);
      };
      recognitionRef.current = r;
    } catch {
      setIsSupported(false);
    }
    return () => {
      try {
        recognitionRef.current?.stop();
      } catch {}
    };
  }, [language]);

  useEffect(() => {
    if (!transcript || isListening) return;
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => addTashkeel(transcript), 500);
    return () => clearTimeout(timerRef.current);
  }, [transcript, isListening]);

  const addTashkeel = async (text: string) => {
    if (!text.trim()) return;
    setIsProcessing(true);
    try {
      const res = await fetch("http://185.245.183.209:8081/api/speech/add-tashkeel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, context: "quran" }),
      });
      const data = await res.json();
      if (data.with_tashkeel) setWithTashkeel(data.with_tashkeel);
      if (data.detected_ayahs?.length) setDetectedAyahs(data.detected_ayahs);
    } catch {
      /* silent */
    } finally {
      setIsProcessing(false);
    }
  };

  const toggle = () => {
    if (!recognitionRef.current) return;
    try {
      isListening
        ? recognitionRef.current.stop()
        : recognitionRef.current.start();
    } catch {}
  };

  const copy = () => {
    navigator.clipboard.writeText(withTashkeel || transcript);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const clear = () => {
    setTranscript("");
    setWithTashkeel("");
    setDetectedAyahs([]);
  };

  if (!isSupported) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
        ⚠️ Speech recognition not supported. Use Chrome or Edge.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Buttons */}
      <div className="flex gap-2">
        <button
          onClick={toggle}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition sm:py-3 ${
            isListening
              ? "bg-red-500 text-white animate-pulse"
              : "bg-emerald-600 text-white hover:bg-emerald-700"
          }`}
        >
          {isListening ? (
            <>
              <MicOff className="h-4 w-4" /> Stop
            </>
          ) : (
            <>
              <Mic className="h-4 w-4" /> Start Speaking
            </>
          )}
        </button>
        {transcript && (
          <>
            <button
              onClick={copy}
              className="rounded-lg bg-sky-600 px-3 text-white transition hover:bg-sky-700"
              title="Copy"
            >
              {isCopied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
            <button
              onClick={clear}
              className="rounded-lg bg-gray-200 px-3 text-gray-700 transition hover:bg-gray-300"
              title="Clear"
            >
              ✕
            </button>
          </>
        )}
      </div>

      {isListening && (
        <div className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-xs text-sky-800 sm:text-sm">
          🎤 Listening… speak clearly in Arabic
        </div>
      )}

      {transcript ? (
        <div className="space-y-3">
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 sm:p-4">
            <p className="mb-1 text-xs text-gray-400">Recognised speech</p>
            <p className="text-sm leading-relaxed text-gray-700 sm:text-base">
              {transcript}
            </p>
          </div>

          {isProcessing && (
            <p className="text-center text-xs text-sky-600">
              ⏳ Adding tashkeel…
            </p>
          )}

          {withTashkeel && (
            <div className="rounded-lg border-2 border-emerald-200 bg-white p-3 sm:p-4">
              <p className="mb-1 text-xs font-semibold text-emerald-600">
                ✨ With tashkeel
              </p>
              <p
                className="arabic-text !text-xl sm:!text-2xl text-gray-900"
                dir="rtl"
              >
                {withTashkeel}
              </p>
            </div>
          )}

          {detectedAyahs.length > 0 && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 sm:p-4">
              <p className="mb-2 text-xs font-semibold text-emerald-800">
                🕌 Detected ayahs
              </p>
              <div className="space-y-2">
                {detectedAyahs.map((a, i) => (
                  <div
                    key={i}
                    className="rounded-lg border border-emerald-100 bg-white p-2.5 sm:p-3"
                  >
                    <p className="text-xs text-gray-500">
                      Surah {a.surah}, Ayah {a.ayah} —{" "}
                      {Math.round(a.similarity * 100)}%
                    </p>
                    <p
                      className="arabic-text !text-base text-gray-900 sm:!text-lg"
                      dir="rtl"
                    >
                      {a.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : !isListening ? (
        <div className="rounded-lg border border-gray-100 bg-gray-50 p-4 text-center text-sm text-gray-400">
          👆 Tap "Start Speaking" to begin
        </div>
      ) : null}
    </div>
  );
}
