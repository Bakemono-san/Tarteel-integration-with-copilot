"use client";

import { useEffect, useState } from "react";
import { X, Loader } from "lucide-react";

interface MakhrajData {
  letter: string;
  makhraj: {
    area: string;
    name_ar: string;
    name_en: string;
    description: string;
    detail?: string;
    makhraj_name?: string;
    tongue_pos?: string;
    tafkheem?: boolean | string;
  };
  sifat: Array<{
    name: string;
    meaning: string;
  }>;
}

interface Props {
  letter: string;
  onClose: () => void;
}

const TONGUE_POSITIONS: Record<string, { x: number; y: number; label: string }> = {
  deep_back: { x: 120, y: 60, label: "Deep back of tongue" },
  deep_back_slightly_forward: { x: 140, y: 65, label: "Back of tongue (slightly forward)" },
  middle: { x: 180, y: 70, label: "Middle of tongue" },
  side: { x: 200, y: 75, label: "Side of tongue" },
  front_tip_upper_gum: { x: 240, y: 80, label: "Front tip, upper gum" },
  tip_upper_gum_back: { x: 250, y: 85, label: "Tip, upper gum (slightly back)" },
  tip_upper_gum_repeated: { x: 260, y: 85, label: "Tip, upper gum (repeated)" },
  tip_base_upper_incisors: { x: 270, y: 90, label: "Tip, base of upper incisors" },
  tip_between_incisors: { x: 280, y: 95, label: "Tip between incisors" },
  tip_between_incisors_thickness: { x: 280, y: 100, label: "Tip between incisors (thick)" },
  inner_lower_lip_upper_incisors: { x: 290, y: 130, label: "Inner lip, upper incisors" },
  both_lips: { x: 310, y: 140, label: "Both lips" },
};

export default function MakhrajDiagram({ letter, onClose }: Props) {
  const [data, setData] = useState<MakhrajData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/tajweed/makhraj/${letter}`)
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [letter]);

  const pos = data?.makhraj?.tongue_pos
    ? TONGUE_POSITIONS[data.makhraj.tongue_pos]
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="relative max-w-lg w-full rounded-2xl bg-white p-6 shadow-2xl animate-in zoom-in-95">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
        >
          <X className="h-5 w-5" />
        </button>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader className="h-8 w-8 animate-spin text-emerald-600" />
          </div>
        ) : data ? (
          <div className="space-y-5">
            <div className="text-center">
              <div
                className="mx-auto mb-2 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-50 text-4xl font-bold text-emerald-900 shadow-inner"
                dir="rtl"
              >
                {letter}
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                Makhraj of <span dir="rtl" className="text-emerald-700">{letter}</span>
              </h3>
            </div>

            {/* SVG Mouth Diagram */}
            <div className="relative mx-auto w-full max-w-xs">
              <svg viewBox="0 0 340 200" className="w-full h-auto">
                {/* Profile face outline */}
                <path
                  d="M 310 0 L 310 40 Q 310 80 290 110 Q 270 140 240 160 Q 200 185 160 195 Q 120 200 80 195 Q 40 185 20 160 Q 5 140 5 110 L 5 40 Q 5 0 30 0 Z"
                  fill="#f8fafc"
                  stroke="#cbd5e1"
                  strokeWidth="2"
                />
                {/* Oral cavity */}
                <path
                  d="M 290 40 Q 280 90 250 130 Q 220 160 180 170 Q 140 175 100 170 Q 60 160 35 130 Q 20 100 30 60 Z"
                  fill="#f1f5f9"
                  stroke="#94a3b8"
                  strokeWidth="1.5"
                />
                {/* Tongue */}
                <path
                  d="M 120 170 Q 140 160 160 155 Q 200 145 240 135 Q 270 125 290 110 Q 300 100 295 90 Q 290 80 280 85 Q 260 95 230 105 Q 200 115 170 120 Q 140 125 120 130 Z"
                  fill="#fecaca"
                  stroke="#ef4444"
                  strokeWidth="1.5"
                  opacity="0.7"
                />
                {/* Highlight position */}
                {pos && (
                  <>
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r="12"
                      fill="#10b981"
                      opacity="0.3"
                      className="animate-ping"
                    />
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r="8"
                      fill="#10b981"
                      opacity="0.8"
                    />
                    <text
                      x={pos.x}
                      y={pos.y - 18}
                      textAnchor="middle"
                      className="text-[9px] fill-emerald-700 font-medium"
                    >
                      {pos.label}
                    </text>
                  </>
                )}
                {/* Labels */}
                <text x="20" y="30" className="text-[10px] fill-gray-400 font-medium">
                  Nose
                </text>
                <text x="150" y="195" className="text-[10px] fill-gray-400 font-medium">
                  Tongue
                </text>
                <text x="290" y="165" className="text-[10px] fill-gray-400 font-medium">
                  Lips
                </text>
                <text x="30" y="85" className="text-[10px] fill-gray-400 font-medium">
                  Throat
                </text>
              </svg>
            </div>

            {/* Makhraj Details */}
            <div className="rounded-xl bg-gray-50 p-4 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-700 min-w-[90px]">
                  Area:
                </span>
                <span className="text-sm text-gray-900" dir="rtl">
                  {data.makhraj.name_ar || data.makhraj.area}
                </span>
                <span className="text-sm text-gray-500">
                  ({data.makhraj.name_en || data.makhraj.makhraj_name || data.makhraj.area})
                </span>
              </div>
              {data.makhraj.detail && (
                <div className="flex items-start gap-2">
                  <span className="text-sm font-semibold text-gray-700 min-w-[90px] shrink-0">
                    Detail:
                  </span>
                  <span className="text-sm text-gray-600">
                    {data.makhraj.detail}
                  </span>
                </div>
              )}
              {typeof data.makhraj.tafkheem === "boolean" && (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-700 min-w-[90px]">
                    Tafkheem:
                  </span>
                  <span className={`text-sm font-medium ${data.makhraj.tafkheem ? "text-orange-600" : "text-blue-600"}`}>
                    {data.makhraj.tafkheem ? "Heavy (مفخم)" : "Light (مرقق)"}
                  </span>
                </div>
              )}
            </div>

            {/* Sifat (Attributes) */}
            {data.sifat?.length > 0 && (
              <div>
                <h4 className="mb-2 text-sm font-semibold text-gray-700">
                  Sifat (Attributes)
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {data.sifat.map((s, i) => (
                    <span
                      key={i}
                      className="group relative rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700 border border-sky-200 cursor-help"
                    >
                      {s.name}
                      <span className="invisible group-hover:visible absolute bottom-full left-1/2 -translate-x-1/2 mb-1 w-48 rounded-lg bg-gray-800 px-2 py-1.5 text-xs text-white text-center shadow-lg z-10">
                        {s.meaning}
                      </span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="py-12 text-center text-sm text-gray-500">
            Could not load makhraj data for &quot;{letter}&quot;.
          </div>
        )}
      </div>
    </div>
  );
}