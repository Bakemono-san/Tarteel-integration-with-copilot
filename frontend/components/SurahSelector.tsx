'use client'

import { useState, useEffect } from 'react'
import { ChevronDown, Play } from 'lucide-react'

interface SurahInfo {
  number: number
  name: string
  englishName: string
  englishNameTranslation: string
  numberOfAyahs: number
}

interface SurahSelectorProps {
  selectedSurah: number
  selectedAyah: number
  onSurahChange: (surah: number) => void
  onAyahChange: (ayah: number) => void
  onStart: () => void
}

const SAMPLE_SURAHS: SurahInfo[] = [
  { number: 1, name: 'الفاتحة', englishName: 'Al-Fatihah', englishNameTranslation: 'The Opening', numberOfAyahs: 7 },
  { number: 2, name: 'البقرة', englishName: 'Al-Baqarah', englishNameTranslation: 'The Cow', numberOfAyahs: 286 },
  { number: 112, name: 'الإخلاص', englishName: 'Al-Ikhlas', englishNameTranslation: 'The Sincerity', numberOfAyahs: 4 },
]

export default function SurahSelector({
  selectedSurah,
  selectedAyah,
  onSurahChange,
  onAyahChange,
  onStart
}: SurahSelectorProps) {
  const [surahs, setSurahs] = useState<SurahInfo[]>(SAMPLE_SURAHS)
  const currentSurah = surahs.find(s => s.number === selectedSurah)

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
        Select Surah and Ayah
      </h2>

      <div className="space-y-6">
        {/* Surah Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Surah
          </label>
          <div className="relative">
            <select
              value={selectedSurah}
              onChange={(e) => {
                onSurahChange(Number(e.target.value))
                onAyahChange(1)
              }}
              className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none bg-white"
            >
              {surahs.map((surah) => (
                <option key={surah.number} value={surah.number}>
                  {surah.number}. {surah.englishName} - {surah.name} ({surah.englishNameTranslation})
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Ayah Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Ayah
          </label>
          <div className="relative">
            <select
              value={selectedAyah}
              onChange={(e) => onAyahChange(Number(e.target.value))}
              className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none bg-white"
            >
              {Array.from({ length: currentSurah?.numberOfAyahs || 7 }, (_, i) => i + 1).map((num) => (
                <option key={num} value={num}>
                  Ayah {num}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Current Selection Display */}
        <div className="bg-emerald-50 rounded-lg p-6 text-center">
          <p className="text-sm text-gray-600 mb-2">You will recite:</p>
          <p className="text-2xl font-bold text-emerald-700 mb-1">
            {currentSurah?.englishName}
          </p>
          <p className="arabic-text text-3xl text-emerald-800">
            {currentSurah?.name}
          </p>
          <p className="text-lg text-gray-700 mt-2">
            Ayah {selectedAyah}
          </p>
        </div>

        {/* Start Button */}
        <button
          onClick={onStart}
          className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-emerald-600 text-white text-lg font-semibold rounded-xl hover:bg-emerald-700 transition shadow-lg hover:shadow-xl"
        >
          <Play className="h-6 w-6" />
          Start Recitation
        </button>
      </div>
    </div>
  )
}
