import Link from "next/link";
import { BookOpen, Mic, TrendingUp, Volume2, GraduationCap, Brain, Languages, Star, Ear, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* ── Premium Header ──────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-emerald-100/60 bg-white/90 backdrop-blur-xl shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-500 shadow-md transition group-hover:shadow-lg group-hover:scale-105">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-800">
              <span className="text-emerald-600">Quran</span> Recitation
            </span>
          </Link>

          <nav className="flex items-center gap-1 sm:gap-1.5">
            <Link
              href="/recitation"
              className="rounded-full bg-gradient-to-r from-emerald-600 to-emerald-500 px-2.5 py-1.5 text-[11px] font-semibold text-white shadow-sm transition hover:shadow-md hover:scale-105 sm:px-4 sm:py-2 sm:text-sm"
            >
              🎤 Recite
            </Link>
            <Link
              href="/recite-surah"
              className="rounded-full bg-gradient-to-r from-purple-600 to-purple-500 px-2.5 py-1.5 text-[11px] font-semibold text-white shadow-sm transition hover:shadow-md hover:scale-105 sm:px-4 sm:py-2 sm:text-sm"
            >
              📖 Surah
            </Link>
            <Link
              href="/speech-to-text"
              className="rounded-full bg-gradient-to-r from-sky-600 to-sky-500 px-2.5 py-1.5 text-[11px] font-semibold text-white shadow-sm transition hover:shadow-md hover:scale-105 sm:px-4 sm:py-2 sm:text-sm"
            >
              🎙️ Ayah Detection
            </Link>
            <Link
              href="/progress"
              className="rounded-full border-2 border-emerald-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-emerald-700 transition hover:bg-emerald-50 hover:border-emerald-300 sm:px-4 sm:py-2 sm:text-sm"
            >
              📊 <span className="hidden sm:inline">My </span>Progress
            </Link>
          </nav>
        </div>
      </header>

      {/* ── Hero ─────────────────────────────────────── */}
      <section className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-4 py-16 text-center sm:py-28">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-50/40 via-white to-amber-50/20 pointer-events-none" />
        <div className="absolute top-20 left-10 h-64 w-64 rounded-full bg-emerald-100/30 blur-3xl" />
        <div className="absolute bottom-20 right-10 h-64 w-64 rounded-full bg-sky-100/30 blur-3xl" />

        <div className="relative z-10">
          <span className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-100 to-emerald-50 border border-emerald-200/60 px-4 py-1.5 text-xs font-semibold text-emerald-800 shadow-sm">
            <Star className="h-3.5 w-3.5 text-emerald-600" />
            Powered by Bakemono AI & Whisper
          </span>

          <h1 className="max-w-4xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-7xl text-balance">
            Master Your <br />
            <span className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 bg-clip-text text-transparent">
              Quran Recitation
            </span>
          </h1>

          <p className="mt-4 max-w-lg mx-auto text-base text-gray-500 sm:text-lg leading-relaxed">
            Real-time Tajweed analysis with Makharij diagrams, curriculum-guided learning,
            and personalized progress tracking.
          </p>

          <p
            className="mt-8 text-3xl font-semibold text-emerald-800 sm:text-4xl bismillah"
            dir="rtl"
          >
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/recite-surah"
              className="inline-flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/25 transition-all hover:shadow-xl hover:scale-105 active:scale-95 sm:text-base"
            >
              <Mic className="h-5 w-5" /> Start Reciting
            </Link>
            <Link
              href="/speech-to-text"
              className="inline-flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-sky-500 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-sky-600/25 transition-all hover:shadow-xl hover:scale-105 active:scale-95 sm:text-base"
            >
              <Ear className="h-5 w-5" /> Ayah Detection
            </Link>
            <Link
              href="/progress"
              className="inline-flex items-center gap-2.5 rounded-xl border-2 border-emerald-200 bg-white/80 px-7 py-3.5 text-sm font-bold text-emerald-700 shadow-sm transition-all hover:bg-emerald-50 hover:border-emerald-300 hover:shadow-md active:scale-95 sm:text-base"
            >
              <TrendingUp className="h-5 w-5" /> Progress
            </Link>
          </div>
        </div>
      </section>

      {/* ── Features Grid ──────────────────────────── */}
      <section className="relative mx-auto w-full max-w-6xl px-4 py-16 sm:py-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold sm:text-4xl text-gray-900">
            Everything You Need
          </h2>
          <p className="mt-2 text-gray-500 text-sm sm:text-base">
            A complete Quran learning companion with AI-powered teaching
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: <Mic className="h-6 w-6" />,
              title: "Real-time Recognition",
              desc: "Advanced Arabic ASR using Bakemono-optimized Whisper models for accurate Quranic transcription.",
              color: "emerald",
              href: "/recitation",
            },
            {
              icon: <BookOpen className="h-6 w-6" />,
              title: "Tajweed Analysis",
              desc: "Comprehensive rule engine covering Qalqalah, Ghunna, Madd, Idgham, Ikhfa, Iqlab, and Meem Sakinah.",
              color: "sky",
              href: "/recitation",
            },
            {
              icon: <Brain className="h-6 w-6" />,
              title: "Makharij Teaching",
              desc: "Interactive mouth articulation diagrams showing exactly where each letter is produced.",
              color: "purple",
              href: "/recitation",
            },
            {
              icon: <TrendingUp className="h-6 w-6" />,
              title: "Progress Tracking",
              desc: "Detailed weakness profiles, accuracy trends, and surah-by-surah statistics.",
              color: "amber",
              href: "/progress",
            },
            {
              icon: <GraduationCap className="h-6 w-6" />,
              title: "Teacher's Curriculum",
              desc: "Structured learning path from short surahs to long passages, with mastery requirements.",
              color: "rose",
              href: "/recite-surah",
            },
            {
              icon: <Languages className="h-6 w-6" />,
              title: "Full Surah Mode",
              desc: "Recite entire surahs and get verse-by-verse feedback with word-level error highlighting.",
              color: "teal",
              href: "/recite-surah",
            },
            {
              icon: <Ear className="h-6 w-6" />,
              title: "Ayah Detection",
              desc: "Speak any surah and our AI will detect which ayahs you recited, add tashkeel, and show the exact verses.",
              color: "sky",
              href: "/speech-to-text",
            },
            {
              icon: <Sparkles className="h-6 w-6" />,
              title: "Teacher Recitation Mode",
              desc: "Listen to professional recitation (Sheikh Al-Afasy), then record yourself — compare and improve verse by verse.",
              color: "rose",
              href: "/recitation",
            },
          ].map(({ icon, title, desc, color, href }) => (
            <Link key={title} href={href}>
              <div className={`group relative h-full rounded-2xl border border-${color}-100 bg-white p-6 shadow-sm transition-all hover:shadow-lg hover:-translate-y-1 sm:p-8`}>
                <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-${color}-100 transition group-hover:bg-${color}-600 sm:h-14 sm:w-14`}>
                  <div className={`text-${color}-600 transition group-hover:text-white`}>
                    {icon}
                  </div>
                </div>
                <h3 className="mb-2 text-lg font-bold text-gray-900">
                  {title}
                </h3>
                <p className="text-sm leading-relaxed text-gray-500">
                  {desc}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────── */}
      <section className="mx-auto w-full max-w-4xl px-4 py-16 sm:py-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold sm:text-4xl text-gray-900">
            How It Works
          </h2>
        </div>

        <div className="relative">
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-emerald-200 via-emerald-300 to-emerald-200 hidden sm:block" />

          <ol className="space-y-10 sm:space-y-12">
            {[
              {
                n: "1",
                title: "Select a Surah & Ayah",
                desc: "Browse all 114 surahs with Uthmani script. Choose a verse or follow the Teacher's recommended path.",
              },
              {
                n: "2",
                title: "Listen to the Teacher (Optional)",
                desc: "Hear professional recitation by Sheikh Mishary Al-Afasy as a reference before you begin.",
              },
              {
                n: "3",
                title: "Recite with the Microphone",
                desc: "Tap the mic and recite. The AI listens in real-time and transcribes your Arabic recitation.",
              },
              {
                n: "4",
                title: "Get Detailed Feedback",
                desc: "Receive a score, Tajweed rule analysis, Makharij diagrams, and word-level corrections.",
              },
              {
                n: "5",
                title: "Track Your Progress",
                desc: "Build your weakness profile, follow the curriculum path, and watch your accuracy grow.",
              },
            ].map(({ n, title, desc }) => (
              <li key={n} className="relative flex gap-5 sm:gap-8">
                <div className="relative z-10 flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-500 text-xl font-bold text-white shadow-lg">
                  {n}
                </div>
                <div className="pt-3">
                  <h3 className="text-xl font-bold text-gray-900">{title}</h3>
                  <p className="mt-1.5 text-sm text-gray-500 leading-relaxed">{desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────── */}
      <section className="mx-auto w-full max-w-4xl px-4 pb-20">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-600 p-8 sm:p-12 text-center text-white shadow-2xl">
          <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-white/5 blur-2xl" />
          <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-white/5 blur-2xl" />

          <div className="relative z-10">
            <Volume2 className="mx-auto mb-4 h-12 w-12 text-emerald-200" />
            <h2 className="mb-3 text-3xl font-bold sm:text-4xl">
              Ready to Improve Your Recitation?
            </h2>
            <p className="mx-auto mb-8 max-w-lg text-sm text-emerald-100 sm:text-base">
              Join the journey of mastering Quran recitation with AI-powered
                  Tajweed analysis and personalized teaching.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/recite-surah"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-sm font-bold text-emerald-700 shadow-lg transition-all hover:shadow-xl hover:scale-105 active:scale-95 sm:text-base"
              >
                <Mic className="h-5 w-5" /> Start Learning
              </Link>
              <Link
                href="/speech-to-text"
                className="inline-flex items-center gap-2 rounded-xl bg-white/20 px-7 py-3.5 text-sm font-bold text-white shadow-lg transition-all hover:bg-white/30 hover:scale-105 active:scale-95 sm:text-base backdrop-blur-sm"
              >
                <Ear className="h-5 w-5" /> Ayah Detection
              </Link>
              <Link
                href="/progress"
                className="inline-flex items-center gap-2 rounded-xl border-2 border-white/30 px-7 py-3.5 text-sm font-bold text-white transition-all hover:bg-white/10 active:scale-95 sm:text-base"
              >
                <TrendingUp className="h-5 w-5" /> Progress
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────── */}
      <footer className="border-t border-emerald-100/60 bg-white/50 py-8 text-center">
        <p className="flex items-center justify-center gap-1.5 text-sm text-gray-500">
          <BookOpen className="h-4 w-4 text-emerald-500" />
          <span>
            Made with ❤️ for the Quran —{" "}
            <span className="italic">وَرَتِّلِ ٱلْقُرْءَانَ تَرْتِيلًا</span>
          </span>
        </p>
        <p className="mt-1 text-xs text-gray-400">
          Powered by Bakemono AI · Whisper · FastAPI · Next.js · PyTorch
        </p>
      </footer>
    </main>
  );
}