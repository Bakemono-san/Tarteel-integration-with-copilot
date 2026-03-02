"use client";

import { useEffect, useRef } from "react";

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
    isRecording && stream ? setup() : cleanup();
    return cleanup;
  }, [isRecording, stream]);

  const setup = () => {
    if (!stream || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const g = canvas.getContext("2d");
    if (!g) return;

    const ac = new AudioContext();
    ctxRef.current = ac;
    const an = ac.createAnalyser();
    an.fftSize = 256;
    analyRef.current = an;
    ac.createMediaStreamSource(stream).connect(an);
    draw(an, canvas, g);
  };

  const draw = (
    an: AnalyserNode,
    c: HTMLCanvasElement,
    g: CanvasRenderingContext2D,
  ) => {
    const buf = new Uint8Array(an.frequencyBinCount);
    const loop = () => {
      rafRef.current = requestAnimationFrame(loop);
      an.getByteFrequencyData(buf);
      g.fillStyle = "#f9fafb";
      g.fillRect(0, 0, c.width, c.height);
      const bw = (c.width / buf.length) * 2.5;
      let x = 0;
      for (let i = 0; i < buf.length; i++) {
        const h = (buf[i] / 255) * c.height;
        g.fillStyle = `hsl(${(i / buf.length) * 120 + 140}, 60%, 50%)`;
        g.fillRect(x, c.height - h, bw, h);
        x += bw + 1;
      }
    };
    loop();
  };

  const cleanup = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (ctxRef.current?.state !== "closed")
      try {
        ctxRef.current?.close();
      } catch {}
  };

  return (
    <div className="relative w-full">
      <canvas
        ref={canvasRef}
        width={600}
        height={80}
        className="h-16 w-full rounded-lg bg-gray-50 sm:h-20"
      />
      {!isRecording && (
        <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-gray-50/80">
          <p className="text-xs text-gray-400">Audio waveform appears here</p>
        </div>
      )}
    </div>
  );
}
