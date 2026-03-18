import { useEffect, useRef, useState } from "react";

// ── Internal types ────────────────────────────────────────────────────────────

type RoomScanHazard = {
  category: string;
  severity: string;
  location: string;
  action: string;
  status: string;
};

type RoomScanObservation = {
  timestamp: string;
  description: string;
  concern_level: string;
};

type RoomScanAnalysis = {
  score: number;
  confidence: number;
  hazards: RoomScanHazard[];
  observations: RoomScanObservation[];
  risk_indicators: string[];
  raw_summary: string;
  key_finding: string;
  clinical_concern: string;
  fall_risk_contribution: string;
  priority_hazard: string;
};

// ── Exported types ────────────────────────────────────────────────────────────

export type WsTimelineEntry = {
  state: string;
  message: string;
  ts: number;
};

export type WsIncidentData = {
  incidentId: string | null;
  voiceText: string | null;
  roomScan: RoomScanAnalysis | null;
  timeline: WsTimelineEntry[];
};

export type FallDetectorState = {
  fallen: boolean;
  escalationLevel: number | null;
  connected: boolean;
  wsIncidentData: WsIncidentData;
};

// ── Constants ─────────────────────────────────────────────────────────────────

const RECONNECT_BASE_MS = 1000;
const RECONNECT_MAX_MS = 30000;

const EMPTY_INCIDENT: WsIncidentData = {
  incidentId: null,
  voiceText: null,
  roomScan: null,
  timeline: [],
};

// States that mean a fall is actively in progress
const FALL_STATES = new Set(["FALL_ASSESSMENT", "COOLDOWN"]);

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useFallDetectorWs(url?: string): FallDetectorState {
  const [fallen, setFallen] = useState(false);
  const [escalationLevel, setEscalationLevel] = useState<number | null>(null);
  const [connected, setConnected] = useState(false);
  const [wsIncidentData, setWsIncidentData] = useState<WsIncidentData>(EMPTY_INCIDENT);

  // Tracks fall state inside event handlers without a stale closure
  const fallenRef = useRef(false);

  const wsRef = useRef<WebSocket | null>(null);
  const retryRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryDelayRef = useRef(RECONNECT_BASE_MS);

  useEffect(() => {
    if (!url) return;

    let unmounted = false;

    function connect() {
      if (unmounted) return;

      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        retryDelayRef.current = RECONNECT_BASE_MS;
        setConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data as string) as Record<string, unknown>;

          // ── Keepalive ──────────────────────────────────────────────────────
          if (msg.type === "ping") {
            ws.send(JSON.stringify({ type: "pong" }));
            return;
          }

          // ── Status messages ────────────────────────────────────────────────
          // These drive fall detection from the actual demo output:
          //   FALL_ASSESSMENT → fall started
          //   COOLDOWN        → still in fall, processing video
          //   MONITORING      → fall ended (when we were fallen)
          if (msg.type === "status") {
            const state = msg.state as string;
            const message = (msg.message as string) ?? state;
            const entry: WsTimelineEntry = { state, message, ts: Date.now() };

            if (state === "FALL_ASSESSMENT" && !fallenRef.current) {
              // New fall — reset incident data and start fresh
              fallenRef.current = true;
              setFallen(true);
              setEscalationLevel(null);
              setWsIncidentData({ ...EMPTY_INCIDENT, timeline: [entry] });
            } else if (FALL_STATES.has(state) && fallenRef.current) {
              // Ongoing fall state — append to timeline
              setWsIncidentData((prev) => ({
                ...prev,
                timeline: [...prev.timeline, entry],
              }));
            } else if (state === "MONITORING" && fallenRef.current) {
              // Fall resolved — keep wsIncidentData (FallsPage still needs it)
              fallenRef.current = false;
              setFallen(false);
              setEscalationLevel(null);
              setWsIncidentData((prev) => ({
                ...prev,
                timeline: [...prev.timeline, entry],
              }));
            }
            return;
          }

          // ── Directive messages ─────────────────────────────────────────────
          if (msg.type === "directive") {
            const action = msg.action as string;
            const params = (msg.params ?? {}) as Record<string, unknown>;

            switch (action) {
              // Legacy / alternate fall trigger
              case "fall_flow_started":
                if (!fallenRef.current) {
                  fallenRef.current = true;
                  setFallen(true);
                  setEscalationLevel(null);
                  setWsIncidentData(EMPTY_INCIDENT);
                }
                break;

              case "escalation_update": {
                const level =
                  typeof params.escalation_level === "number"
                    ? params.escalation_level
                    : null;
                setEscalationLevel(level);
                break;
              }

              // Legacy fall reset
              case "agent_stopped":
                if (params.agent === "fall_agent" && fallenRef.current) {
                  fallenRef.current = false;
                  setFallen(false);
                  setEscalationLevel(null);
                }
                break;

              // AURA's voice message to the resident — capture text + incident ID
              case "voice_response_sent": {
                if (!fallenRef.current) break;
                const incidentId =
                  typeof params.incident_id === "string" ? params.incident_id : null;
                const text =
                  typeof params.text === "string" ? params.text : null;
                if (incidentId || text) {
                  setWsIncidentData((prev) => ({
                    ...prev,
                    incidentId: incidentId ?? prev.incidentId,
                    voiceText: text ?? prev.voiceText,
                  }));
                }
                break;
              }

              // Room safety analysis — the richest data source
              case "room_scan_result": {
                if (!fallenRef.current) break;
                const analysis = params.analysis as RoomScanAnalysis | undefined;
                if (analysis) {
                  setWsIncidentData((prev) => ({ ...prev, roomScan: analysis }));
                }
                break;
              }

              default:
                break;
            }
          }
        } catch {
          console.error("[fall-detector-ws] Failed to parse message", event.data);
        }
      };

      ws.onerror = () => {
        console.warn("[fall-detector-ws] WebSocket error");
      };

      ws.onclose = () => {
        setConnected(false);
        if (unmounted) return;
        retryRef.current = setTimeout(() => {
          retryDelayRef.current = Math.min(
            retryDelayRef.current * 2,
            RECONNECT_MAX_MS,
          );
          connect();
        }, retryDelayRef.current);
      };
    }

    connect();

    return () => {
      unmounted = true;
      if (retryRef.current) clearTimeout(retryRef.current);
      wsRef.current?.close();
    };
  }, [url]);

  return { fallen, escalationLevel, connected, wsIncidentData };
}
