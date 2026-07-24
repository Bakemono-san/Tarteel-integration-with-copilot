"use client";

import { useState } from "react";
import { CheckCircle, XCircle, AlertCircle, Award, Info, HelpCircle } from "lucide-react";
import MakhrajDiagram from "./MakhrajDiagram";

interface TajweedRule {
  rule: string;
  rule_id?: string;
  letter?: string;
  context?: string;
  status: string;
  description: string;
  level?: string;
  user_produced?: string;
  expected_letter?: string;
  asr_confidence?: number | null;
  confidence_level?: string;
}
interface Error {
  type: string;
  position: number;
  expected: string;
  received: string;
  severity: string;
  confidence_level?: string;
  asr_confidence?: number | null;
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
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);

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
    score >= 90 ? "bg-emerald-50 border-emerald-200" :
    score >= 75 ? "bg-amber-50 border-amber-200" :
    "bg-red-50 border-red-200";
  const scoreText =
    score >= 90 ? "text-emerald-600" :
    score >= 75 ? "text-amber-600" :
    "text-red-600";

  const incorrectRules = tajweed?.tajweed_rules?.filter(
    r => r.status === "applied_incorrectly" || r.status === "not_applied"
  ) || [];
  const correctRules = tajweed?.tajweed_rules?.filter(
    r => r.status === "applied_correctly"
  ) || [];

  const lowConfErrors = tajweed?.errors?.filter(
    e => e.confidence_level === "low"
  ) || [];

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-lg sm:p-8 space-y-5">
      <h3 className="text-center text-lg font-bold sm:text-xl">
        <span className="text-emerald-600">📊</span> Analysis
      </h3>

      {/* Score */}
      <div className={`rounded-xl p-5 text-center border-2 ${scoreBg}`}>
        <div className={`text-5xl font-extrabold score-pop sm:text-6xl ${scoreText}`}>
          {score}
        </div>
        <p className="mt-1 text-sm font-medium text-gray-600">Overall Score</p>
        <p className="text-xs text-gray-500">
          Accuracy {(accuracy * 100).toFixed(1)}%
        </p>
      </div>

      {/* Feedback */}
      {tajweed?.feedback && (
        <div className="flex gap-2 rounded-lg border border-sky-200 bg-sky-50 p-3 text-sm">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" />
          <p className="text-sky-900">{tajweed.feedback}</p>
        </div>
      )}

      {/* Low confidence warning */}
      {lowConfErrors.length > 0 && (
        <div className="flex gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs">
          <HelpCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <p className="text-amber-800">
            ⚠️ {lowConfErrors.length} error(s) have low ASR confidence
            (may be transcription artifacts rather than actual mistakes).
          </p>
        </div>
      )}

      {/* Errors with confidence levels */}
      {tajweed?.errors?.length > 0 && (
        <div>
          <h4 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-red-700">
            <XCircle className="h-4 w-4" /> Errors ({tajweed.errors.length})
          </h4>
          <div className="space-y-2">
            {tajweed.errors.map((e, i) => {
              const confLevel = e.confidence_level || "unknown";
              const isLowConf = confLevel === "low";
              return (
                <div
                  key={i}
                  className={`rounded-lg border p-3 text-sm ${
                    isLowConf
                      ? "border-amber-200 bg-amber-50/50 opacity-70"
                      : e.severity === "high"
                        ? "border-red-200 bg-red-50"
                        : "border-amber-200 bg-amber-50"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold capitalize">{e.type}</span>
                    {isLowConf && (
                      <span className="rounded bg-amber-200 px-1.5 py-0.5 text-[10px] font-medium text-amber-800">
                        low confidence
                      </span>
                    )}
                    {confLevel === "high" && (
                      <span className="rounded bg-emerald-200 px-1.5 py-0.5 text-[10px] font-medium text-emerald-800">
                        confirmed
                      </span>
                    )}
                  </div>
                  {e.type === "substitution" && (
                    <span>
                      Expected{" "}
                      <span className="font-semibold" dir="rtl">{e.expected}</span>
                      {" → "}got{" "}
                      <span className="font-semibold" dir="rtl">{e.received}</span>
                      <button
                        onClick={() => setSelectedLetter(e.expected)}
                        className="ml-2 rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] text-emerald-700 hover:bg-emerald-200 transition"
                      >
                        Show Makhraj
                      </button>
                    </span>
                  )}
                  {e.type === "omission" && (
                    <span>
                      Missing{" "}
                      <span className="font-semibold" dir="rtl">{e.expected}</span>
                      <button
                        onClick={() => setSelectedLetter(e.expected)}
                        className="ml-2 rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] text-emerald-700 hover:bg-emerald-200 transition"
                      >
                        Show Makhraj
                      </button>
                    </span>
                  )}
                  {e.type === "insertion" && (
                    <span>
                      Extra{" "}
                      <span className="font-semibold" dir="rtl">{e.received}</span>
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Makhraj diagram modal */}
      {selectedLetter && (
        <MakhrajDiagram
          letter={selectedLetter}
          onClose={() => setSelectedLetter(null)}
        />
      )}

      {/* Tajweed rules: incorrect */}
      {incorrectRules.length > 0 && (
        <div>
          <h4 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-orange-700">
            <AlertCircle className="h-4 w-4" /> Needs Work ({incorrectRules.length})
          </h4>
          <div className="space-y-2">
            {incorrectRules.map((r, i) => (
              <div
                key={i}
                className={`rounded-lg border p-3 ${
                  r.level === "critical"
                    ? "bg-red-50 border-red-200"
                    : "bg-amber-50 border-amber-200"
                }`}
              >
                <p className="text-sm font-semibold">
                  {r.level === "critical" && "⚠️ "}
                  {r.rule}
                  {r.context && (
                    <span className="ml-1 font-normal text-gray-500">
                      · {r.context}
                    </span>
                  )}
                </p>
                <p className="mt-0.5 text-xs text-gray-600">{r.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tajweed rules: correct */}
      {correctRules.length > 0 && (
        <div>
          <h4 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-emerald-700">
            <CheckCircle className="h-4 w-4" /> Applied Correctly ({correctRules.length})
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {correctRules.map((r, i) => (
              <span
                key={i}
                className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700"
              >
                {r.rule}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Corrections */}
      {tajweed?.corrections?.length > 0 && (
        <div>
          <h4 className="mb-2 text-sm font-semibold flex items-center gap-1.5">
            <Info className="h-4 w-4 text-emerald-600" />
            Suggestions
          </h4>
          <ul className="space-y-1.5 text-sm text-gray-700">
            {tajweed.corrections.map((c, i) => {
              const isLowConf = c.startsWith("[Low confidence");
              return (
                <li
                  key={i}
                  className={`flex gap-1.5 p-2 rounded-lg ${
                    isLowConf ? "bg-amber-50/50 text-amber-700" : ""
                  }`}
                >
                  <span className={`${isLowConf ? "text-amber-400" : "text-emerald-500"}`}>
                    {isLowConf ? "○" : "•"}
                  </span>
                  {c}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Perfect */}
      {tajweed?.errors?.length === 0 && score >= 90 && (
        <div className="rounded-xl bg-emerald-50 border-2 border-emerald-200 p-5 text-center">
          <CheckCircle className="mx-auto mb-2 h-12 w-12 text-emerald-500" />
          <h4 className="font-bold text-emerald-800">Masha&apos;Allah! Excellent!</h4>
          <p className="text-sm text-emerald-700">
            Very accurate recitation. Keep it up!
          </p>
        </div>
      )}
    </div>
  );
}