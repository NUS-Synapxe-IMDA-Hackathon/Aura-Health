import { useEffect, useRef, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { usePatientData } from "../../hooks/usePatientData";
import { DEV_FORCE_FALLEN } from "../../hooks/useIncidents";
import type {
  AlertFilter,
  AlertItem,
  FallStatus,
  Incident,
  PatientContext,
  ResolvedIncident,
} from "../../types/monitoring";
import { useAlerts } from "../../hooks/useAlerts";
import { useIncidents } from "../../hooks/useIncidents";
import { useRiskScores } from "../../hooks/useRiskScores";
import { useCaregiverSocket } from "../../hooks/useCaregiverSocket";
import { mockIncident } from "../../data/mock";

export type { PatientContext as AlertOutletContext };

const NAV_TABS = [
  {
    to: "/dashboard",
    label: "Dashboard",
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    to: "/falls",
    label: "Falls",
    icon: null,
  },
  {
    to: "/sleep",
    label: "Sleep",
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    ),
  },
  {
    to: "/alerts",
    label: "Alerts",
    badge: true,
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    ),
  },
];


const ROOM_LABELS: Record<string, string> = {
  living_room: "Living / Dining",
  bathroom: "Bathroom",
  bedroom: "Bedroom",
  kitchen: "Kitchen",
};

