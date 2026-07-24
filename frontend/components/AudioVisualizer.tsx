"use client";

import { useEffect, useRef } from "react";
import { Mic } from "lucide-react";

interface Props {
  isRecording: boolean;
  stream: MediaStream | null;
}

export default function AudioVisualizer({ isRecording, stream }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>();
  const ctxRef = useRef<AudioContext>();
  const analyRef = useRef<AnalyserNode>();

  useEffect(() => {
    if (isRecording && stream) {
      setup();
    } else {
      cleanup();
    }
    return cleanup;
  }, [isRecording, stream]);

  const setup = () => {
    if (!stream || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const g = canvas.getContext("2d");
    if (!g) return;

    try {
      const ac = new AudioContext();
      ctxRef.current = ac;
      const an = ac.createAnalyser();
      an.fftSize = 128;
      analyRef.current = an;
      ac.createMediaStreamSource(stream).connect(an);
      draw(an, canvas, g);
    } catch {
      // Audio context setup failed
    }
  };

  const draw = (an: AnalyserNode, c: HTMLCanvasElement, g: CanvasRenderingContext2D) => {
    const buf = new Uint8Array(an.frequencyBinCount);

    const loop = () => {
      rafRef.current = requestAnimationFrame(loop);
      an.getByteFrequencyData(buf);

      // Clear with slight trail effect
      g.fillStyle = "rgba(236, 253, 245, 0.3)";
      g.fillRect(0, 0, c.width, c.height);

      const barCount = Math.min(buf.length, 32);
      const bw = c.width / barCount;
      const gap = 2;

      for (let i = 0; i < barCount; i++) {
        const val = buf[i] / 255;
        const h = Math.max(val * c.height * 0.9, 2);

        // Gradient from emerald to teal
        const hue = 160 - val * 30;
        const sat = 50 + val * 30;
        const lit = 40 + val * 20;
        g.fillStyle = `hsl(${hue}, ${sat}%, ${lit}%)`;

        // Rounded bars
        const x = i * bw + gap / 2;
        const w = bw - gap;
        const y = c.height - h;

        g.beginPath();
        g.roundRect(x, y, w, h, [2, 2, 0, 0]);
        g.fill();

        // Glow effect on top
        if (val > 0.5) {
          g.fillStyle = `hsla(${hue}, 80%, 70%, ${(val - 0.5) * 0.3})`;
          g.beginPath();
          g.roundRect(x, Math.max(y - 2, 0), w, 3, [1, 1, 0, 0]);
          g.fill();
        }
      }
    };
    loop();
  };

  const cleanup = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (ctxRef.current?.state !== "closed") {
      try { ctxRef.current?.close(); } catch {}
    }
  };

  return (
    <div className="relative w-full">
      <canvas
        ref={canvasRef}
        width={600}
        height={100}
        className="h-20 w-full rounded-xl sm:h-24"
        style={{ background: "linear-gradient(180deg, #f0fdf4, #ecfdf5)" }}
      />
      {!isRecording && (
        <div className="absolute inset-0 flex flex-col items-center justify-center rounded-xl bg-white/60 backdrop-blur-sm">
          <Mic className="mb-1 h-5 w-5 text-emerald-300" />
          <p className="text-xs text-gray-400">Audio visualizer</p>
        </div>
      )}
    </div>
  );
}