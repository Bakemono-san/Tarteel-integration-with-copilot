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

function getWsUrl(): string {
  if (typeof window === "undefined") return "";
  const host = window.location.host;

  // Vercel or non-local deploy — WebSocket won't work without a backend server
  if (!host.includes("localhost") && !host.includes("127.0.0.1") && !host.includes("192.168") && !host.includes("10.")) {
    const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
    return `${proto}//${host}/ws/recitation`;
  }
  return "ws://localhost:8081/ws/recitation";
}

function isVercelDeploy(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.location.host.includes("vercel.app") ||
    window.location.host.endsWith(".vercel.app")
  );
}

export function useRecitationWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [wsError, setWsError] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isActiveAnalysisRef = useRef(false);
  const hasEverConnected = useRef(false);
  const retryCountRef = useRef(0);
  const maxRetries = isVercelDeploy() ? 0 : 3;

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

    if (retryCountRef.current >= maxRetries && maxRetries === 0) {
      setWsError(
        "WebSocket not available on this deployment. Use direct REST API mode instead."
      );
      return;
    }

    cleanup();
    const wsUrl = getWsUrl();
    if (!wsUrl) {
      setWsError("No WebSocket URL available");
      return;
    }

    try {
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        hasEverConnected.current = true;
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
            setTimeout(() => {
              isActiveAnalysisRef.current = false;
            }, 500);
          } else if (data.type === "error") {
            console.error("Server error:", data.message);
            isActiveAnalysisRef.current = false;
          } else if (data.type === "pong") {
            // alive
          }
        } catch {
          // ignore parse errors
        }
      };

      ws.onerror = () => {
        setIsConnected(false);
        if (!hasEverConnected.current) {
          setWsError("Cannot connect to analysis server. Using browser-based analysis only.");
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        wsRef.current = null;
        cleanup();

        if (hasEverConnected.current && retryCountRef.current < maxRetries) {
          retryCountRef.current += 1;
          const delay = Math.min(1000 * Math.pow(2, retryCountRef.current), 8000);
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        }
      };

      wsRef.current = ws;
    } catch {
      setIsConnected(false);
      setWsError("Failed to create WebSocket connection");
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
    (audioBase64: string, surahNumber: number, ayahNumber: number) => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: "audio",
            audio: audioBase64,
            surahNumber,
            ayahNumber,
          })
        );
      }
    },
    []
  );

  const resetAnalysis = useCallback(() => {
    setAnalysis(null);
    isActiveAnalysisRef.current = false;
  }, []);

  return {
    isConnected,
    analysis,
    sendAudioData,
    resetAnalysis,
    wsError,
  };
}