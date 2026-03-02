"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, BookOpen } from "lucide-react";
import Link from "next/link";
import FullSurahRecitation from "@/components/FullSurahRecitation";

interface SurahInfo {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
}

export default function ReciteSurahPage() {
  const [selectedSurah, setSelectedSurah] = useState<number | null>(null);
  const [surahs, setSurahs] = useState<SurahInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("http://localhost:8000/api/quran/surahs");
        const data = await res.json();
        if (data.surahs) setSurahs(data.surahs);
      } catch (e) {
        console.error("Error fetching surahs:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (selectedSurah) {
    return (
      <FullSurahRecitation
        surahNumber={selectedSurah}
        onBack={() => setSelectedSurah(null)}
      />
    );
  }

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
            <h1 className="text-base font-bold sm:text-lg">Recite Surah</h1>
          </div>
          <div className="w-10 sm:w-14" />
        </div>
      </header>

      {/* Surah Picker */}
      <div className="mx-auto max-w-2xl px-4 py-6 sm:py-10">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-lg sm:p-8">
          <h2 className="mb-1 text-center text-xl font-bold sm:text-2xl">
            Select a Surah
          </h2>
          <p className="mb-6 text-center text-sm text-gray-500">
            Choose a Surah to start reciting
          </p>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />
            </div>
          ) : (
            <div className="max-h-[60vh] space-y-2 overflow-y-auto pr-1 sm:max-h-[65vh]">
              {surahs.map((surah) => (
                <button
                  key={surah.number}
                  onClick={() => setSelectedSurah(surah.number)}
                  className="group flex w-full items-center justify-between rounded-xl border border-gray-100 px-4 py-3 text-left transition hover:border-emerald-400 hover:bg-emerald-50 active:scale-[.99] sm:px-5 sm:py-4"
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-sm font-bold text-emerald-700 sm:h-10 sm:w-10">
                      {surah.number}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-gray-900 sm:text-base">
                        {surah.englishName}
                      </p>
                      <p className="truncate text-xs text-gray-500 sm:text-sm">
                        {surah.englishNameTranslation}
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <p
                      className="text-lg text-emerald-800 sm:text-xl"
                      dir="rtl"
                    >
                      {surah.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {surah.numberOfAyahs} Ayahs
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