export function AppShell() {
  const { frame, connected, fallDetector } = usePatientData();
  const frameRef = useRef(frame);
  useEffect(() => { frameRef.current = frame; }, [frame]);
  const [filter, setFilter] = useState<AlertFilter>("all");
  const [alertActions, setAlertActions] = useState<Record<string, string>>({});
  const [fallResolvedAt, setFallResolvedAt] = useState<string | null>(null);
  const [liveFallSnapshot, setLiveFallSnapshot] = useState<AlertItem | null>(
    DEV_FORCE_FALLEN
      ? {
          id: "live-fall",
          severity: "critical",
          iconType: "alert-triangle",
          title: "Fall Detected",
          detail: "Doris has fallen in the living room",
          context:
            "Doris has collapsed in the living room. View fall report for more information and further actions.",
          time: "Just now",
          calledState: null,
        }
      : null,
  );
  const [resolvedIncident, setResolvedIncident] =
    useState<ResolvedIncident | null>(null);

  // Supabase data hooks
  const {
    alerts: hookAlerts,
    loading: alertsLoading,
    addLiveAlert,
  } = useAlerts();
  const {
    activeIncident,
    pastIncidents,
    loading: incidentsLoading,
    setActiveIncident,
    resolveIncident,
  } = useIncidents();
  const { scores: riskScores, applyLiveReport } = useRiskScores();

  // WebSocket
  const { sendAction, connected: caregiverConnected } = useCaregiverSocket({
    onIncidentCreated: (incident) => {
      setActiveIncident(incident);
      setLiveFallSnapshot({
        id: "live-fall",
        severity: "critical",
        iconType: "alert-triangle",
        title: "Fall detected",
        detail: `${incident.headline} · Just now`,
        context: "Emergency contacts notified",
        time: "Just now",
      });
      setResolvedIncident(null);
    },
    onIncidentUpdated: (_id, incident) => {
      setActiveIncident(incident);
    },
    onIncidentResolved: (id) => {
      resolveIncident(id);
      setLiveFallSnapshot(null);
    },
    onAlert: (alert) => {
      addLiveAlert(alert);
    },
    onReport: (report) => {
      applyLiveReport(report);
    },
    onIncidentLocked: (_id, lockedBy) => {
      setActiveIncident((prev) =>
        prev ? { ...prev, locked_by: lockedBy } : prev,
      );
    },
  });

  // Wire fall detector WS into UI state — re-runs as new WS data arrives
  useEffect(() => {
    if (fallDetector.fallen) {
      const room = frameRef.current?.room ?? "living_room";
      const contextText =
        fallDetector.escalationLevel === 2
          ? "L2 escalation — emergency contacts notified"
          : fallDetector.escalationLevel === 1
            ? "L1 escalation — caregiver notified"
            : "Assessing situation";

      // Build live snapshot for Alerts page
      setLiveFallSnapshot((prev) => ({
        id: "live-fall",
        severity: "critical",
        iconType: "alert-triangle",
        title: "Fall detected",
        detail: prev?.detail ?? `${ROOM_LABELS[room] ?? room} · Just now`,
        context: contextText,
        time: "Just now",
        calledState: null,
      }));

      setActiveIncident(mockIncident);
      setResolvedIncident(null);
      setFallResolvedAt(null);
    }
    // No else — fallen state persists until caregiver presses an action button
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fallDetector.fallen, fallDetector.escalationLevel]);

  const fallStatus: FallStatus =
    activeIncident !== null || fallDetector.fallen ? "fallen" : "not_fallen";

  function onIncidentResolve(
    type: "resolved" | "false_alarm",
    incident: Incident,
  ) {
    const resolvedAt = new Date().toLocaleTimeString("en-SG", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    setResolvedIncident({ incident, resolution: type, resolvedAt });
    setAlertActions((prev) => ({ ...prev, "live-fall": type === "resolved" ? "Resolved" : "False Alarm" }));
    setFallResolvedAt(null);

    // Send action via WebSocket if connected
    if (caregiverConnected && incident.id) {
      sendAction(incident.id, "ACK");
    }
    resolveIncident(incident.id);
  }

  function onAlertAction(id: string, label: string) {
    setAlertActions((prev) => ({ ...prev, [id]: label }));
    if (id === "live-fall" && label === "Resolved") {
      // Clear incident and fallen state but keep the card visible (snapshot stays)
      const incident = activeIncident ?? mockIncident;
      setResolvedIncident({ incident, resolution: "resolved", resolvedAt: new Date().toLocaleTimeString("en-SG", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) });
      if (caregiverConnected && incident.id) sendAction(incident.id, "ACK");
      resolveIncident(incident.id);
    }
  }

  const context: PatientContext = {
    frame,
    connected,
    fallStatus,
    filter,
    setFilter,
    alertActions,
    onAlertAction,
    fallResolvedAt,
    liveFallSnapshot,
    resolvedIncident,
    onIncidentResolve,
    alerts: hookAlerts,
    alertsLoading,
    activeIncident,
    pastIncidents,
    incidentsLoading,
    riskScores,
    sendAction,
    caregiverConnected,
  };

  const openAlerts = hookAlerts.filter(
    (a) =>
      (a.severity === "critical" || a.severity === "warning") &&
      !alertActions[a.id],
  ).length;
  const openLiveFall = liveFallSnapshot && !alertActions["live-fall"] ? 1 : 0;
  const alertBadgeCount = openAlerts + openLiveFall;

  return (
    <div className="flex min-h-screen justify-center bg-[#f8f8ff]">
      <div className="relative h-dvh max-h-233 w-full max-w-107.5 overflow-hidden bg-white">
        <div className="absolute inset-x-0 top-0 bottom-20.5 overflow-y-auto pb-6">
          <Outlet context={context} />
        </div>


        <div className="absolute inset-x-0 bottom-0 z-20 flex h-20.5 items-start border-t border-[#E8EAFF] bg-white/95 px-1 pt-2.5 pb-4 backdrop-blur-xl">
          {NAV_TABS.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={({ isActive }) =>
                [
                  "relative flex flex-1 flex-col items-center gap-1 text-[10px] font-medium",
                  isActive ? "text-[#5b0df5]" : "text-[#adb5bd]",
                ].join(" ")
              }
            >
              {tab.to === "/falls" ? (
                fallStatus === "fallen" ? (
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path
                      d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
                      fill="#e11d48"
                    />
                    <line
                      x1="12"
                      y1="9"
                      x2="12"
                      y2="13"
                      stroke="white"
                      strokeWidth="2.5"
                    />
                    <line
                      x1="12"
                      y1="17"
                      x2="12.01"
                      y2="17"
                      stroke="white"
                      strokeWidth="2.5"
                    />
                  </svg>
                ) : (
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                )
              ) : (
                tab.icon
              )}
              <span>{tab.label}</span>
              {tab.badge && alertBadgeCount > 0 && (
                <span className="absolute top-0 right-[calc(50%-18px)] inline-flex size-4 items-center justify-center rounded-full border-2 border-white bg-rose-500 text-[9px] font-extrabold text-white">
                  {alertBadgeCount}
                </span>
              )}
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  );
}
