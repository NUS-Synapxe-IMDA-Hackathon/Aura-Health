import { useEffect, useRef, useState } from "react";
import type { WsFrame } from "../types/monitoring";

type UseWebSocketResult = {
  frame: WsFrame | null;
  connected: boolean;
  error: string | null;
};

type JsonRecord = Record<string, unknown>;

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function parsePresence(value: unknown): boolean | undefined {
  if (typeof value !== "string") return undefined;
  const normalized = value.toLowerCase();
  if (normalized.includes("not present") || normalized.includes("absent")) {
    return false;
  }
  if (normalized.includes("present")) return true;
  return undefined;
}

function parseMotion(value: unknown): WsFrame["motion"] | undefined {
  if (typeof value !== "string") return undefined;
  const normalized = value.toLowerCase();
  if (normalized.includes("still") || normalized.includes("sleep")) {
    return "still";
  }
  if (normalized.includes("moving") || normalized.includes("active")) {
    return "active";
  }
  if (normalized.includes("none")) {
    return "none";
  }
  return undefined;
}

function parseFallen(value: unknown): boolean | undefined {
  if (typeof value !== "string") return undefined;
  const normalized = value.toLowerCase();
  if (normalized.includes("not fallen")) return false;
  if (normalized.includes("fallen")) return true;
  if (normalized.includes("active")) return false;
  return undefined;
}

function parseDwell(value: unknown): boolean | undefined {
  if (typeof value !== "string") return undefined;
  const normalized = value.toLowerCase();
  if (normalized.includes("no stationary dwell")) return false;
  if (normalized.includes("dwell")) return true;
  return undefined;
}

function extractMmwaveMessage(
  value: unknown,
): { payload: JsonRecord; timestamp: string } | null {
  if (!isRecord(value)) return null;

  if (typeof value.dataType === "string") {
    return {
      payload: value,
      timestamp:
        typeof value.timestamp === "string"
          ? value.timestamp
          : new Date().toISOString(),
    };
  }

  const payload =
    value.type === "mmwave_raw" && isRecord(value.data)
      ? value.data
      : value.type === "message" && isRecord(value.payload)
        ? value.payload
        : null;

  if (!payload || typeof payload.dataType !== "string") {
    return null;
  }

  return {
    payload,
    timestamp:
      typeof value.timestamp === "string"
        ? value.timestamp
        : typeof payload.timestamp === "string"
          ? payload.timestamp
          : new Date().toISOString(),
  };
}

function mergeMmwaveFrame(
  payload: JsonRecord,
  timestamp: string,
  previous: WsFrame | null,
): WsFrame | null {
  const dataType = payload.dataType;
  if (typeof dataType !== "string") return null;

  const base: WsFrame = previous ?? {
    timestamp,
    presence: false,
    motion: "none",
    bmp: 0,
    fallen: false,
    dwell: false,
    room: "unknown",
  };

  if (dataType === "fallData") {
    return {
      ...base,
      timestamp,
      room: typeof payload.room === "string" ? payload.room : base.room,
      presence:
        parsePresence(payload.existingInformation) ?? base.presence,
      motion: parseMotion(payload.motionInformation) ?? base.motion,
      bmp: isFiniteNumber(payload.bodyMovementParameters)
        ? payload.bodyMovementParameters
        : base.bmp,
      fallen: parseFallen(payload.fallStatus) ?? base.fallen,
      dwell: parseDwell(payload.stationaryDwellStatus) ?? base.dwell,
    };
  }

  if (dataType === "vitalsData") {
    return {
      ...base,
      timestamp,
      room: typeof payload.room === "string" ? payload.room : base.room,
      presence:
        parsePresence(payload.existingInformation) ?? base.presence,
      motion: parseMotion(payload.motionInformation) ?? base.motion,
      heartRate: isFiniteNumber(payload.heartRate)
        ? payload.heartRate
        : base.heartRate,
    };
  }

  if (dataType === "sleepData") {
    const comprehensive = isRecord(payload.comprehensive)
      ? payload.comprehensive
      : null;

    return {
      ...base,
      timestamp,
      room: typeof payload.room === "string" ? payload.room : base.room,
      presence:
        parsePresence(comprehensive?.existenceStatus) ?? base.presence,
      motion:
        parseMotion(payload.sleepStatus) ??
        parseMotion(comprehensive?.sleepStatus) ??
        base.motion,
      heartRate: isFiniteNumber(comprehensive?.avgHeartRate)
        ? comprehensive.avgHeartRate
        : base.heartRate,
    };
  }

  return null;
}

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

        const mmwaveMessage = extractMmwaveMessage(msg);
        if (mmwaveMessage) {
          setFrame((previous) =>
            mergeMmwaveFrame(
              mmwaveMessage.payload,
              mmwaveMessage.timestamp,
              previous,
            ) ?? previous,
          );
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
