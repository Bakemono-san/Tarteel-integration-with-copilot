"use client";

import Link from "next/link";
import { ArrowLeft, BookOpen } from "lucide-react";
import SpeechToText from "@/components/SpeechToText";

export default function SpeechToTextPage() {
  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gray-200/60 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm text-gray-600 transition hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Home</span>
          </Link>
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-emerald-600" />
            <h1 className="text-base font-bold sm:text-lg">Speech‑to‑Text</h1>
          </div>
          <div className="w-10 sm:w-14" />
        </div>
      </header>

      {/* Content */}
      <div className="mx-auto max-w-2xl px-4 py-6 sm:py-10 space-y-5">
        {/* Info */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-lg text-center sm:p-8">
          <h2 className="mb-2 text-xl font-bold sm:text-2xl">
            🗣️ Speech‑to‑Text Practice
          </h2>
          <p className="text-sm leading-relaxed text-gray-600 sm:text-base">
            Speak Arabic and see your speech converted to text in real-time.
            Great for pronunciation practice.
          </p>
        </div>

        {/* STT Component */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-lg sm:p-8">
          <SpeechToText
            language="ar-SA"
            onTranscriptionComplete={(text) =>
              console.log("Transcription:", text)
            }
          />
        </div>

        {/* Tips */}
        <div className="rounded-xl border border-sky-200 bg-sky-50 p-4 sm:p-5">
          <h3 className="mb-2 text-sm font-semibold text-sky-900 sm:text-base">
            💡 Tips for best results
          </h3>
          <ul className="space-y-1 text-xs text-sky-800 sm:text-sm">
            <li>✓ Speak clearly and at a moderate pace</li>
            <li>✓ Use a quiet environment</li>
            <li>✓ Speak in Modern Standard Arabic</li>
            <li>✓ Works best in Chrome or Edge</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
