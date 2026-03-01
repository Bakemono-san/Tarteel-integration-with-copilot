"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Mic, MicOff, Volume2 } from "lucide-react";
import AyahDisplay from "./AyahDisplay";
import FeedbackPanel from "./FeedbackPanel";
import AudioVisualizer from "./AudioVisualizer";
import { useRecitationWebSocket } from "@/lib/useRecitationWebSocket";

interface RecitationInterfaceProps {
  surahNumber: number;
  ayahNumber: number;
  onBack: () => void;
}

export default function RecitationInterface({
  surahNumber,
  ayahNumber,
  onBack,
}: RecitationInterfaceProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [ayahText, setAyahText] = useState<string>("");
  const [surahName, setSurahName] = useState<string>("");
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const { analysis, isConnected, sendAudioData, resetAnalysis } =
    useRecitationWebSocket();

  // Fetch ayah text
  useEffect(() => {
    fetchAyahData();
    resetAnalysis();
  }, [surahNumber, ayahNumber]);

  const fetchAyahData = async () => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/quran/ayah/${surahNumber}/${ayahNumber}`,
      );
      const data = await response.json();
      setAyahText(data.text || "");
      setSurahName(data.surahEnglishName || "");
    } catch (error) {
      console.error("Error fetching ayah:", error);
      // Fallback data
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

      // Create MediaRecorder with appropriate MIME type
      const mimeType = MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : "audio/ogg";
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        await sendAudioForAnalysis(audioBlob);

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());
        setMediaStream(null);
      };

      // Start recording with data chunks every second
      mediaRecorder.start(1000);
      setIsRecording(true);
      resetAnalysis();
    } catch (error) {
      console.error("Error starting recording:", error);
      alert("Could not access microphone. Please grant permission.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const sendAudioForAnalysis = async (audioBlob: Blob) => {
    try {
      // Convert blob to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Audio = reader.result?.toString().split(",")[1] || "";
        sendAudioData(base64Audio, surahNumber, ayahNumber);
      };
      reader.readAsDataURL(audioBlob);
    } catch (error) {
      console.error("Error sending audio:", error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="h-5 w-5" />
        Choose different Ayah
      </button>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left: Ayah Display */}
        <div className="space-y-6">
          <AyahDisplay
            surahNumber={surahNumber}
            ayahNumber={ayahNumber}
            surahName={surahName}
            ayahText={ayahText}
            transcription={analysis?.transcription}
            errors={analysis?.tajweed?.errors || []}
          />

          {/* Recording Controls */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                {isRecording ? "Recording..." : "Ready to Recite"}
              </h3>

              {/* Connection Status */}
              <div className="mb-4">
                <span
                  className={`inline-flex items-center gap-2 text-sm ${isConnected ? "text-green-600" : "text-red-600"}`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-600" : "bg-red-600"}`}
                  ></span>
                  {isConnected ? "Connected to server" : "Connecting..."}
                </span>
              </div>

              {/* Audio Visualizer */}
              <div className="mb-6 relative">
                <AudioVisualizer
                  isRecording={isRecording}
                  stream={mediaStream}
                />
              </div>

              {/* Recording Button */}
              <button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={!isConnected}
                className={`w-32 h-32 rounded-full flex items-center justify-center mx-auto transition-all ${
                  isRecording
                    ? "bg-red-500 hover:bg-red-600 recording-pulse"
                    : "bg-emerald-600 hover:bg-emerald-700"
                } disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl`}
              >
                {isRecording ? (
                  <MicOff className="h-12 w-12 text-white" />
                ) : (
                  <Mic className="h-12 w-12 text-white" />
                )}
              </button>

              <p className="mt-4 text-gray-600">
                {isRecording
                  ? "Click to stop recording"
                  : "Click to start recording"}
              </p>
            </div>
          </div>
        </div>

        {/* Right: Feedback Panel */}
        <div>
          <FeedbackPanel analysis={analysis} expectedText={ayahText} />
        </div>
      </div>
    </div>
  );
}
