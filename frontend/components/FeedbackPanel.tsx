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

interface FeedbackPanelProps {
  analysis: Analysis | null;
  expectedText: string;
}

export default function FeedbackPanel({
  analysis,
  expectedText,
}: FeedbackPanelProps) {
  if (!analysis) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 h-full">
        <div className="flex flex-col items-center justify-center h-full text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Award className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Waiting for Recitation
          </h3>
          <p className="text-gray-600">
            Click the microphone button to start recording your recitation.
            You'll receive instant feedback here.
          </p>
        </div>
      </div>
    );
  }

  const { tajweed } = analysis;
  const score = tajweed?.score || 0;
  const accuracy = tajweed?.accuracy || 0;

  // Determine score color
  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 75) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 90) return "bg-green-100";
    if (score >= 75) return "bg-yellow-100";
    return "bg-red-100";
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
        Analysis Results
      </h3>

      {/* Score Display */}
      <div
        className={`${getScoreBgColor(score)} rounded-xl p-6 mb-6 text-center`}
      >
        <div className={`text-6xl font-bold ${getScoreColor(score)} mb-2`}>
          {score}
        </div>
        <div className="text-lg font-semibold text-gray-700">Overall Score</div>
        <div className="text-sm text-gray-600 mt-2">
          Accuracy: {(accuracy * 100).toFixed(1)}%
        </div>
      </div>

      {/* Feedback Message */}
      <div className="bg-blue-50 rounded-lg p-4 mb-6">
        <div className="flex gap-2">
          <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-blue-900">
            {tajweed?.feedback || "Keep practicing!"}
          </p>
        </div>
      </div>

      {/* Errors Section */}
      {tajweed?.errors && tajweed.errors.length > 0 && (
        <div className="mb-6">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <XCircle className="h-5 w-5 text-red-500" />
            Errors Found ({tajweed.errors.length})
          </h4>
          <div className="space-y-2">
            {tajweed.errors.map((error, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg ${
                  error.severity === "high"
                    ? "bg-red-50 border border-red-200"
                    : "bg-yellow-50 border border-yellow-200"
                }`}
              >
                <div className="text-sm">
                  <span className="font-semibold capitalize">
                    {error.type}:
                  </span>{" "}
                  {error.type === "substitution" && (
                    <span>
                      Expected{" "}
                      <span className="arabic-text text-lg">
                        {error.expected}
                      </span>{" "}
                      but got{" "}
                      <span className="arabic-text text-lg">
                        {error.received}
                      </span>
                    </span>
                  )}
                  {error.type === "omission" && (
                    <span>
                      Missing{" "}
                      <span className="arabic-text text-lg">
                        {error.expected}
                      </span>
                    </span>
                  )}
                  {error.type === "insertion" && (
                    <span>
                      Extra{" "}
                      <span className="arabic-text text-lg">
                        {error.received}
                      </span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Corrections */}
      {tajweed?.corrections && tajweed.corrections.length > 0 && (
        <div className="mb-6">
          <h4 className="font-semibold text-gray-900 mb-3">💡 Suggestions</h4>
          <ul className="space-y-2">
            {tajweed.corrections.map((correction, index) => (
              <li key={index} className="text-sm text-gray-700 flex gap-2">
                <span className="text-emerald-500">•</span>
                <span>{correction}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Tajweed Rules Detected */}
      {tajweed?.tajweed_rules && tajweed.tajweed_rules.length > 0 && (
        <div>
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-emerald-500" />
            Tajweed Rules Detected ({tajweed.tajweed_rules.length})
          </h4>
          <div className="space-y-2">
            {tajweed.tajweed_rules.map((rule, index) => {
              // Determine color based on level
              const levelColors = {
                critical: "bg-red-50 border-red-200",
                important: "bg-blue-50 border-blue-200",
                default: "bg-emerald-50 border-emerald-200",
              };
              const textColors = {
                critical: "text-red-900",
                important: "text-blue-900",
                default: "text-emerald-900",
              };
              const colorClass =
                levelColors[rule.level as keyof typeof levelColors] ||
                levelColors.default;
              const textColor =
                textColors[rule.level as keyof typeof textColors] ||
                textColors.default;

              return (
                <div
                  key={index}
                  className={`${colorClass} p-3 rounded-lg border`}
                >
                  <div
                    className={`font-semibold ${textColor} mb-1 flex items-center gap-2 flex-wrap`}
                  >
                    {rule.level === "critical" && <span>⚠️</span>}
                    {rule.level === "important" && <span>💡</span>}
                    <span>{rule.rule}</span>
                    {rule.letter && (
                      <span className="arabic-text text-xl">
                        ({rule.letter})
                      </span>
                    )}
                    {rule.context && (
                      <span className="text-sm font-normal">
                        • {rule.context}
                      </span>
                    )}
                  </div>
                  <div className={`text-sm ${textColor} opacity-90`}>
                    {rule.description}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* No Errors - Perfect! */}
      {tajweed?.errors?.length === 0 && score >= 90 && (
        <div className="bg-green-50 rounded-lg p-6 text-center">
          <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-3" />
          <h4 className="text-xl font-bold text-green-900 mb-2">
            Excellent Work!
          </h4>
          <p className="text-green-700">
            Your recitation is very accurate. Keep up the great work!
          </p>
        </div>
      )}
    </div>
  );
}
