"use client";

import { useState, useRef, useEffect } from "react";
import { Volume2, VolumeX, Loader } from "lucide-react";

interface Props {
  surahNumber: number;
  ayahNumber: number;
  reciter?: string;
}

export default function QuranAudioPlayer({
  surahNumber,
  ayahNumber,
  reciter = "ar.alafasy",
}: Props) {
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const audioRef = useRef<HTMLAudioElement>(null);
  const url = `http://185.245.183.209:8081/api/quran/audio/${surahNumber}/${ayahNumber}?reciter=${reciter}`;

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const p = () => {
      setLoading(false);
      setPlaying(true);
    };
    const s = () => setPlaying(false);
    const e = () => {
      setError("Audio unavailable");
      setLoading(false);
      setPlaying(false);
    };
    a.addEventListener("play", p);
    a.addEventListener("pause", s);
    a.addEventListener("ended", s);
    a.addEventListener("error", e);
    return () => {
      a.removeEventListener("play", p);
      a.removeEventListener("pause", s);
      a.removeEventListener("ended", s);
      a.removeEventListener("error", e);
    };
  }, []);

  const toggle = async () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
      return;
    }
    setLoading(true);
    setError("");
    try {
      await audioRef.current.play();
    } catch {
      setError("Play failed");
      setLoading(false);
    }
  };

  return (
    <>
      <audio ref={audioRef} src={url} crossOrigin="anonymous" />
      <button
        onClick={toggle}
        disabled={loading}
        className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition sm:text-sm ${
          playing
            ? "bg-red-500 text-white hover:bg-red-600"
            : "bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
        }`}
        title={playing ? "Stop" : "Play recitation"}
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
      {error && <p className="text-xs text-red-500">{error}</p>}
    </>
  );
}
