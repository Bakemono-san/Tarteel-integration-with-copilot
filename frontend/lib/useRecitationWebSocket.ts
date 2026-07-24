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
  if (typeof window === "undefined") return "ws://localhost:8081/ws/recitation";
  const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
  const host = window.location.host;
  if (host.includes("localhost") || host.includes("127.0.0.1")) {
    return `ws://localhost:8081/ws/recitation`;
  }
  return `${proto}//${host}/ws/recitation`;
}

export function useRecitationWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [connectionAttempts, setConnectionAttempts] = useState(0);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isActiveAnalysisRef = useRef(false);
  const maxReconnectAttempts = 5;

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

    cleanup();

    try {
      const wsUrl = getWsUrl();
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log("WebSocket connected to", wsUrl);
        setIsConnected(true);
        setConnectionAttempts(0);

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
            // Allow next chunk after a short cooldown
            setTimeout(() => {
              isActiveAnalysisRef.current = false;
            }, 500);
          } else if (data.type === "error") {
            console.error("Server error:", data.message);
            isActiveAnalysisRef.current = false;
          } else if (data.type === "pong") {
            // connection alive
          }
        } catch (err) {
          console.error("WebSocket parse error:", err);
        }
      };

      ws.onerror = (err) => {
        console.error("WebSocket error:", err);
        setIsConnected(false);
      };

      ws.onclose = () => {
        console.log("WebSocket closed");
        setIsConnected(false);
        wsRef.current = null;
        cleanup();

        setConnectionAttempts((prev) => {
          const next = prev + 1;
          if (next < maxReconnectAttempts) {
            const delay = Math.min(1000 * Math.pow(2, next), 10000);
            reconnectTimeoutRef.current = setTimeout(() => {
              connect();
            }, delay);
          }
          return next;
        });
      };

      wsRef.current = ws;
    } catch (err) {
      console.error("WebSocket creation failed:", err);
      setIsConnected(false);
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
        const message = {
          type: "audio",
          audio: audioBase64,
          surahNumber,
          ayahNumber,
        };
        wsRef.current.send(JSON.stringify(message));
      }
    },
    [],
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
    connectionAttempts,
  };
}