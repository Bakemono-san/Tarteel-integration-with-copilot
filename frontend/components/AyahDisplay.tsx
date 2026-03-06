"use client";

import QuranAudioPlayer from "./QuranAudioPlayer";

interface Props {
  surahNumber: number;
  ayahNumber: number;
  surahName: string;
  ayahText: string;
  transcription?: string;
  errors?: Array<{
    type: string;
    position: number;
    expected: string;
    received: string;
    severity: string;
  }>;
}

export default function AyahDisplay({
  surahNumber,
  ayahNumber,
  surahName,
  ayahText,
  transcription,
  errors = [],
}: Props) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-lg sm:p-8">
      {/* Header */}
      <div className="mb-5 border-b border-gray-100 pb-4 text-center">
        <h2 className="text-lg font-bold sm:text-xl">
          {surahName} — Ayah {ayahNumber}
        </h2>
        <p className="text-xs text-gray-500">Surah {surahNumber}</p>
      </div>

      {/* Original ayah */}
      <div className="mb-5">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-600">Original Ayah</h3>
          <QuranAudioPlayer
            surahNumber={surahNumber}
            ayahNumber={ayahNumber}
            reciter="ar.alafasy"
          />
        </div>
        <div className="rounded-xl bg-emerald-50 p-4 text-center sm:p-6">
          <p
            className="arabic-text !text-xl text-emerald-900 sm:!text-2xl"
            dir="rtl"
          >
            {ayahText || "Loading…"}
          </p>
        </div>
      </div>

      {/* User transcription */}
      {transcription && (
        <div className="mb-5">
          <h3 className="mb-2 text-center text-sm font-semibold text-gray-600">
            Your Recitation
          </h3>
          <div className="rounded-xl bg-sky-50 p-4 text-center sm:p-6">
            <p
              className="arabic-text !text-xl text-sky-900 sm:!text-2xl"
              dir="rtl"
            >
              {transcription}
            </p>
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="rounded-lg bg-amber-50 p-3 sm:p-4">
        <h4 className="mb-1 text-xs font-semibold text-amber-800 sm:text-sm">
          💡 Quick tips
        </h4>
        <ul className="space-y-0.5 text-xs text-amber-700">
          <li>• Recite clearly at a moderate pace</li>
          <li>• Pay attention to Tajweed rules</li>
          <li>• Detect Ayahs in a quiet environment</li>
        </ul>
      </div>
    </div>
  );
}
