"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ProgressDashboard from "@/components/ProgressDashboard";

export default function ProgressPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50/30 to-sky-50/30">
      <header className="sticky top-0 z-30 border-b border-gray-200/60 bg-white/95 backdrop-blur-md shadow-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-all hover:bg-gray-100 hover:text-gray-900 active:scale-95"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Home</span>
          </Link>
          <h1 className="text-base font-bold text-gray-900 sm:text-xl">
            📊 My Progress
          </h1>
          <div className="w-16 sm:w-20" />
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-6 sm:py-10 sm:px-6">
        <ProgressDashboard />
      </main>
    </div>
  );
}