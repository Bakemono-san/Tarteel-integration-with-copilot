"use client";

import { useState, useEffect } from "react";
import { ChevronDown, Play } from "lucide-react";

interface SurahInfo {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
}
interface Props {
  selectedSurah: number;
  selectedAyah: number;
  onSurahChange: (n: number) => void;
  onAyahChange: (n: number) => void;
  onStart: () => void;
}

export default function SurahSelector({
  selectedSurah,
  selectedAyah,
  onSurahChange,
  onAyahChange,
  onStart,
}: Props) {
  const [surahs, setSurahs] = useState<SurahInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const current = surahs.find((s) => s.number === selectedSurah);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("http://185.245.183.209:8081/api/quran/surahs");
        const data = await res.json();
        if (data.surahs) setSurahs(data.surahs);
      } catch {
        setSurahs([
          {
            number: 1,
            name: "الفاتحة",
            englishName: "Al-Fatihah",
            englishNameTranslation: "The Opening",
            numberOfAyahs: 7,
          },
          {
            number: 2,
            name: "البقرة",
            englishName: "Al-Baqarah",
            englishNameTranslation: "The Cow",
            numberOfAyahs: 286,
          },
        ]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center rounded-2xl border border-gray-100 bg-white p-12 shadow-lg">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-lg sm:p-8">
      <h2 className="mb-6 text-center text-xl font-bold sm:text-2xl">
        Select Surah & Ayah
      </h2>

      <div className="space-y-5">
        {/* Surah */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-gray-500 sm:text-sm">
            Surah
          </label>
          <div className="relative">
            <select
              value={selectedSurah}
              onChange={(e) => {
                onSurahChange(Number(e.target.value));
                onAyahChange(1);
              }}
              className="w-full appearance-none rounded-lg border border-gray-200 bg-white px-3 py-2.5 pr-10 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 sm:text-base"
            >
              {surahs.map((s) => (
                <option key={s.number} value={s.number}>
                  {s.number}. {s.englishName} — {s.name} (
                  {s.englishNameTranslation})
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        {/* Ayah */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-gray-500 sm:text-sm">
            Ayah
          </label>
          <div className="relative">
            <select
              value={selectedAyah}
              onChange={(e) => onAyahChange(Number(e.target.value))}
              className="w-full appearance-none rounded-lg border border-gray-200 bg-white px-3 py-2.5 pr-10 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 sm:text-base"
            >
              {Array.from(
                { length: current?.numberOfAyahs || 7 },
                (_, i) => i + 1,
              ).map((n) => (
                <option key={n} value={n}>
                  Ayah {n}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        {/* Preview */}
        <div className="rounded-xl bg-emerald-50 p-4 text-center sm:p-5">
          <p className="text-xs text-gray-500">You will recite</p>
          <p className="mt-1 text-lg font-bold text-emerald-700 sm:text-xl">
            {current?.englishName}
          </p>
          <p
            className="mt-0.5 text-2xl text-emerald-800 sm:text-3xl"
            dir="rtl"
            style={{ fontFamily: "'Amiri Quran', serif" }}
          >
            {current?.name}
          </p>
          <p className="mt-1 text-sm text-gray-600">Ayah {selectedAyah}</p>
        </div>

        {/* Start */}
        <button
          onClick={onStart}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700 active:scale-[.98] sm:py-3.5 sm:text-base"
        >
          <Play className="h-5 w-5" /> Start Recitation
        </button>
      </div>
    </div>
  );
}
