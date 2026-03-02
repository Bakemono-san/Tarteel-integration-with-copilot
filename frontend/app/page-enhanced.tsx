import Link from "next/link";
import {
  BookOpen,
  Mic,
  TrendingUp,
  Award,
  Volume2,
  Zap,
  Globe,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            {/* Logo */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-emerald-600 to-emerald-700 flex items-center justify-center flex-shrink-0">
                <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">
                  Quran Recitation
                </h1>
                <p className="text-xs text-gray-600 hidden sm:block">
                  Learn with Tarteel AI
                </p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex gap-2 sm:gap-3 flex-shrink-0">
              <Link
                href="/recitation"
                className="px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition shadow-sm hover:shadow-md"
              >
                Recite Now
              </Link>
              <Link
                href="/recite-surah"
                className="px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition shadow-sm hover:shadow-md"
              >
                Surah
              </Link>
              <Link
                href="/speech-to-text"
                className="px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm hover:shadow-md"
              >
                Practice
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-3 sm:px-4 py-12 sm:py-20">
        <div className="text-center max-w-4xl mx-auto">
          <div className="mb-4 sm:mb-6 inline-block">
            <span className="px-3 sm:px-4 py-1 sm:py-2 rounded-full bg-emerald-100 text-emerald-800 text-xs sm:text-sm font-semibold">
              ✨ Powered by Tarteel AI
            </span>
          </div>

          <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
            Master Your Quran Recitation
          </h2>

          <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 sm:mb-8 leading-relaxed">
            Advanced speech recognition with real-time Tajweed correction. Learn
            like you're with a teacher.
          </p>

          <div className="text-2xl sm:text-3xl mb-6 sm:mb-8 font-semibold leading-relaxed">
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Link
              href="/recite-surah"
              className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-emerald-600 text-white text-base sm:text-lg rounded-xl hover:bg-emerald-700 transition shadow-lg hover:shadow-xl font-semibold"
            >
              <Mic className="h-5 w-5 sm:h-6 sm:w-6" />
              Start Reciting
            </Link>
            <Link
              href="/speech-to-text"
              className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-white text-emerald-600 text-base sm:text-lg rounded-xl border-2 border-emerald-600 hover:bg-emerald-50 transition font-semibold"
            >
              <Volume2 className="h-5 w-5 sm:h-6 sm:w-6" />
              Practice Mode
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <h3 className="text-4xl font-bold text-center text-gray-900 mb-16">
          Why Choose Us
        </h3>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Feature 1 */}
          <div className="group bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300">
            <div className="w-14 h-14 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-xl flex items-center justify-center mb-4 group-hover:from-emerald-600 group-hover:to-emerald-500 transition-all">
              <Zap className="h-7 w-7 text-emerald-600 group-hover:text-white transition" />
            </div>
            <h4 className="text-2xl font-bold text-gray-900 mb-3">
              Real-time Recognition
            </h4>
            <p className="text-gray-600 leading-relaxed">
              Advanced Arabic speech recognition using state-of-the-art AI
              models. Transcribe your recitation instantly and accurately.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="group bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl flex items-center justify-center mb-4 group-hover:from-blue-600 group-hover:to-blue-500 transition-all">
              <BookOpen className="h-7 w-7 text-blue-600 group-hover:text-white transition" />
            </div>
            <h4 className="text-2xl font-bold text-gray-900 mb-3">
              Tajweed Analysis
            </h4>
            <p className="text-gray-600 leading-relaxed">
              Comprehensive Tajweed rule detection including Qalqalah, Ghunna,
              Madd, and more. Learn the rules of beautiful Quranic recitation.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="group bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-purple-50 rounded-xl flex items-center justify-center mb-4 group-hover:from-purple-600 group-hover:to-purple-500 transition-all">
              <TrendingUp className="h-7 w-7 text-purple-600 group-hover:text-white transition" />
            </div>
            <h4 className="text-2xl font-bold text-gray-900 mb-3">
              Track Progress
            </h4>
            <p className="text-gray-600 leading-relaxed">
              Monitor your improvement with detailed analytics and insights. See
              which areas need more practice and celebrate your achievements.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="group bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300">
            <div className="w-14 h-14 bg-gradient-to-br from-pink-100 to-pink-50 rounded-xl flex items-center justify-center mb-4 group-hover:from-pink-600 group-hover:to-pink-500 transition-all">
              <Award className="h-7 w-7 text-pink-600 group-hover:text-white transition" />
            </div>
            <h4 className="text-2xl font-bold text-gray-900 mb-3">
              Accuracy Feedback
            </h4>
            <p className="text-gray-600 leading-relaxed">
              Instant feedback on your recitation with detailed error analysis.
              Learn from your mistakes and improve with every session.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="group bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-100 to-indigo-50 rounded-xl flex items-center justify-center mb-4 group-hover:from-indigo-600 group-hover:to-indigo-500 transition-all">
              <Mic className="h-7 w-7 text-indigo-600 group-hover:text-white transition" />
            </div>
            <h4 className="text-2xl font-bold text-gray-900 mb-3">
              Interactive Practice
            </h4>
            <p className="text-gray-600 leading-relaxed">
              Practice at your own pace with interactive recitation modes.
              Perfect for beginners and advanced learners alike.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="group bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300">
            <div className="w-14 h-14 bg-gradient-to-br from-green-100 to-green-50 rounded-xl flex items-center justify-center mb-4 group-hover:from-green-600 group-hover:to-green-500 transition-all">
              <Globe className="h-7 w-7 text-green-600 group-hover:text-white transition" />
            </div>
            <h4 className="text-2xl font-bold text-gray-900 mb-3">
              Always Available
            </h4>
            <p className="text-gray-600 leading-relaxed">
              Learn from anywhere, anytime. Access the app on desktop, tablet,
              or mobile device. Your progress syncs across all devices.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="container mx-auto px-4 py-20 bg-white rounded-3xl my-20 shadow-lg">
        <h3 className="text-4xl font-bold text-center text-gray-900 mb-16">
          How It Works
        </h3>

        <div className="max-w-4xl mx-auto">
          <div className="space-y-8">
            {/* Step 1 */}
            <div className="flex gap-6">
              <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold flex-shrink-0 text-lg">
                1
              </div>
              <div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">
                  Select Your Surah
                </h4>
                <p className="text-gray-600">
                  Choose any Surah from the Quran. The app displays the text
                  beautifully formatted for easy reading and recitation.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-6">
              <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold flex-shrink-0 text-lg">
                2
              </div>
              <div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">
                  Start Recording
                </h4>
                <p className="text-gray-600">
                  Click the microphone button and begin your recitation. The AI
                  listens and transcribes your voice in real-time.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-6">
              <div className="w-12 h-12 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold flex-shrink-0 text-lg">
                3
              </div>
              <div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">
                  Get Instant Feedback
                </h4>
                <p className="text-gray-600">
                  Receive detailed analysis showing your accuracy, errors, and
                  areas for improvement. See which words need practice.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex gap-6">
              <div className="w-12 h-12 rounded-full bg-pink-600 text-white flex items-center justify-center font-bold flex-shrink-0 text-lg">
                4
              </div>
              <div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">
                  Improve & Master
                </h4>
                <p className="text-gray-600">
                  Retry as many times as you want. Track your progress and
                  celebrate when you perfect each Surah.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-3xl p-16 text-center">
          <h3 className="text-4xl font-bold text-white mb-4">
            Ready to Perfect Your Recitation?
          </h3>
          <p className="text-xl text-emerald-100 mb-8">
            Start your journey to mastering Quranic recitation today.
          </p>
          <Link
            href="/recite-surah"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-emerald-600 text-lg rounded-xl hover:bg-gray-100 transition font-semibold shadow-xl hover:shadow-2xl"
          >
            <Mic className="h-6 w-6" />
            Begin Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-gray-900 text-gray-300">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h4 className="font-bold text-white mb-4">About</h4>
              <p className="text-sm">
                Quran Recitation App combining Tarteel AI with beautiful Quranic
                interface for effective learning.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Features</h4>
              <ul className="text-sm space-y-2">
                <li>Real-time Speech Recognition</li>
                <li>Tajweed Analysis</li>
                <li>Progress Tracking</li>
                <li>Accurate Feedback</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Resources</h4>
              <ul className="text-sm space-y-2">
                <li>
                  <a href="#" className="hover:text-white transition">
                    Help
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Terms
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-sm">
              © 2026 Quran Recitation. All rights reserved. Made with ❤️ for
              Quranic learning.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
