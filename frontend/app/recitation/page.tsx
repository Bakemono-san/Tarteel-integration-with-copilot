"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mic, Sparkles } from "lucide-react";
import RecitationInterface from "@/components/RecitationInterface";
import SurahSelector from "@/components/SurahSelector";

export default function RecitationPage() {
  const [selectedSurah, setSelectedSurah] = useState<number>(1);
  const [selectedAyah, setSelectedAyah] = useState<number>(1);
  const [showSelector, setShowSelector] = useState(true);

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50/40 via-white to-amber-50/30">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-emerald-100/60 bg-white/90 backdrop-blur-xl shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm text-gray-500 transition hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Home</span>
          </Link>
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-md">
              <Mic className="h-4 w-4 text-white" />
            </div>
            <h1 className="text-base font-bold text-gray-800 sm:text-lg">
              <span className="text-emerald-600">Recite</span> &amp; Analyse
            </h1>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1">
            <Sparkles className="h-3 w-3 text-amber-500" />
            <span className="text-[10px] font-medium text-amber-700">Bakemono AI</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="mx-auto max-w-5xl px-4 py-6 sm:py-10">
        {showSelector ? (
          <div className="mx-auto max-w-2xl">
            <div className="mb-6 text-center">
              <h2 className="text-xl font-bold text-gray-800 sm:text-2xl">
                Choose Your Ayah
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Select a surah and ayah to practice recitation
              </p>
            </div>
            <SurahSelector
              selectedSurah={selectedSurah}
              selectedAyah={selectedAyah}
              onSurahChange={setSelectedSurah}
              onAyahChange={setSelectedAyah}
              onStart={() => setShowSelector(false)}
            />
          </div>
        ) : (
          <RecitationInterface
            surahNumber={selectedSurah}
            ayahNumber={selectedAyah}
            onBack={() => setShowSelector(true)}
          />
        )}
      </div>
    </main>
  );
}