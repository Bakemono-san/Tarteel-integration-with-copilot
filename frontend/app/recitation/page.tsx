'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, BookOpen } from 'lucide-react'
import RecitationInterface from '@/components/RecitationInterface'
import SurahSelector from '@/components/SurahSelector'

export default function RecitationPage() {
  const [selectedSurah, setSelectedSurah] = useState<number>(1)
  const [selectedAyah, setSelectedAyah] = useState<number>(1)
  const [showSelector, setShowSelector] = useState<boolean>(true)

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-gray-700 hover:text-gray-900">
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Home</span>
            </Link>
            <div className="flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-emerald-600" />
              <h1 className="text-xl font-bold text-gray-900">Practice Recitation</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {showSelector ? (
          <div className="max-w-4xl mx-auto">
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
  )
}
