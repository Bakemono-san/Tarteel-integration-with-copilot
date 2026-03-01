'use client'

interface AyahDisplayProps {
  surahNumber: number
  ayahNumber: number
  surahName: string
  ayahText: string
  transcription?: string
  errors?: Array<{
    type: string
    position: number
    expected: string
    received: string
    severity: string
  }>
}

export default function AyahDisplay({
  surahNumber,
  ayahNumber,
  surahName,
  ayahText,
  transcription,
  errors = []
}: AyahDisplayProps) {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      {/* Surah Info */}
      <div className="text-center mb-6 border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {surahName} - Ayah {ayahNumber}
        </h2>
        <p className="text-sm text-gray-600">
          Surah {surahNumber}, Ayah {ayahNumber}
        </p>
      </div>

      {/* Ayah Text */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-3 text-center">
          Original Ayah
        </h3>
        <div className="ayah-text bg-emerald-50 rounded-xl p-6 text-emerald-900">
          {ayahText || 'Loading...'}
        </div>
      </div>

      {/* Transcription */}
      {transcription && (
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-3 text-center">
            Your Recitation
          </h3>
          <div className="ayah-text bg-blue-50 rounded-xl p-6 text-blue-900">
            {transcription}
          </div>
        </div>
      )}

      {/* Quick Tips */}
      <div className="mt-6 bg-amber-50 rounded-lg p-4">
        <h4 className="font-semibold text-amber-900 mb-2">💡 Quick Tips:</h4>
        <ul className="text-sm text-amber-800 space-y-1">
          <li>• Recite clearly and at a moderate pace</li>
          <li>• Pay attention to Tajweed rules</li>
          <li>• Ensure proper pronunciation of each letter</li>
          <li>• Practice in a quiet environment</li>
        </ul>
      </div>
    </div>
  )
}
