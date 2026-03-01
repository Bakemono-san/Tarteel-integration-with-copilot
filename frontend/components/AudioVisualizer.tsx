"use client";

import { useEffect, useRef } from "react";

interface AudioVisualizerProps {
  isRecording: boolean;
  stream: MediaStream | null;
}

export default function AudioVisualizer({
  isRecording,
  stream,
}: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const analyserRef = useRef<AnalyserNode>();
  const audioContextRef = useRef<AudioContext>();

  useEffect(() => {
    if (isRecording && stream) {
      setupVisualizer();
    } else {
      cleanup();
    }

    return cleanup;
  }, [isRecording, stream]);

  const setupVisualizer = () => {
    if (!stream || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const canvasCtx = canvas.getContext("2d");
    if (!canvasCtx) return;

    // Create audio context
    const audioContext = new AudioContext();
    audioContextRef.current = audioContext;

    // Create analyser
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    analyserRef.current = analyser;

    // Connect stream to analyser
    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);

    // Start visualization
    visualize(analyser, canvas, canvasCtx);
  };

  const visualize = (
    analyser: AnalyserNode,
    canvas: HTMLCanvasElement,
    canvasCtx: CanvasRenderingContext2D,
  ) => {
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationFrameRef.current = requestAnimationFrame(draw);

      analyser.getByteFrequencyData(dataArray);

      // Clear canvas
      canvasCtx.fillStyle = "rgb(243, 244, 246)";
      canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = (dataArray[i] / 255) * canvas.height;

        // Gradient color based on frequency
        const hue = (i / bufferLength) * 120 + 100; // Green to blue
        canvasCtx.fillStyle = `hsl(${hue}, 70%, 50%)`;

        canvasCtx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

        x += barWidth + 1;
      }
    };

    draw();
  };

  const cleanup = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      try {
        audioContextRef.current.close();
      } catch (error) {
        // Silently handle if already closed
        console.debug("AudioContext already closed");
      }
    }
  };

  return (
    <div className="w-full">
      <canvas
        ref={canvasRef}
        width={600}
        height={80}
        className="w-full h-20 bg-gray-100 rounded-lg"
      />
      {!isRecording && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-80 rounded-lg">
          <p className="text-gray-500 text-sm">
            Audio visualizer will appear when recording
          </p>
        </div>
      )}
    </div>
  );
}
