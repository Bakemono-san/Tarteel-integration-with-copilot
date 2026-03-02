"use client";

import { useState, useRef, useEffect } from "react";
import { Volume2, VolumeX, Loader } from "lucide-react";

interface Props {
  text: string;
  language?: string;
  rate?: number;
  pitch?: number;
}

export default function AudioPlayer({
  text,
  language = "ar-SA",
  rate = 1,
  pitch = 1,
}: Props) {
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined")
      synthRef.current = window.speechSynthesis;
  }, []);

  const play = () => {
    if (!text || !synthRef.current) return;
    if (synthRef.current.speaking) {
      synthRef.current.cancel();
      setPlaying(false);
      return;
    }
    setLoading(true);
    const u = new SpeechSynthesisUtterance(text);
    u.lang = language;
    u.rate = rate;
    u.pitch = pitch;
    u.volume = 1;
    u.onstart = () => {
      setLoading(false);
      setPlaying(true);
    };
    u.onend = () => setPlaying(false);
    u.onerror = () => {
      setPlaying(false);
      setLoading(false);
    };
    synthRef.current.speak(u);
  };

  const stop = () => {
    synthRef.current?.cancel();
    setPlaying(false);
  };

  return (
    <button
      onClick={playing ? stop : play}
      disabled={loading || !text}
      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition sm:text-sm ${
        playing
          ? "bg-red-500 text-white hover:bg-red-600"
          : "bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
      }`}
    >
      {loading ? (
        <Loader className="h-3.5 w-3.5 animate-spin" />
      ) : playing ? (
        <VolumeX className="h-3.5 w-3.5" />
      ) : (
        <Volume2 className="h-3.5 w-3.5" />
      )}
      {loading ? "…" : playing ? "Stop" : "Listen"}
    </button>
  );
}
