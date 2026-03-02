"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen } from "lucide-react";
import RecitationInterface from "@/components/RecitationInterface";
import SurahSelector from "@/components/SurahSelector";

export default function RecitationPage() {
  const [selectedSurah, setSelectedSurah] = useState<number>(1);
  const [selectedAyah, setSelectedAyah] = useState<number>(1);
  const [showSelector, setShowSelector] = useState(true);

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
            <h1 className="text-base font-bold sm:text-lg">
              Practice Recitation
            </h1>
          </div>
          <div className="w-10 sm:w-14" />
        </div>
      </header>

      {/* Content */}
      <div className="mx-auto max-w-5xl px-4 py-6 sm:py-10">
        {showSelector ? (
          <div className="mx-auto max-w-2xl">
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
