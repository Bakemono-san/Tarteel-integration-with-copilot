"use client";

import { CheckCircle, XCircle, AlertCircle, Award } from "lucide-react";

interface TajweedRule {
  rule: string;
  letter?: string;
  context?: string;
  status: string;
  description: string;
  level?: string;
}
interface Error {
  type: string;
  position: number;
  expected: string;
  received: string;
  severity: string;
}
interface TajweedAnalysis {
  accuracy: number;
  errors: Error[];
  tajweed_rules: TajweedRule[];
  feedback: string;
  score: number;
  corrections: string[];
}
interface Analysis {
  transcription: string;
  confidence: number;
  tajweed: TajweedAnalysis;
  expected: string;
}
interface Props {
  analysis: Analysis | null;
  expectedText: string;
}

export default function FeedbackPanel({ analysis }: Props) {
  if (!analysis) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-lg lg:min-h-0 lg:h-full">
        <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 sm:h-20 sm:w-20">
          <Award className="h-8 w-8 text-gray-300 sm:h-10 sm:w-10" />
        </div>
        <h3 className="text-base font-bold sm:text-lg">
          Waiting for Recitation
        </h3>
        <p className="mt-1 max-w-xs text-xs text-gray-500 sm:text-sm">
          Tap the microphone to start. Feedback will appear here.
        </p>
      </div>
    );
  }

  const { tajweed } = analysis;
  const score = tajweed?.score ?? 0;
  const accuracy = tajweed?.accuracy ?? 0;

  const scoreBg =
    score >= 90 ? "bg-emerald-50" : score >= 75 ? "bg-amber-50" : "bg-red-50";
  const scoreText =
    score >= 90
      ? "text-emerald-600"
      : score >= 75
        ? "text-amber-600"
        : "text-red-600";

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-lg sm:p-8 space-y-5">
      <h3 className="text-center text-lg font-bold sm:text-xl">Analysis</h3>

      {/* Score */}
      <div className={`rounded-xl p-5 text-center ${scoreBg}`}>
        <div
          className={`text-5xl font-extrabold score-pop sm:text-6xl ${scoreText}`}
        >
          {score}
        </div>
        <p className="mt-1 text-sm font-medium text-gray-600">Overall Score</p>
        <p className="text-xs text-gray-500">
          Accuracy {(accuracy * 100).toFixed(1)}%
        </p>
      </div>

      {/* Feedback */}
      <div className="flex gap-2 rounded-lg border border-sky-200 bg-sky-50 p-3 text-sm">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" />
        <p className="text-sky-900">
          {tajweed?.feedback || "Keep practising!"}
        </p>
      </div>

      {/* Errors */}
      {tajweed?.errors?.length > 0 && (
        <div>
          <h4 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-red-700">
            <XCircle className="h-4 w-4" /> Errors ({tajweed.errors.length})
          </h4>
          <div className="space-y-2">
            {tajweed.errors.map((e, i) => (
              <div
                key={i}
                className={`rounded-lg border p-3 text-sm ${e.severity === "high" ? "border-red-200 bg-red-50" : "border-amber-200 bg-amber-50"}`}
              >
                <span className="font-semibold capitalize">{e.type}: </span>
                {e.type === "substitution" && (
                  <>
                    Expected{" "}
                    <span className="font-semibold" dir="rtl">
                      {e.expected}
                    </span>{" "}
                    → got{" "}
                    <span className="font-semibold" dir="rtl">
                      {e.received}
                    </span>
                  </>
                )}
                {e.type === "omission" && (
                  <>
                    Missing{" "}
                    <span className="font-semibold" dir="rtl">
                      {e.expected}
                    </span>
                  </>
                )}
                {e.type === "insertion" && (
                  <>
                    Extra{" "}
                    <span className="font-semibold" dir="rtl">
                      {e.received}
                    </span>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Corrections */}
      {tajweed?.corrections?.length > 0 && (
        <div>
          <h4 className="mb-2 text-sm font-semibold">💡 Suggestions</h4>
          <ul className="space-y-1 text-sm text-gray-700">
            {tajweed.corrections.map((c, i) => (
              <li key={i} className="flex gap-1.5">
                <span className="text-emerald-500">•</span>
                {c}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Tajweed rules */}
      {tajweed?.tajweed_rules?.length > 0 && (
        <div>
          <h4 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-emerald-700">
            <CheckCircle className="h-4 w-4" /> Tajweed Rules (
            {tajweed.tajweed_rules.length})
          </h4>
          <div className="space-y-2">
            {tajweed.tajweed_rules.map((r, i) => {
              const bg =
                r.level === "critical"
                  ? "bg-red-50 border-red-200"
                  : r.level === "important"
                    ? "bg-sky-50 border-sky-200"
                    : "bg-emerald-50 border-emerald-200";
              return (
                <div key={i} className={`rounded-lg border p-3 ${bg}`}>
                  <p className="text-sm font-semibold">
                    {r.level === "critical" && "⚠️ "}
                    {r.level === "important" && "💡 "}
                    {r.rule} {r.letter && <span dir="rtl">({r.letter})</span>}
                    {r.context && (
                      <span className="ml-1 font-normal text-gray-500">
                        · {r.context}
                      </span>
                    )}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-600">
                    {r.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Perfect */}
      {tajweed?.errors?.length === 0 && score >= 90 && (
        <div className="rounded-xl bg-emerald-50 p-5 text-center">
          <CheckCircle className="mx-auto mb-2 h-12 w-12 text-emerald-500" />
          <h4 className="font-bold text-emerald-800">Excellent!</h4>
          <p className="text-sm text-emerald-700">
            Very accurate recitation. Keep it up!
          </p>
        </div>
      )}
    </div>
  );
}
