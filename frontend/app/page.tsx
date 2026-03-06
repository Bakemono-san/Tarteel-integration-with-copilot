import Link from "next/link";
import { BookOpen, Mic, TrendingUp, Volume2 } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* ── Header ─────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-gray-200/60 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-2.5 sm:flex-nowrap sm:gap-3 sm:py-4">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <BookOpen className="h-6 w-6 text-emerald-600" />
            <span className="text-lg font-bold sm:text-xl">
              Quran&nbsp;Recitation
            </span>
          </Link>

          <nav className="flex w-full items-center gap-1.5 sm:w-auto sm:gap-2">
            <Link
              href="/recitation"
              className="flex-1 rounded-full bg-emerald-600 px-2.5 py-1.5 text-center text-[11px] font-semibold text-white transition hover:bg-emerald-700 sm:flex-none sm:px-4 sm:py-2 sm:text-sm"
            >
              Recite
            </Link>
            <Link
              href="/recite-surah"
              className="flex-1 rounded-full bg-purple-600 px-2.5 py-1.5 text-center text-[11px] font-semibold text-white transition hover:bg-purple-700 sm:flex-none sm:px-4 sm:py-2 sm:text-sm"
            >
              Surah
            </Link>
            <Link
              href="/speech-to-text"
              className="flex-1 rounded-full bg-sky-600 px-2.5 py-1.5 text-center text-[11px] font-semibold text-white transition hover:bg-sky-700 sm:flex-none sm:px-4 sm:py-2 sm:text-sm"
            >
              Ayah Detection
            </Link>
          </nav>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────── */}
      <section className="flex flex-1 flex-col items-center justify-center px-4 py-14 text-center sm:py-24">
        <span className="mb-4 inline-block rounded-full bg-emerald-100 px-4 py-1 text-xs font-semibold text-emerald-800 sm:text-sm">
          ✨ Powered by Tarteel AI
        </span>

        <h1 className="max-w-3xl text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl text-balance">
          Master Your <span className="text-emerald-600">Quran</span> Recitation
        </h1>

        <p className="mt-4 max-w-xl text-base text-gray-600 sm:text-lg">
          Real-time Tajweed analysis, pronunciation feedback, and guided Surah
          recitation — all in one place.
        </p>

        <p
          className="mt-6 text-2xl font-semibold text-emerald-700 sm:text-3xl"
          dir="rtl"
        >
          بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/recite-surah"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/25 transition hover:bg-emerald-700 sm:text-base"
          >
            <Mic className="h-5 w-5" /> Start Reciting
          </Link>
          <Link
            href="/speech-to-text"
            className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-emerald-600 bg-white px-6 py-3 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50 sm:text-base"
          >
            <Volume2 className="h-5 w-5" /> Ayah Detection Mode
          </Link>
        </div>
      </section>

      {/* ── Features ───────────────────────────────── */}
      <section className="mx-auto w-full max-w-6xl px-4 py-14 sm:py-20">
        <h2 className="mb-10 text-center text-2xl font-bold sm:text-3xl">
          Features
        </h2>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {/* Real-time Recognition */}
          <div className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:shadow-lg sm:p-8">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 transition group-hover:bg-emerald-600 sm:h-14 sm:w-14">
              <Mic className="h-6 w-6 text-emerald-600 transition group-hover:text-white sm:h-7 sm:w-7" />
            </div>
            <h3 className="mb-2 text-lg font-bold sm:text-xl">
              Real-time Recognition
            </h3>
            <p className="text-sm leading-relaxed text-gray-600 sm:text-base">
              Advanced Arabic speech recognition with instant transcription
              powered by Tarteel AI.
            </p>
          </div>

          {/* Tajweed Analysis */}
          <div className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:shadow-lg sm:p-8">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-sky-100 transition group-hover:bg-sky-600 sm:h-14 sm:w-14">
              <BookOpen className="h-6 w-6 text-sky-600 transition group-hover:text-white sm:h-7 sm:w-7" />
            </div>
            <h3 className="mb-2 text-lg font-bold sm:text-xl">
              Tajweed Analysis
            </h3>
            <p className="text-sm leading-relaxed text-gray-600 sm:text-base">
              Comprehensive rule detection — Qalqalah, Ghunna, Madd, Idgham and
              more.
            </p>
          </div>

          {/* Progress Tracking */}
          <div className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:shadow-lg sm:p-8">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 transition group-hover:bg-purple-600 sm:h-14 sm:w-14">
              <TrendingUp className="h-6 w-6 text-purple-600 transition group-hover:text-white sm:h-7 sm:w-7" />
            </div>
            <h3 className="mb-2 text-lg font-bold sm:text-xl">
              Progress Tracking
            </h3>
            <p className="text-sm leading-relaxed text-gray-600 sm:text-base">
              Instant accuracy scores and detailed corrections to improve with
              every session.
            </p>
          </div>
        </div>
      </section>

      {/* ── How it works ───────────────────────────── */}
      <section className="mx-auto w-full max-w-3xl px-4 py-14 sm:py-20">
        <h2 className="mb-10 text-center text-2xl font-bold sm:text-3xl">
          How It Works
        </h2>

        <ol className="space-y-6">
          {[
            {
              n: "1",
              title: "Select a Surah",
              desc: "Select any Surah and Ayah you want to detect.",
            },
            {
              n: "2",
              title: "Start Reciting",
              desc: "Tap the microphone and recite with proper Tajweed.",
            },
            {
              n: "3",
              title: "Get Instant Feedback",
              desc: "Receive real-time analysis with accuracy scores.",
            },
            {
              n: "4",
              title: "Improve & Repeat",
              desc: "Repeat until you achieve mastery.",
            },
          ].map(({ n, title, desc }) => (
            <li key={n} className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white sm:h-11 sm:w-11 sm:text-base">
                {n}
              </div>
              <div>
                <h3 className="font-bold sm:text-lg">{title}</h3>
                <p className="text-sm text-gray-600 sm:text-base">{desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* ── CTA ────────────────────────────────────── */}
      <section className="mx-auto w-full max-w-3xl px-4 pb-14 sm:pb-20">
        <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-sky-600 p-8 text-center text-white shadow-xl sm:p-12">
          <Volume2 className="mx-auto mb-4 h-12 w-12 opacity-80 sm:h-14 sm:w-14" />
          <h2 className="mb-2 text-2xl font-bold sm:text-3xl">
            Try Speech‑to‑Text
          </h2>
          <p className="mx-auto mb-6 max-w-md text-sm text-indigo-100 sm:text-base">
            Detect Arabic pronunciation and convert your voice to text in
            real-time.
          </p>
          <Link
            href="/speech-to-text"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-indigo-600 shadow transition hover:bg-gray-50 sm:text-base"
          >
            <Volume2 className="h-5 w-5" /> Start Ayah Detection
          </Link>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────── */}
      <footer className="border-t border-gray-200/60 bg-white/60 py-6 text-center text-sm text-gray-500">
        <p>Powered by Tarteel AI Open Source Models</p>
        <p className="mt-1 text-xs">Built with Next.js · FastAPI · PyTorch</p>
      </footer>
    </main>
  );
}
