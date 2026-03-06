import { useOutletContext } from "react-router-dom";
import { cn } from "../lib/utils";
import type { PatientContext } from "../types/monitoring";
import { eventRows } from "../data/mock";

const ROOM_LABELS: Record<string, string> = {
  living_room: "Living / Dining",
  bathroom: "Bathroom",
  bedroom: "Bedroom",
  kitchen: "Kitchen",
};

const toneColor: Record<string, string> = {
  ok: "bg-slate-300",
  notice: "bg-teal-500",
  warning: "bg-amber-500",
  critical: "bg-rose-500",
};

const toneRing: Record<string, string> = {
  critical: "ring-4 ring-rose-200",
};

export function FallsPage() {
  const { frame, connected, fallStatus, fallResolvedAt } =
    useOutletContext<PatientContext>();
  const isFallen = fallStatus === "fallen";
  const room = frame?.room ?? "bathroom";
  const roomLabel = ROOM_LABELS[room] ?? room;
  const heartRate = frame?.heartRate ?? 88;
  const motion = frame?.motion ?? (isFallen ? "still" : "active");

  const subtitle = connected ? `Live · Updated just now` : "Connecting…";

  return (
    <div className="pb-5">
      {/* Page header */}
      <div className="px-5 pt-4 pb-2">
        <p
          className="text-[28px] leading-none text-slate-900"
          style={{
            fontFamily: "'Fraunces', Georgia, serif",
            fontWeight: 700,
            letterSpacing: "-0.01em",
          }}
        >
          Fall Alert
        </p>
        <p className="text-[13px] text-slate-400 mt-1">{subtitle}</p>
      </div>

      <div className="space-y-2.5 px-4">
        {/* Fall status card */}
        <div
          className={cn(
            "rounded-[24px] p-[18px]",
            isFallen ? "bg-rose-50" : "bg-emerald-50 border border-[#a7f3d0]",
          )}
        >
          <div className="flex items-center gap-2.5 mb-3">
            <div
              className={cn(
                "size-10 rounded-[12px] flex items-center justify-center flex-shrink-0",
                isFallen ? "bg-rose-500" : "bg-emerald-500",
              )}
            >
              {isFallen ? (
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              ) : (
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </div>
            <div>
              <p
                className={cn(
                  "text-[16px] font-bold leading-snug",
                  isFallen ? "text-[#881337]" : "text-[#064e3b]",
                )}
              >
                {isFallen ? "Ashley has fallen" : "No fall detected today"}
              </p>
              <p
                className={cn(
                  "text-[13px] mt-0.5",
                  isFallen ? "text-rose-500" : "text-emerald-600",
                )}
              >
                {isFallen
                  ? `${roomLabel} · Still on floor`
                  : `${roomLabel} · Monitoring active`}
              </p>
            </div>
          </div>

          {/* Interpretation grid */}
          <div className="grid grid-cols-2 gap-2">
            {[
              ["Location", roomLabel, isFallen ? "crit" : "ok"],
              [
                "Duration",
                isFallen ? "2 min 14 sec" : "Active",
                isFallen ? "crit" : "ok",
              ],
              [
                "Movement",
                motion === "still"
                  ? "Still"
                  : motion === "active"
                    ? "Active"
                    : "None",
                motion === "still" ? "warn" : "ok",
              ],
              ["Heart Rate", `${heartRate} bpm`, "ok"],
            ].map(([label, value, tone]) => (
              <div
                key={label}
                className="bg-white border border-slate-100 rounded-[14px] p-3"
              >
                <p className="text-[10px] font-bold tracking-[.07em] uppercase text-slate-400">
                  {label}
                </p>
                <p
                  className={cn(
                    "text-[14px] font-bold mt-0.5",
                    tone === "crit"
                      ? "text-rose-500"
                      : tone === "warn"
                        ? "text-amber-500"
                        : "text-emerald-600",
                  )}
                >
                  {value}
                </p>
              </div>
            ))}
          </div>

          {/* Action buttons — fallen state only */}
          {isFallen && (
            <div className="flex gap-2 mt-3">
              <button className="flex-1 py-2.5 rounded-[10px] bg-rose-500 text-white text-[13px] font-bold cursor-pointer">
                Call Emergency
              </button>
              <button
                className="flex-1 py-2.5 rounded-[10px] text-[#881337] text-[13px] font-bold cursor-pointer"
                style={{ background: "rgba(0,0,0,0.08)" }}
              >
                False Alarm
              </button>
            </div>
          )}
        </div>

        {/* Fall risk level */}
        <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm p-4">
          <div className="flex justify-between items-center mb-3">
            <div>
              <p className="text-[12px] font-bold text-slate-700">
                Fall Risk Level
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Based on current sensor data
              </p>
            </div>
            <span
              className={cn(
                "text-[13px] font-bold",
                isFallen ? "text-rose-500" : "text-emerald-600",
              )}
            >
              {isFallen ? "High" : "Low"}
            </span>
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 mb-1">
            <span>Low</span>
            <span>Medium</span>
            <span>High</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-700",
                isFallen ? "bg-rose-500" : "bg-emerald-500",
              )}
              style={{ width: isFallen ? "85%" : "15%" }}
            />
          </div>
        </div>

        {/* Timeline — shown when fallen or when a resolved timestamp exists */}
        {(isFallen || fallResolvedAt) && (
          <>
            <p className="text-[11px] font-bold tracking-[.08em] text-slate-400 uppercase px-1">
              What happened
            </p>
            <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm p-4">
              <div className="relative pl-7">
                {eventRows.map(([time, title, sub, tone], idx) => {
                  const isLast =
                    idx === eventRows.length - 1 && !fallResolvedAt;
                  return (
                    <div key={idx} className="relative pb-4 last:pb-0">
                      <div
                        className={cn(
                          "absolute -left-7 top-0.5 size-3 rounded-full border-2 border-white",
                          toneColor[tone],
                          tone === "critical" && toneRing[tone],
                        )}
                      />
                      {!isLast && (
                        <div className="absolute -left-[22px] top-3.5 bottom-0 w-px bg-slate-200" />
                      )}
                      <p className="text-[11px] font-bold text-slate-400">
                        {time}
                      </p>
                      <p className="text-[13px] font-semibold text-slate-800 mt-0.5">
                        {title}
                      </p>
                      <p className="text-[12px] text-slate-400 mt-0.5">{sub}</p>
                    </div>
                  );
                })}
                {fallResolvedAt && (
                  <div className="relative pb-0">
                    <div className="absolute -left-7 top-0.5 size-3 rounded-full border-2 border-white bg-emerald-500" />
                    <p className="text-[11px] font-bold text-slate-400">
                      {fallResolvedAt}
                    </p>
                    <p className="text-[13px] font-semibold text-emerald-700 mt-0.5">
                      Resolved by caregiver
                    </p>
                    <p className="text-[12px] text-slate-400 mt-0.5">
                      Alert marked as resolved
                    </p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* AI insight */}
        <div className="bg-slate-900 rounded-[24px] p-4">
          <div className="flex items-center gap-1.5 mb-2">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#5eead4"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            <span className="text-[10px] font-extrabold tracking-[.1em] uppercase text-teal-300">
              AI Insight
            </span>
          </div>
          <p className="text-[13px] leading-relaxed text-white/80">
            {isFallen
              ? "Ashley fell in the bathroom at 1:23 PM and has not recovered. Motion has been minimal since impact. EMS has been contacted. Consider checking whether grab bars are installed in the bathroom."
              : `Latest sensor readings indicate no fall state. Motion and body movement patterns are consistent with normal indoor activity. Continue regular monitoring.`}
          </p>
        </div>
      </div>
    </div>
  );
}
