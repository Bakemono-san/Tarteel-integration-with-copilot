"use client";

import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Mic, MicOff } from "lucide-react";
import AyahDisplay from "./AyahDisplay";
import FeedbackPanel from "./FeedbackPanel";
import AudioVisualizer from "./AudioVisualizer";
import { useRecitationWebSocket } from "@/lib/useRecitationWebSocket";

interface Props {
  surahNumber: number;
  ayahNumber: number;
  onBack: () => void;
}

export default function RecitationInterface({
  surahNumber,
  ayahNumber,
  onBack,
}: Props) {
  const [isRecording, setIsRecording] = useState(false);
  const [ayahText, setAyahText] = useState("");
  const [surahName, setSurahName] = useState("");
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const { analysis, isConnected, sendAudioData, resetAnalysis } =
    useRecitationWebSocket();

  useEffect(() => {
    fetchAyahData();
    resetAnalysis();
  }, [surahNumber, ayahNumber]);

  const fetchAyahData = async () => {
    try {
      const res = await fetch(
        `http://localhost:8000/api/quran/ayah/${surahNumber}/${ayahNumber}`,
      );
      const data = await res.json();
      setAyahText(data.text || "");
      setSurahName(data.surahEnglishName || "");
    } catch {
      if (surahNumber === 1 && ayahNumber === 1) {
        setAyahText("بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ");
        setSurahName("Al-Fatihah");
      }
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMediaStream(stream);
      const mimeType = MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : "audio/ogg";
      const mr = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mr;
      audioChunksRef.current = [];

      mr.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      mr.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        await sendAudioForAnalysis(blob);
        stream.getTracks().forEach((t) => t.stop());
        setMediaStream(null);
      };
      mr.start(1000);
      setIsRecording(true);
      resetAnalysis();
    } catch {
      alert("Could not access microphone. Please grant permission.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const sendAudioForAnalysis = async (blob: Blob) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const b64 = reader.result?.toString().split(",")[1] || "";
      sendAudioData(b64, surahNumber, ayahNumber);
    };
    reader.readAsDataURL(blob);
  };

  return (
    <div className="mx-auto max-w-5xl">
      <button
        onClick={onBack}
        className="mb-5 flex items-center gap-1.5 text-sm text-gray-500 transition hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" /> Choose different Ayah
      </button>

      {/* Two-column on lg, stack on mobile */}
      <div className="grid gap-5 lg:grid-cols-2">
        {/* Left */}
        <div className="space-y-5">
          <AyahDisplay
            surahNumber={surahNumber}
            ayahNumber={ayahNumber}
            surahName={surahName}
            ayahText={ayahText}
            transcription={analysis?.transcription}
            errors={analysis?.tajweed?.errors || []}
          />

          {/* Recording card */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-lg text-center sm:p-8">
            <h3 className="mb-4 text-base font-bold sm:text-lg">
              {isRecording ? "🎤 Recording…" : "Ready to Recite"}
            </h3>

            <span
              className={`inline-flex items-center gap-1.5 text-xs ${isConnected ? "text-emerald-600" : "text-red-500"}`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${isConnected ? "bg-emerald-500" : "bg-red-500"}`}
              />
              {isConnected ? "Connected" : "Connecting…"}
            </span>

            <div className="relative my-5">
              <AudioVisualizer isRecording={isRecording} stream={mediaStream} />
            </div>

            <button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={!isConnected}
              className={`mx-auto flex h-24 w-24 items-center justify-center rounded-full shadow-xl transition-all active:scale-95 sm:h-28 sm:w-28 ${
                isRecording
                  ? "bg-red-500 recording-pulse"
                  : "bg-emerald-600 hover:bg-emerald-700"
              } disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              {isRecording ? (
                <MicOff className="h-10 w-10 text-white" />
              ) : (
                <Mic className="h-10 w-10 text-white" />
              )}
            </button>

            <p className="mt-3 text-xs text-gray-500 sm:text-sm">
              {isRecording ? "Tap to stop" : "Tap to start"}
            </p>
          </div>
        </div>

        {/* Right — feedback */}
        <FeedbackPanel analysis={analysis} expectedText={ayahText} />
      </div>
    </div>
  );
}
