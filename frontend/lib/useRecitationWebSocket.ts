"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface TajweedAnalysis {
  accuracy: number;
  errors: any[];
  tajweed_rules: any[];
  feedback: string;
  score: number;
  corrections: string[];
}

interface AnalysisResponse {
  type: string;
  transcription: string;
  confidence: number;
  tajweed: TajweedAnalysis;
  expected: string;
  surahNumber: number;
  ayahNumber: number;
  partial?: boolean;
}

const TUNNEL_URL = "wss://messaging-lincoln-committee-monitors.trycloudflare.com/ws/recitation";

function getWsUrl(): string {
  // 1. Use env var if set (highest priority)
  const envUrl = process.env.NEXT_PUBLIC_WS_URL;
  if (envUrl) return envUrl;

  // 2. Check if we're on the tunnel domain directly
  if (typeof window !== "undefined") {
    const host = window.location.host;
    if (host.includes("trycloudflare.com")) {
      const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
      return `${proto}//${host}/ws/recitation`;
    }
    // 3. Local dev fallback
    if (host.includes("localhost") || host.includes("127.0.0.1")) {
      return "ws://localhost:8081/ws/recitation";
    }
  }

  // 4. Default: use tunnel
  return TUNNEL_URL;
}

export function useRecitationWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [wsError, setWsError] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isActiveAnalysisRef = useRef(false);
  const hasEverConnectedRef = useRef(false);
  const retryCountRef = useRef(0);
  const maxRetries = 5;

  const cleanup = useCallback(() => {
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;
    if (wsRef.current?.readyState === WebSocket.CONNECTING) return;

    if (retryCountRef.current >= maxRetries) {
      setWsError("Cannot connect to server after multiple attempts.");
      return;
    }

    cleanup();

    try {
      const wsUrl = getWsUrl();
      console.log("[WS] Connecting to:", wsUrl);
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log("[WS] Connected");
        hasEverConnectedRef.current = true;
        retryCountRef.current = 0;
        setIsConnected(true);
        setWsError(null);

        pingIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: "ping" }));
          }
        }, 25000);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "analysis") {
            isActiveAnalysisRef.current = true;
            setAnalysis(data);
            setTimeout(() => { isActiveAnalysisRef.current = false; }, 500);
          } else if (data.type === "error") {
            console.error("[WS] Server error:", data.message);
          }
        } catch {}
      };

      ws.onerror = () => {
        setIsConnected(false);
        if (!hasEverConnectedRef.current) {
          setWsError("WebSocket connection failed.");
        }
      };

      ws.onclose = () => {
        console.log("[WS] Closed");
        setIsConnected(false);
        wsRef.current = null;
        cleanup();

        retryCountRef.current += 1;
        if (retryCountRef.current <= maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, retryCountRef.current), 10000);
          reconnectTimeoutRef.current = setTimeout(() => connect(), delay);
        }
      };

      wsRef.current = ws;
    } catch (err) {
      console.error("[WS] Creation error:", err);
      setWsError("Failed to create WebSocket.");
    }
  }, [cleanup]);

  useEffect(() => {
    connect();
    return () => {
      cleanup();
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [connect, cleanup]);

  const sendAudioData = useCallback(
    (audioBase64: string, surahNumber: number, ayahNumber: number, timestamp?: string) => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: "audio",
          audio: audioBase64,
          surahNumber,
          ayahNumber,
          timestamp: timestamp || Date.now().toString(),
        }));
      }
    },
    [],
  );

  const resetAnalysis = useCallback(() => {
    setAnalysis(null);
    isActiveAnalysisRef.current = false;
  }, []);

  return { isConnected, analysis, sendAudioData, resetAnalysis, wsError };
}