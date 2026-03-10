import { useCallback, useEffect, useRef, useState } from "react";
import { AuraCaregiverSocket } from "../lib/auraCaregiverSocket";
import type {
  Alert,
  Incident,
  IncidentActionId,
  LockedBy,
  Report,
} from "../types/monitoring";

type CaregiverSocketCallbacks = {
  onIncidentCreated?: (incident: Incident) => void;
  onIncidentUpdated?: (incidentId: string, incident: Incident) => void;
  onIncidentResolved?: (incidentId: string, resolution: string) => void;
  onIncidentLocked?: (incidentId: string, lockedBy: LockedBy) => void;
  onAlert?: (alert: Alert) => void;
  onReport?: (report: Report) => void;
};

export function useCaregiverSocket(callbacks: CaregiverSocketCallbacks) {
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<AuraCaregiverSocket | null>(null);
  const callbacksRef = useRef(callbacks);
  const url = import.meta.env.VITE_CAREGIVER_WS_URL as string | undefined;

  useEffect(() => {
    callbacksRef.current = callbacks;
  }, [callbacks]);

  useEffect(() => {
    if (!url) return;

    const socket = new AuraCaregiverSocket(url);
    socketRef.current = socket;

    socket.onConnect = () => setConnected(true);
    socket.onDisconnect = () => setConnected(false);

    socket.onIncidentCreated = (incident) =>
      callbacksRef.current.onIncidentCreated?.(incident);
    socket.onIncidentUpdated = (id, incident) =>
      callbacksRef.current.onIncidentUpdated?.(id, incident);
    socket.onIncidentResolved = (id, resolution) =>
      callbacksRef.current.onIncidentResolved?.(id, resolution);
    socket.onIncidentLocked = (id, lockedBy) =>
      callbacksRef.current.onIncidentLocked?.(id, lockedBy);
    socket.onAlert = (alert) => callbacksRef.current.onAlert?.(alert);
    socket.onReport = (report) => callbacksRef.current.onReport?.(report);

    socket.connect();

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [url]);

  const sendAction = useCallback(
    (incidentId: string, action: IncidentActionId) => {
      socketRef.current?.sendAction(incidentId, action);
    },
    [],
  );

  return { sendAction, connected };
}
