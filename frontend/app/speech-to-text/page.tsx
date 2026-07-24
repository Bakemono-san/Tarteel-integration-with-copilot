"use client";

import Link from "next/link";
import { ArrowLeft, BookOpen, Ear, Mic, Sparkles, Volume2 } from "lucide-react";
import SpeechToText from "@/components/SpeechToText";

export default function SpeechToTextPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-sky-50/40 via-white to-emerald-50/30">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-sky-100/60 bg-white/90 backdrop-blur-xl shadow-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm text-gray-500 transition hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Home</span>
          </Link>
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 to-sky-600 shadow-md">
              <Ear className="h-4 w-4 text-white" />
            </div>
            <h1 className="text-base font-bold text-gray-800 sm:text-lg">
              <span className="text-sky-600">Ayah</span> Detection
            </h1>
          </div>
          <div className="w-10 sm:w-14" />
        </div>
      </header>

      {/* Content */}
      <div className="mx-auto max-w-2xl px-4 py-6 sm:py-12 space-y-6">
        {/* Hero Card */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-sky-600 via-sky-500 to-cyan-500 p-6 sm:p-10 text-white shadow-xl">
          <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-white/5 blur-2xl" />
          <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-white/5 blur-2xl" />

          <div className="relative z-10">
            <div className="mb-4 inline-flex rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
              <Sparkles className="mr-1.5 h-3.5 w-3.5" />
              Powered by Bakemono AI
            </div>

            <h2 className="mb-2 text-2xl font-bold sm:text-3xl">
              🗣️ Speech-to-Text
            </h2>
            <p className="max-w-lg text-sm text-sky-100 sm:text-base leading-relaxed">
              Speak any ayah or surah in Arabic. Our AI detects which verses
              you recited, restores proper tashkeel (diacritics), and shows
              you the exact Quranic text.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <div className="flex items-center gap-2 rounded-lg bg-white/15 px-3 py-1.5 text-xs backdrop-blur-sm">
                <Mic className="h-3.5 w-3.5" />
                Real-time transcription
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-white/15 px-3 py-1.5 text-xs backdrop-blur-sm">
                <Volume2 className="h-3.5 w-3.5" />
                Tashkeel restoration
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-white/15 px-3 py-1.5 text-xs backdrop-blur-sm">
                <BookOpen className="h-3.5 w-3.5" />
                Ayah matching
              </div>
            </div>
          </div>
        </div>

        {/* STT Component */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.06)] sm:p-8">
          <SpeechToText
            language="ar-SA"
            onTranscriptionComplete={(text) =>
              console.log("Transcription:", text)
            }
          />
        </div>

        {/* Tips */}
        <div className="rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50 to-white p-5 sm:p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-100">
              <Sparkles className="h-3.5 w-3.5 text-sky-600" />
            </div>
            <h3 className="text-sm font-bold text-sky-900">
              Tips for Best Results
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-start gap-2.5 rounded-lg bg-white/60 p-3">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-700">
                1
              </span>
              <p className="text-xs text-gray-600 leading-relaxed">
                Speak clearly at a <strong>moderate pace</strong> — not too fast, not too slow
              </p>
            </div>
            <div className="flex items-start gap-2.5 rounded-lg bg-white/60 p-3">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-700">
                2
              </span>
              <p className="text-xs text-gray-600 leading-relaxed">
                Use a <strong>quiet environment</strong> with minimal background noise
              </p>
            </div>
            <div className="flex items-start gap-2.5 rounded-lg bg-white/60 p-3">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-700">
                3
              </span>
              <p className="text-xs text-gray-600 leading-relaxed">
                Speak in <strong>Modern Standard Arabic (Fusha)</strong> for best accuracy
              </p>
            </div>
            <div className="flex items-start gap-2.5 rounded-lg bg-white/60 p-3">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-700">
                4
              </span>
              <p className="text-xs text-gray-600 leading-relaxed">
                Works best in <strong>Chrome or Edge</strong> browsers
              </p>
            </div>
          </div>
        </div>

        {/* How it works */}
        <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-5 sm:p-6 shadow-sm">
          <h3 className="flex items-center gap-2 text-sm font-bold text-emerald-800 mb-4">
            <BookOpen className="h-4 w-4" />
            How Ayah Detection Works
          </h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-200 text-xs font-bold text-emerald-800">
                1
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">Speak</p>
                <p className="text-xs text-gray-500">Recite any Quranic verse in Arabic</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-200 text-xs font-bold text-emerald-800">
                2
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">Transcribe</p>
                <p className="text-xs text-gray-500">Browser converts speech to text (without diacritics)</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-200 text-xs font-bold text-emerald-800">
                3
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">Match</p>
                <p className="text-xs text-gray-500">AI searches the Quran database to find matching ayahs</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-200 text-xs font-bold text-emerald-800">
                4
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">Restore</p>
                <p className="text-xs text-gray-500">Full Uthmani text with tashkeel is returned</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}