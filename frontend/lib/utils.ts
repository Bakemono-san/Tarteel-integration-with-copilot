import { type ClassValue, clsx } from "clsx"

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

const API_BASE = typeof window !== "undefined"
  ? (process.env.NEXT_PUBLIC_API_URL || "https://messaging-lincoln-committee-monitors.trycloudflare.com")
  : (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081");

export function apiUrl(path: string): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE}${clean}`;
}

export async function apiFetch(path: string, options?: RequestInit): Promise<Response> {
  return fetch(apiUrl(path), options);
}

export async function blobToWavBase64(blob: Blob): Promise<string> {
  try {
    const ctx = new AudioContext();
    const arrayBuffer = await blob.arrayBuffer();
    const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
    ctx.close();

    const numChannels = audioBuffer.numberOfChannels;
    const sampleRate = audioBuffer.sampleRate;
    const numFrames = audioBuffer.length;
    const bitsPerSample = 16;

    // Interleave channels
    const raw = new Float32Array(numFrames * numChannels);
    for (let ch = 0; ch < numChannels; ch++) {
      const channel = audioBuffer.getChannelData(ch);
      for (let i = 0; i < numFrames; i++) {
        raw[i * numChannels + ch] = channel[i];
      }
    }

    // Convert float32 [-1,1] to int16
    const pcm = new Int16Array(raw.length);
    for (let i = 0; i < raw.length; i++) {
      const s = Math.max(-1, Math.min(1, raw[i]));
      pcm[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }

    const dataSize = pcm.length * 2;
    const headerSize = 44;
    const totalSize = headerSize + dataSize;

    const wav = new ArrayBuffer(totalSize);
    const view = new DataView(wav);

    const w = (pos: number, val: number, size: number) => {
      if (size === 2) view.setInt16(pos, val, true);
      else view.setInt32(pos, val, true);
    };

    // RIFF header
    view.setUint8(0, 0x52); view.setUint8(1, 0x49); view.setUint8(2, 0x46); view.setUint8(3, 0x46); // "RIFF"
    w(4, totalSize - 8, 4);
    view.setUint8(8, 0x57); view.setUint8(9, 0x41); view.setUint8(10, 0x56); view.setUint8(11, 0x45); // "WAVE"

    // fmt chunk
    view.setUint8(12, 0x66); view.setUint8(13, 0x6D); view.setUint8(14, 0x74); view.setUint8(15, 0x20); // "fmt "
    w(16, 16, 4);     // chunk size
    w(20, 1, 2);       // PCM
    w(22, numChannels, 2);
    w(24, sampleRate, 4);
    w(28, sampleRate * numChannels * 2, 4); // byte rate
    w(32, numChannels * 2, 2); // block align
    w(34, bitsPerSample, 2);

    // data chunk
    view.setUint8(36, 0x64); view.setUint8(37, 0x61); view.setUint8(38, 0x74); view.setUint8(39, 0x61); // "data"
    w(40, dataSize, 4);

    // PCM data
    const pcmView = new Int16Array(wav, headerSize);
    pcmView.set(pcm);

    const bytes = new Uint8Array(wav);
    let binary = "";
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  } catch {
    // Fallback: send original blob as-is
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result?.toString().split(",")[1] || "");
      reader.readAsDataURL(blob);
    });
  }
}
