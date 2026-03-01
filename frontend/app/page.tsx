import Link from 'next/link'
import { BookOpen, Mic, TrendingUp, Award } from 'lucide-react'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="h-8 w-8 text-emerald-600" />
              <h1 className="text-2xl font-bold text-gray-900">Quran Recitation</h1>
            </div>
            <nav className="flex gap-4">
              <Link
                href="/recitation"
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
              >
                Start Reciting
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Master Your Quran Recitation
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Practice with real-time Tajweed correction powered by Tarteel AI
          </p>

          <div className="arabic-text text-emerald-700 mb-8">
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </div>

          <Link
            href="/recitation"
            className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-600 text-white text-lg rounded-xl hover:bg-emerald-700 transition shadow-lg hover:shadow-xl"
          >
            <Mic className="h-6 w-6" />
            Start Reciting Now
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Features
        </h3>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
              <Mic className="h-8 w-8 text-emerald-600" />
            </div>
            <h4 className="text-xl font-bold text-gray-900 mb-2">
              Real-time Recognition
            </h4>
            <p className="text-gray-600">
              Advanced Arabic speech recognition using Tarteel AI models to transcribe your recitation instantly
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <BookOpen className="h-8 w-8 text-blue-600" />
            </div>
            <h4 className="text-xl font-bold text-gray-900 mb-2">
              Tajweed Analysis
            </h4>
            <p className="text-gray-600">
              Comprehensive Tajweed rule detection including Qalqalah, Ghunna, Madd, and more
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
            <h4 className="text-xl font-bold text-gray-900 mb-2">
              Progress Tracking
            </h4>
            <p className="text-gray-600">
              Get instant feedback with accuracy scores and detailed corrections for improvement
            </p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="container mx-auto px-4 py-16 bg-white/50 rounded-3xl my-16">
        <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
          How It Works
        </h3>

        <div className="max-w-3xl mx-auto space-y-6">
          <div className="flex gap-4">
            <div className="w-12 h-12 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
              1
            </div>
            <div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">Choose a Surah</h4>
              <p className="text-gray-600">
                Select any Surah and Ayah from the Quran that you want to practice
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-12 h-12 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
              2
            </div>
            <div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">Start Reciting</h4>
              <p className="text-gray-600">
                Click the microphone button and recite the Ayah with proper Tajweed
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-12 h-12 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
              3
            </div>
            <div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">Get Instant Feedback</h4>
              <p className="text-gray-600">
                Receive real-time analysis of your recitation with Tajweed corrections and accuracy scores
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-12 h-12 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
              4
            </div>
            <div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">Improve & Repeat</h4>
              <p className="text-gray-600">
                Practice repeatedly with detailed suggestions until you achieve mastery
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white/80 backdrop-blur-sm mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-gray-600">
            <p className="mb-2">Powered by Tarteel AI Open Source Models</p>
            <p className="text-sm">Built with Next.js, FastAPI, and PyTorch</p>
          </div>
        </div>
      </footer>
    </main>
  )
}
