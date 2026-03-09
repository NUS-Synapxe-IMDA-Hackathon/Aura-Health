/**
 * Caregiver WebSocket client for AURA AI backend.
 * Connects to ws://localhost:8001/ws/caregiver for incident events and actions.
 * Pattern mirrors AuraSocket from AURA-Fall-Dectector.
 */

import type {
  Alert,
  Incident,
  IncidentActionId,
  LockedBy,
} from "../types/monitoring";

export class AuraCaregiverSocket {
  private ws: WebSocket | null = null;
  private url: string;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private backoff = 1000;
  private shouldReconnect = false;

  // Event callbacks
  onIncidentCreated: ((incident: Incident) => void) | null = null;
  onIncidentUpdated: ((incidentId: string, incident: Incident) => void) | null =
    null;
  onIncidentResolved:
    | ((incidentId: string, resolution: string) => void)
    | null = null;
  onIncidentLocked: ((incidentId: string, lockedBy: LockedBy) => void) | null =
    null;
  onAlert: ((alert: Alert) => void) | null = null;
  onStatus: ((state: string, message: string) => void) | null = null;
  onConnect: (() => void) | null = null;
  onDisconnect: (() => void) | null = null;

  constructor(url: string) {
    this.url = url;
  }

  get connected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  connect(): void {
    this.shouldReconnect = true;
    this.backoff = 1000;
    this._open();
  }

  disconnect(): void {
    this.shouldReconnect = false;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.onclose = null;
      this.ws.close();
      this.ws = null;
    }
  }

  /** Send an action for an incident (first-responder-wins). */
  sendAction(incidentId: string, action: IncidentActionId): void {
    this._send({
      type: "action",
      incident_id: incidentId,
      action,
    });
  }

  private _send(obj: Record<string, unknown>): void {
    if (!this.connected || !this.ws) return;
    this.ws.send(JSON.stringify(obj));
  }

  private _open(): void {
    if (this.ws) {
      this.ws.onclose = null;
      this.ws.close();
    }

    const url = new URL(this.url);
    if (!url.searchParams.has("contact_id")) {
      url.searchParams.set("contact_id", "caregiver-app");
    }
    const ws = new WebSocket(url.toString());

    ws.onopen = () => {
      this.backoff = 1000;
      this.onConnect?.();
    };

    ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data as string);
        switch (msg.type) {
          case "incident_created":
            this.onIncidentCreated?.(msg.incident);
            break;
          case "incident_updated":
            this.onIncidentUpdated?.(msg.incident_id, msg.incident);
            break;
          case "incident_resolved":
            this.onIncidentResolved?.(
              msg.incident_id,
              msg.resolution ?? "unknown",
            );
            break;
          case "incident_locked":
            this.onIncidentLocked?.(msg.incident_id, msg.locked_by);
            break;
          case "alert":
            this.onAlert?.(msg.alert);
            break;
          case "status":
            this.onStatus?.(msg.state, msg.message);
            break;
          case "ping":
            this._send({ type: "pong" });
            break;
        }
      } catch {
        // ignore malformed messages
      }
    };

    ws.onerror = () => {
      // onclose will fire after this
    };

    ws.onclose = () => {
      this.ws = null;
      this.onDisconnect?.();
      this._scheduleReconnect();
    };

    this.ws = ws;
  }

  private _scheduleReconnect(): void {
    if (!this.shouldReconnect) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this._open();
    }, this.backoff);
    this.backoff = Math.min(this.backoff * 2, 30000);
  }
}
