import { useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import { cn } from "../lib/utils";
import { AlertRow } from "../components/shared/AlertRow";
import type { PatientContext } from "../types/monitoring";
import type { AlertFilter } from "../types/monitoring";

const FILTER_PILLS: { label: string; value: AlertFilter | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Critical", value: "critical" },
  { label: "Warning", value: "warning" },
  { label: "Notice", value: "notice" },
];

export function AlertsPage() {
  const {
    filter,
    setFilter,
    alertActions,
    onAlertAction,
    liveFallSnapshot,
    alerts,
  } = useOutletContext<PatientContext>();
  const visibleAlerts = useMemo(
    () => alerts.filter((item) => filter === "all" || item.severity === filter),
    [filter, alerts],
  );

  const showLiveFall =
    liveFallSnapshot !== null && (filter === "all" || filter === "critical");

  return (
    <div className="pb-5">
      {/* Page header */}
      <div className="flex justify-between items-start px-5 pt-4 pb-6">
        <div>
          <p
            className="text-[28px] leading-none text-[#212529]"
            style={{
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 700,
              letterSpacing: "-0.01em",
            }}
          >
            Alerts
          </p>
          <p className="text-[13px] text-[#6c757d] mt-1">Last 7 days</p>
        </div>
        <button className="size-10 rounded-full bg-[#E8EAFF] flex items-center justify-center text-[14px] font-bold text-[#5b0df5] mt-1">
          LC
        </button>
      </div>

      <div className="px-4 space-y-2">

        {/* Filter pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {FILTER_PILLS.map((pill) => (
            <button
              key={pill.value}
              onClick={() => setFilter(pill.value as AlertFilter)}
              className={cn(
                "px-3.5 py-1 rounded-full text-[12px] font-semibold cursor-pointer flex-shrink-0 whitespace-nowrap border-[1.5px] transition-colors",
                filter === pill.value
                  ? "bg-[#5b0df5] text-white border-[#5b0df5]"
                  : "bg-white text-[#6c757d] border-[#E8EAFF]",
              )}
            >
              {pill.label}
            </button>
          ))}
        </div>

        {/* Alert cards */}
        <div className="space-y-2 pt-0.5">
          {showLiveFall && liveFallSnapshot && (
            <AlertRow
              alert={liveFallSnapshot}
              actionTaken={alertActions["live-fall"] ?? null}
              onAction={(label) => onAlertAction("live-fall", label)}
            />
          )}
          {visibleAlerts.map((item) => (
            <AlertRow
              key={item.id}
              alert={item}
              actionTaken={alertActions[item.id] ?? null}
              onAction={(label) => onAlertAction(item.id, label)}
            />
          ))}
          {!showLiveFall && visibleAlerts.length === 0 && (
            <div className="rounded-[20px] border border-[#E8EAFF] bg-[#f8f8ff] px-4 py-6 text-center">
              <p className="text-sm text-[#6c757d]">
                No alerts for this filter.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
