import { useEffect, useRef, useState } from "react";
import type { WsFrame } from "../types/monitoring";

type UseWebSocketResult = {
  frame: WsFrame | null;
  connected: boolean;
  error: string | null;
};

export function useWebSocket(url?: string): UseWebSocketResult {
  const [frame, setFrame] = useState<WsFrame | null>(null);
  const [connected, setConnected] = useState(false);
  const [wsError, setWsError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!url) return;

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      setWsError(null);
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data as string);

        // Handle IoT data messages from the mmWave server envelope
        if (msg.type === "message" && msg.payload?.dataType === "vitalsData") {
          const p = msg.payload;
          const motion = (() => {
            const m = (p.motionInformation ?? "").toLowerCase();
            if (m.includes("still")) return "still";
            if (m.includes("moving") || m.includes("active")) return "active";
            return "none";
          })() as WsFrame["motion"];

          setFrame({
            timestamp: msg.timestamp,
            room: p.room ?? "unknown",
            heartRate: p.heartRate ?? 0,
            presence: (p.existingInformation ?? "")
              .toLowerCase()
              .includes("present"),
            motion,
            bmp: p.bodyMovementParameters ?? 0,
            fallen: false,
            dwell: false,
          });
        }
      } catch {
        console.error("[ws] Failed to parse frame", event.data);
      }
    };

    ws.onerror = () => {
      setWsError("WebSocket error");
    };

    ws.onclose = () => {
      setConnected(false);
    };

    return () => {
      ws.close();
    };
  }, [url]);

  const error = url ? wsError : "No WebSocket URL configured";
  return { frame, connected, error };
}
