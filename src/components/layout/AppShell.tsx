import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { usePatientData } from "../../hooks/usePatientData";
import type {
  AlertFilter,
  AlertItem,
  FallStatus,
  PatientContext,
} from "../../types/monitoring";
import { alerts } from "../../data/mock";

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
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <line x1="17" y1="11" x2="17" y2="17" />
        <line x1="14" y1="14" x2="20" y2="14" />
      </svg>
    ),
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

export function AppShell() {
  const { frame, connected } = usePatientData();
  const [filter, setFilter] = useState<AlertFilter>("all");
  const [devFallen, setDevFallen] = useState(false);
  const [alertActions, setAlertActions] = useState<Record<string, string>>({
    a3: "Dismissed",
    a7: "Resolved",
  });
  const [fallResolvedAt, setFallResolvedAt] = useState<string | null>(null);
  const [liveFallSnapshot, setLiveFallSnapshot] = useState<AlertItem | null>(
    null,
  );

  const fallStatus: FallStatus = devFallen ? "fallen" : "not_fallen";

  function onAlertAction(id: string, label: string) {
    setAlertActions((prev) => ({ ...prev, [id]: label }));
    if (id === "live-fall" && label === "Resolved") {
      setFallResolvedAt(
        new Date().toLocaleTimeString("en-SG", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      );
      setDevFallen(false);
    }
  }

  const ROOM_LABELS: Record<string, string> = {
    living_room: "Living / Dining",
    bathroom: "Bathroom",
    bedroom: "Bedroom",
    kitchen: "Kitchen",
  };

  function handleDevToggle() {
    if (!devFallen) {
      // Triggering a new fall — clear previous state and capture a snapshot
      setAlertActions((prev) => {
        const next = { ...prev };
        delete next["live-fall"];
        return next;
      });
      setFallResolvedAt(null);
      const room = frame?.room ?? "bathroom";
      setLiveFallSnapshot({
        id: "live-fall",
        severity: "critical",
        iconType: "alert-triangle",
        title: "Fall detected",
        detail: `${ROOM_LABELS[room] ?? room} · Just now`,
        context: "Emergency contacts notified",
        time: "Just now",
      });
    } else {
      // Manually toggling back to safe — discard the fall alert entirely
      setLiveFallSnapshot(null);
      setAlertActions((prev) => {
        const next = { ...prev };
        delete next["live-fall"];
        return next;
      });
      setFallResolvedAt(null);
    }
    setDevFallen((v) => !v);
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
  };

  const openStatic = alerts.filter(
    (a) =>
      (a.severity === "critical" || a.severity === "warning") &&
      !alertActions[a.id],
  ).length;
  const openLiveFall = liveFallSnapshot && !alertActions["live-fall"] ? 1 : 0;
  const alertBadgeCount = openStatic + openLiveFall;

  return (
    <div className="flex min-h-screen justify-center bg-slate-100">
      <div className="relative h-dvh max-h-233 w-full max-w-107.5 overflow-hidden bg-slate-50">
        <div className="absolute inset-x-0 top-0 bottom-20.5 overflow-y-auto pb-6">
          <Outlet context={context} />
        </div>

        {/* Dev toggle — manual fall state control */}
        <button
          onClick={handleDevToggle}
          className="absolute top-2 left-2 z-30 rounded-full px-3 py-1 text-[11px] font-bold border"
          style={{
            background: devFallen ? "#fff1f2" : "#f0fdfa",
            color: devFallen ? "#e11d48" : "#0d9488",
            borderColor: devFallen ? "#fecdd3" : "#99f6e4",
          }}
        >
          {devFallen ? "Fallen" : "Safe"}
        </button>

        <div className="absolute inset-x-0 bottom-0 z-20 flex h-20.5 items-start border-t border-slate-200 bg-white/90 px-1 pt-2.5 pb-4 backdrop-blur-xl">
          {NAV_TABS.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={({ isActive }) =>
                [
                  "relative flex flex-1 flex-col items-center gap-1 text-[10px] font-medium",
                  isActive ? "text-teal-600" : "text-slate-400",
                ].join(" ")
              }
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.badge && (
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
