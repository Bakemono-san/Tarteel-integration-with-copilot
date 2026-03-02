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
}

export function useRecitationWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    try {
      const ws = new WebSocket("ws://185.245.183.209:8081/ws/recitation");

      ws.onopen = () => {
        console.log("WebSocket connected");
        setIsConnected(true);

        // Send ping to keep connection alive
        const pingInterval = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: "ping" }));
          }
        }, 30000); // Every 30 seconds

        ws.onclose = () => {
          clearInterval(pingInterval);
        };
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === "analysis") {
            setAnalysis(data);
          } else if (data.type === "pong") {
            // Connection is alive
            console.log("Pong received");
          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

      ws.onclose = () => {
        console.log("WebSocket disconnected");
        setIsConnected(false);
        wsRef.current = null;

        // Attempt to reconnect after 3 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log("Attempting to reconnect...");
          connect();
        }, 3000);
      };

      wsRef.current = ws;
    } catch (error) {
      console.error("Error creating WebSocket:", error);
      setIsConnected(false);
    }
  }, []);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

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
      } else {
        console.error("WebSocket is not connected");
      }
    },
    [],
  );

  const resetAnalysis = useCallback(() => {
    setAnalysis(null);
  }, []);

  return {
    isConnected,
    analysis,
    sendAudioData,
    resetAnalysis,
  };
}
