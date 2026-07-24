"use client";

import { useState, useEffect } from "react";
import { ChevronDown, Play, BookOpen, Star } from "lucide-react";
import { apiFetch } from "@/lib/utils";

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

const REVELATION_ICONS: Record<string, string> = {
  Meccan: "🕋",
  Medinan: "🕌",
};

export default function SurahSelector({
  selectedSurah,
  selectedAyah,
  onSurahChange,
  onAyahChange,
  onStart,
}: Props) {
  const [surahs, setSurahs] = useState<SurahInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const current = surahs.find((s) => s.number === selectedSurah);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiFetch("/api/quran/surahs");
        const data = await res.json();
        if (data.surahs) setSurahs(data.surahs);
      } catch {
        setSurahs([
          { number: 1, name: "الفاتحة", englishName: "Al-Fatihah", englishNameTranslation: "The Opening", numberOfAyahs: 7 },
          { number: 2, name: "البقرة", englishName: "Al-Baqarah", englishNameTranslation: "The Cow", numberOfAyahs: 286 },
        ]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="space-y-5">
      {/* Surah Selector */}
      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="card-pinterest flex w-full items-center justify-between gap-3 px-4 py-3.5 sm:px-5 sm:py-4"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-sm font-bold text-white shadow-md">
              {current?.number || "?"}
            </div>
            <div className="min-w-0 text-left">
              <p className="truncate font-semibold text-gray-900">
                {current?.englishName || "Select a Surah"}
              </p>
              {current && (
                <p className="truncate text-xs text-gray-400">
                  {current.englishNameTranslation} · {current.numberOfAyahs} ayahs
                </p>
              )}
            </div>
          </div>
          <ChevronDown className={`h-5 w-5 shrink-0 text-gray-400 transition ${open ? "rotate-180" : ""}`} />
        </button>

        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-72 overflow-y-auto rounded-2xl border border-gray-100 bg-white shadow-xl animate-in slide-in-from-top-2">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-200 border-t-emerald-600" />
                </div>
              ) : (
                <div className="p-1.5 space-y-0.5">
                  {surahs.map((s) => (
                    <button
                      key={s.number}
                      onClick={() => {
                        onSurahChange(s.number);
                        setOpen(false);
                      }}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${
                        s.number === selectedSurah
                          ? "bg-emerald-50"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-xs font-bold text-emerald-700">
                        {s.number}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-gray-900">
                          {s.englishName}
                        </p>
                        <p className="truncate text-xs text-gray-400">
                          {s.englishNameTranslation}
                        </p>
                      </div>
                      <p className="shrink-0 text-sm text-emerald-700" dir="rtl">
                        {s.name}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Ayah Number Selector */}
      {current && (
        <div className="card-pinterest p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Ayah Number
            </label>
            <span className="text-xs text-gray-400">
              of {current.numberOfAyahs}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min={1}
              max={current.numberOfAyahs}
              value={selectedAyah}
              onChange={(e) => onAyahChange(Number(e.target.value))}
              className="flex-1 h-2 appearance-none rounded-full bg-emerald-100 accent-emerald-600 cursor-pointer"
            />
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-sm font-bold text-emerald-700">
              {selectedAyah}
            </span>
          </div>
        </div>
      )}

      {/* Start Button */}
      <button
        onClick={onStart}
        disabled={!current}
        className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/25 transition-all hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Play className="h-5 w-5" />
        Start Recitation
      </button>

      {/* Quick stats */}
      {current && (
        <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
          <span>{REVELATION_ICONS[current.englishNameTranslation?.includes("Meccan") ? "Meccan" : "Medinan"] || "📖"}</span>
          <span>Surah {current.number}</span>
          <span className="flex items-center gap-1">
            <Star className="h-3 w-3" />
            Juz&apos; {current.number <= 2 ? 1 : Math.ceil(current.number / 114 * 30)}
          </span>
        </div>
      )}
    </div>
  );
}