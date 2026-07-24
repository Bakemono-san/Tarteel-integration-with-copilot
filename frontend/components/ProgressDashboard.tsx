"use client";

import { useEffect, useState } from "react";
import { Award, TrendingUp, BookOpen, AlertTriangle, Star, Loader } from "lucide-react";
import { apiFetch } from "@/lib/utils";

interface Weakness {
  rule: string;
  total_attempts: number;
  correct_attempts: number;
  accuracy: number;
  needs_practice: boolean;
}

interface TrendPoint {
  date: string;
  avg_accuracy: number;
  count: number;
}

interface SurahProgress {
  surah_number: number;
  ayahs_practiced: number;
  total_ayahs: number;
  best_accuracy: number;
  last_practiced: string;
}

interface CurriculumTier {
  title_en: string;
  focus_rules: string[];
  mastery_required: number;
}

export default function ProgressDashboard() {
  const [weaknesses, setWeaknesses] = useState<Weakness[]>([]);
  const [trend, setTrend] = useState<TrendPoint[]>([]);
  const [surahs, setSurahs] = useState<SurahProgress[]>([]);
  const [currentTier, setCurrentTier] = useState<CurriculumTier | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiFetch("/api/progress/weakness-profile").then(r => r.json()),
      apiFetch("/api/progress/trend?days=30").then(r => r.json()),
      apiFetch("/api/progress/surahs").then(r => r.json()),
      apiFetch("/api/curriculum/current").then(r => r.json()),
    ])
      .then(([weakData, trendData, surahData, tierData]) => {
        setWeaknesses(weakData.profile || []);
        setTrend(trendData.trend || []);
        setSurahs(surahData.surahs || []);
        setCurrentTier(tierData);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  const worstRules = weaknesses.filter(w => w.needs_practice).slice(0, 5);
  const avgAccuracy = weaknesses.length > 0
    ? weaknesses.reduce((s, w) => s + w.accuracy, 0) / weaknesses.length
    : 0;
  const recentTrend = trend.length >= 2
    ? trend[trend.length - 1].avg_accuracy - trend[0].avg_accuracy
    : 0;

  return (
    <div className="space-y-6">
      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-4 shadow-sm">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100">
              <Award className="h-4 w-4 text-emerald-600" />
            </div>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Overall
            </span>
          </div>
          <p className="text-2xl font-bold text-emerald-700">
            {(avgAccuracy * 100).toFixed(0)}%
          </p>
          <p className="text-xs text-gray-400">Average Tajweed accuracy</p>
        </div>

        <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-4 shadow-sm">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </div>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Trend
            </span>
          </div>
          <p className={`text-2xl font-bold ${recentTrend >= 0 ? "text-emerald-600" : "text-red-600"}`}>
            {recentTrend >= 0 ? "+" : ""}{(recentTrend * 100).toFixed(0)}%
          </p>
          <p className="text-xs text-gray-400">Over last 30 days</p>
        </div>

        <div className="rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 to-white p-4 shadow-sm">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100">
              <BookOpen className="h-4 w-4 text-amber-600" />
            </div>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Surahs
            </span>
          </div>
          <p className="text-2xl font-bold text-amber-700">
            {surahs.length}
          </p>
          <p className="text-xs text-gray-400">Surahs practiced</p>
        </div>
      </div>

      {/* Weakest Rules */}
      {worstRules.length > 0 && (
        <div className="rounded-2xl border border-red-100 bg-white p-5 shadow-sm">
          <h3 className="flex items-center gap-2 text-sm font-bold text-red-700 mb-3">
            <AlertTriangle className="h-4 w-4" />
            Needs Practice
          </h3>
          <div className="space-y-3">
            {worstRules.map((w, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xs font-bold text-gray-400 w-5">{i + 1}.</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800">{w.rule}</p>
                  <div className="mt-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        w.accuracy < 0.3
                          ? "bg-red-500"
                          : w.accuracy < 0.5
                            ? "bg-orange-500"
                            : "bg-amber-500"
                      }`}
                      style={{ width: `${w.accuracy * 100}%` }}
                    />
                  </div>
                </div>
                <span className="text-sm font-semibold text-gray-600 w-12 text-right">
                  {(w.accuracy * 100).toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Accuracy Trend */}
      {trend.length > 1 && (
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <h3 className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
            <TrendingUp className="h-4 w-4 text-emerald-600" />
            Accuracy Trend (30 days)
          </h3>
          <div className="h-24 flex items-end gap-1">
            {trend.map((t, i) => {
              const h = Math.max(t.avg_accuracy * 80, 4);
              const isLast = i === trend.length - 1;
              return (
                <div
                  key={i}
                  className="group relative flex-1"
                >
                  <div
                    className={`w-full rounded-t transition-all ${
                      isLast ? "bg-emerald-500" : "bg-emerald-300"
                    }`}
                    style={{ height: `${h}px` }}
                  />
                  <div className="invisible group-hover:visible absolute bottom-full left-1/2 -translate-x-1/2 mb-1 w-32 rounded-lg bg-gray-800 px-2 py-1 text-xs text-white text-center shadow-lg">
                    {t.date}: {(t.avg_accuracy * 100).toFixed(0)}%
                    <br />
                    {t.count} ayahs
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Current Curriculum Tier */}
      {currentTier && (
        <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-5 shadow-sm">
          <h3 className="flex items-center gap-2 text-sm font-bold text-emerald-700 mb-2">
            <Star className="h-4 w-4" />
            Current Focus
          </h3>
          <p className="text-base font-semibold text-gray-800 mb-1">
            {currentTier.title_en}
          </p>
          <p className="text-xs text-gray-500 mb-2">
            Focus rules: {currentTier.focus_rules?.join(", ")}
          </p>
          <p className="text-xs text-gray-400">
            Mastery required: {(currentTier.mastery_required * 100).toFixed(0)}%
          </p>
        </div>
      )}

      {/* Surah Progress */}
      {surahs.length > 0 && (
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-bold text-gray-700 mb-3">Surah Progress</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {surahs.slice(0, 10).map((s, i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                <span className="w-8 text-xs font-bold text-gray-400">
                  {s.surah_number}.
                </span>
                <div className="flex-1 min-w-0">
                  <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-emerald-400"
                      style={{
                        width: `${(s.ayahs_practiced / Math.max(s.total_ayahs, 1)) * 100}%`,
                      }}
                    />
                  </div>
                </div>
                <span className="text-xs text-gray-500 w-16 text-right">
                  {s.ayahs_practiced}/{s.total_ayahs}
                </span>
                <span className="text-xs font-semibold text-emerald-600 w-10 text-right">
                  {(s.best_accuracy * 100).toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}