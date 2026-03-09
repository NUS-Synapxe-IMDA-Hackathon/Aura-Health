import { useState } from "react";
import type { ReactNode } from "react";
import { useOutletContext } from "react-router-dom";
import { cn } from "../lib/utils";
import { Card, CardContent } from "../components/ui/card";
import type { Incident, PatientContext } from "../types/monitoring";
import { mockIncident } from "../data/mock";
import { useSleepData } from "../hooks/useSleepData";

const STATUS_LABEL: Record<string, string> = {
  assessing: "Assessing…",
  needs_attention: "Needs Attention",
  being_handled: "Being Handled",
  escalated: "Escalated",
  resolved: "Resolved",
};

const MOMENT_DOT: Record<string, string> = {
  info: "bg-sky-400",
  warning: "bg-amber-400",
  critical: "bg-rose-500",
};

const TAG_STYLE: Record<string, string> = {
  critical: "bg-rose-50 border border-rose-100 text-rose-600",
  warning: "bg-amber-50 border border-amber-100 text-amber-600",
  info: "bg-sky-50 border border-sky-100 text-sky-600",
};

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn(
        "transition-transform text-[#6c757d]",
        open ? "rotate-180" : "",
      )}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function IncidentDetail({
  incident,
  isResolved,
  resolutionLabel,
  onResolve,
  onBack,
}: {
  incident: Incident;
  isResolved: boolean;
  resolutionLabel?: string;
  onResolve?: (type: "resolved" | "false_alarm") => void;
  onBack?: () => void;
}) {
  const [detectionOpen, setDetectionOpen] = useState(true);
  const [timelineOpen, setTimelineOpen] = useState(true);

  const resolvedAsFalseAlarm = resolutionLabel === "False Alarm";

  return (
    <div className="space-y-3 px-4">
      {/* Top banner */}
      <div
        className={cn(
          "rounded-[24px] p-4",
          isResolved
            ? resolvedAsFalseAlarm
              ? "bg-[#f8f8ff] border border-[#E8EAFF]"
              : "bg-emerald-50 border border-emerald-100"
            : "bg-rose-50",
        )}
      >
        {onBack && (
          <button
            className="flex items-center gap-1 mb-3 text-[#6c757d] touch-manipulation"
            onClick={onBack}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
            <span className="text-[12px] font-semibold">Back</span>
          </button>
        )}
        <div className="flex items-center gap-2 mb-2">
          {isResolved ? (
            <span
              className={cn(
                "text-[10px] font-extrabold tracking-[.1em] uppercase",
                resolvedAsFalseAlarm ? "text-[#6c757d]" : "text-emerald-600",
              )}
            >
              {resolutionLabel}
            </span>
          ) : (
            <>
              <span className="text-[10px] font-extrabold tracking-[.1em] uppercase text-rose-500">
                Critical
              </span>
              <span className="text-[#adb5bd]">·</span>
              <span className="text-[10px] font-bold text-rose-400">
                {STATUS_LABEL[incident.status]}
              </span>
            </>
          )}
        </div>
        <p
          className={cn(
            "text-[22px] font-bold leading-tight",
            isResolved
              ? resolvedAsFalseAlarm
                ? "text-[#212529]"
                : "text-emerald-900"
              : "text-rose-900",
          )}
        >
          {incident.headline}
        </p>
        <p
          className={cn(
            "text-[13px] mt-1",
            isResolved ? "text-[#6c757d]" : "text-rose-400",
          )}
        >
          Since 1:23 PM · Living / Dining
        </p>
      </div>

      {/* Narrative + tags */}
      <Card className="rounded-3xl py-4">
        <CardContent className="px-4">
          <p className="text-[15px] font-bold text-[#212529] mb-2">
            What Happened
          </p>
          <p className="text-[13px] text-[#6c757d] leading-relaxed mb-3">
            {incident.narrative}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {(incident.tags ?? []).map((tag, i) => (
              <span
                key={i}
                className={cn(
                  "text-[11px] font-semibold px-2.5 py-1 rounded-full",
                  TAG_STYLE[tag.tone],
                )}
              >
                {tag.label}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Voice — What Alex Said */}
      {incident.voice && (
        <Card className="rounded-3xl py-4">
          <CardContent className="px-4">
            <p className="text-[15px] font-bold text-[#212529] mb-3">
              What Alex Said
            </p>
            <div className="space-y-3">
              {incident.voice.exchanges.map((ex, i) => (
                <div key={i}>
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span
                      className={cn(
                        "text-[10px] font-extrabold tracking-wide uppercase",
                        ex.speaker === "aura"
                          ? "text-[#5b0df5]"
                          : "text-rose-400",
                      )}
                    >
                      {ex.speaker === "aura" ? "AURA" : "Alex"}
                    </span>
                    {ex.emotion && (
                      <span className="text-[10px] text-amber-500 font-semibold">
                        · {ex.emotion}
                      </span>
                    )}
                  </div>
                  <p
                    className={cn(
                      "text-[13px] leading-snug",
                      ex.speaker === "aura"
                        ? "text-[#6c757d] italic"
                        : "text-[#212529]",
                    )}
                  >
                    "{ex.text}"
                  </p>
                </div>
              ))}
            </div>
            {incident.voice.summary && (
              <p className="mt-3 text-[12px] text-[#6c757d] italic border-t border-[#E8EAFF] pt-2.5">
                {incident.voice.summary}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Video — What the Camera Saw */}
      <Card className="rounded-3xl py-4">
        <CardContent className="px-4">
          <p className="text-[15px] font-bold text-[#212529] mb-3">
            What the Camera Saw
          </p>
          <div className="relative bg-[#212529] rounded-xl h-36 flex items-center justify-center mb-3">
            <div className="w-11 h-11 rounded-full bg-white/20 flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            </div>
            <span className="absolute bottom-2 right-3 text-white/50 text-[10px] font-mono">
              0:15
            </span>
            <span className="absolute top-2 left-3 text-[9px] font-bold uppercase tracking-wide text-white/40">
              {isResolved ? "Recording" : "Analyzing…"}
            </span>
          </div>
          {incident.video && (
            <>
              <div className="space-y-2 mb-3">
                {incident.video.moments.map((m, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <div
                      className={cn(
                        "mt-1 w-2 h-2 rounded-full flex-shrink-0",
                        MOMENT_DOT[m.significance],
                      )}
                    />
                    <span className="text-[11px] font-bold text-[#6c757d] w-7 flex-shrink-0">
                      {m.time}
                    </span>
                    <span className="text-[12px] text-[#6c757d]">
                      {m.description}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t border-[#E8EAFF] pt-3 space-y-1.5">
                {[
                  ["Cause", incident.video.cause],
                  ["Mobility", incident.video.mobility],
                  ["Injuries", incident.video.injuries.join(", ")],
                  ["Environment", incident.video.environment.join(", ")],
                ].map(([label, value]) => (
                  <div key={label} className="flex gap-2">
                    <span className="text-[11px] font-bold text-[#6c757d] w-20 flex-shrink-0">
                      {label}
                    </span>
                    <span className="text-[12px] text-[#212529]">{value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Detection Snapshot — collapsible */}
      {incident.detection && (
        <Card className="rounded-3xl py-4">
          <CardContent className="px-4">
            <button
              className="flex w-full items-center justify-between touch-manipulation"
              onClick={() => setDetectionOpen(!detectionOpen)}
            >
              <p className="text-[15px] font-bold text-[#212529]">
                Detection Snapshot
              </p>
              <ChevronIcon open={detectionOpen} />
            </button>
            {detectionOpen && (
              <div className="mt-3 space-y-1.5">
                {[
                  ["Posture", incident.detection.posture_transition],
                  [
                    "Impact",
                    incident.detection.impact_intensity
                      .charAt(0)
                      .toUpperCase() +
                      incident.detection.impact_intensity.slice(1),
                  ],
                  ["Confidence", `${incident.detection.confidence}%`],
                  ["Method", incident.detection.method],
                ].map(([label, value]) => (
                  <div key={label} className="flex gap-2">
                    <span className="text-[11px] font-bold text-[#6c757d] w-20 flex-shrink-0">
                      {label}
                    </span>
                    <span className="text-[12px] text-[#212529]">{value}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* AI Assessment */}
      {incident.ai_assessment && (
        <div className="bg-[#212529] rounded-[24px] p-4">
          <div className="flex items-center gap-1.5 mb-2">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#6aeff3"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            <span className="text-[10px] font-extrabold tracking-[.1em] uppercase text-[#6aeff3]">
              AI Assessment
            </span>
          </div>
          <p className="text-[13px] leading-relaxed text-white/80 mb-3">
            {incident.ai_assessment.reasoning}
          </p>
          <p className="text-[10px] font-bold tracking-wide uppercase text-[#6aeff3] mb-1.5">
            Recommended
          </p>
          <div className="space-y-1">
            {incident.ai_assessment.recommended_actions.map((action, i) => (
              <div key={i} className="flex items-start gap-2">
                <div className="mt-1.5 w-1 h-1 rounded-full bg-[#6aeff3] flex-shrink-0" />
                <p className="text-[12px] text-white/70">{action}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Event Timeline — collapsible */}
      <Card className="rounded-3xl py-4">
        <CardContent className="px-4">
          <button
            className="flex w-full items-center justify-between touch-manipulation"
            onClick={() => setTimelineOpen(!timelineOpen)}
          >
            <p className="text-[15px] font-bold text-[#212529]">Timeline</p>
            <ChevronIcon open={timelineOpen} />
          </button>
          {timelineOpen && (
            <div className="relative pl-7 mt-3">
              {(incident.event_timeline ?? []).map((ev, idx) => {
                const isLast =
                  idx === (incident.event_timeline ?? []).length - 1;
                return (
                  <div key={idx} className="relative pb-4 last:pb-0">
                    <div
                      className={cn(
                        "absolute -left-7 top-0.5 size-3 rounded-full border-2 border-white",
                        idx === 0
                          ? "bg-rose-500 ring-4 ring-rose-100"
                          : isLast && isResolved
                            ? resolvedAsFalseAlarm
                              ? "bg-slate-400"
                              : "bg-emerald-500"
                            : isLast
                              ? "bg-amber-400"
                              : "bg-slate-300",
                      )}
                    />
                    {!isLast && (
                      <div className="absolute -left-[22px] top-3.5 bottom-0 w-px bg-[#f8f8ff]" />
                    )}
                    <p className="text-[11px] font-bold text-[#6c757d]">
                      {ev.timestamp}
                    </p>
                    <p
                      className={cn(
                        "text-[13px] font-semibold mt-0.5",
                        isLast && isResolved
                          ? resolvedAsFalseAlarm
                            ? "text-[#6c757d]"
                            : "text-emerald-700"
                          : "text-[#212529]",
                      )}
                    >
                      {ev.label}
                    </p>
                    {ev.detail && (
                      <p className="text-[12px] text-[#6c757d] mt-0.5">
                        {ev.detail}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action buttons — only shown when incident is live */}
      {!isResolved && onResolve && (
        <>
          <div className="grid grid-cols-2 gap-2">
            {(incident.available_actions ?? []).map((action) => (
              <button
                key={action.id}
                className={cn(
                  "py-3 rounded-[14px] text-[13px] font-bold touch-manipulation",
                  action.id === "ACK"
                    ? "bg-rose-500 text-white"
                    : "bg-[#f8f8ff] text-[#212529]",
                )}
              >
                {action.label}
              </button>
            ))}
          </div>

          {/* Resolution buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              className="py-3 rounded-[14px] text-[13px] font-bold bg-emerald-500 text-white touch-manipulation"
              onClick={() => onResolve("resolved")}
            >
              Resolved
            </button>
            <button
              className="py-3 rounded-[14px] text-[13px] font-bold bg-[#E8EAFF] text-[#6c757d] touch-manipulation"
              onClick={() => onResolve("false_alarm")}
            >
              False Alarm
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Fall Risk Report ────────────────────────────────────────────────────────

const RISK_BADGE: Record<string, string> = {
  low: "bg-emerald-50 text-emerald-700",
  medium: "bg-amber-50 text-amber-700",
  high: "bg-rose-50 text-rose-600",
};

function RiskBadge({ level }: { level: "low" | "medium" | "high" }) {
  return (
    <span
      className={cn(
        "text-[11px] font-bold px-2 py-0.5 rounded-full capitalize",
        RISK_BADGE[level],
      )}
    >
      {level}
    </span>
  );
}

function ReportCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="bg-white rounded-[24px] border border-[#E8EAFF] shadow-[0_2px_8px_rgba(91,13,245,0.06)] p-4 space-y-3">
      <p className="text-[15px] font-bold text-[#212529]">{title}</p>
      {children}
    </div>
  );
}

function MetricRow({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="flex justify-between items-baseline">
      <span className="text-[12px] text-[#6c757d]">{label}</span>
      <span className="text-[12px] font-semibold text-[#212529] text-right">
        {value}
        {sub && (
          <span className="text-[11px] text-[#6c757d] font-normal ml-1">
            {sub}
          </span>
        )}
      </span>
    </div>
  );
}

function HazardRow({ room, hazards }: { room: string; hazards: string[] }) {
  return (
    <div>
      <p className="text-[11px] font-bold text-[#6c757d] uppercase tracking-[.06em] mb-1">
        {room}
      </p>
      {hazards.length === 0 ? (
        <p className="text-[12px] text-emerald-600 font-medium">
          No hazards detected
        </p>
      ) : (
        hazards.map((h) => (
          <div key={h} className="flex items-start gap-1.5 mb-0.5">
            <span className="mt-1 size-1.5 rounded-full bg-amber-400 flex-shrink-0" />
            <span className="text-[12px] text-[#212529]">{h}</span>
          </div>
        ))
      )}
    </div>
  );
}

function HistoricalRiskCard({ scores }: { scores: number[] }) {
  const W = 295;
  const H = 80;
  const pad = { t: 6, b: 18, l: 4, r: 4 };
  const n = scores.length;
  const max = 100;

  // Build SVG polyline points
  const pts = scores.map((v, i) => {
    const x = pad.l + (i / (n - 1)) * (W - pad.l - pad.r);
    const y = pad.t + (1 - v / max) * (H - pad.t - pad.b);
    return [x, y] as [number, number];
  });
  const polyline = pts
    .map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`)
    .join(" ");

  // Area fill path
  const areaPath =
    `M${pts[0][0].toFixed(1)},${(H - pad.b).toFixed(1)} ` +
    pts.map(([x, y]) => `L${x.toFixed(1)},${y.toFixed(1)}`).join(" ") +
    ` L${pts[n - 1][0].toFixed(1)},${(H - pad.b).toFixed(1)} Z`;

  // Trend: compare last 7 vs prior 7
  const recent = scores.slice(-7).reduce((a, b) => a + b, 0) / 7;
  const prior = scores.slice(-14, -7).reduce((a, b) => a + b, 0) / 7;
  const diff = recent - prior;
  const trend = diff < -3 ? "Improving" : diff > 3 ? "Worsening" : "Stable";
  const trendColor =
    trend === "Improving"
      ? "text-emerald-600"
      : trend === "Worsening"
        ? "text-rose-500"
        : "text-amber-600";

  const current = scores[scores.length - 1];
  const peak = Math.max(...scores);

  // Week labels: 4 evenly spaced
  const weekLabels = ["Week 1", "Week 2", "Week 3", "Week 4"];
  const weekXs = [0, 1, 2, 3].map((i) => pad.l + (i / 3) * (W - pad.l - pad.r));

  // Risk zone thresholds in y coords
  const yMed = pad.t + (1 - 33 / max) * (H - pad.t - pad.b);
  const yHigh = pad.t + (1 - 66 / max) * (H - pad.t - pad.b);

  return (
    <div className="bg-white rounded-[24px] border border-[#E8EAFF] shadow-[0_2px_8px_rgba(91,13,245,0.06)] p-4 space-y-3">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-[15px] font-bold text-[#212529]">
            Historical Risk
          </p>
          <p className="text-[11px] text-[#6c757d] mt-0.5">Past 28 days</p>
        </div>
        <span className={`text-[12px] font-bold ${trendColor}`}>{trend}</span>
      </div>

      {/* Chart */}
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto overflow-visible">
        {/* Risk zone bands */}
        <rect
          x={pad.l}
          y={pad.t}
          width={W - pad.l - pad.r}
          height={yMed - pad.t}
          fill="#fef2f2"
          opacity="0.6"
        />
        <rect
          x={pad.l}
          y={yMed}
          width={W - pad.l - pad.r}
          height={yHigh - yMed}
          fill="#fffbeb"
          opacity="0.6"
        />
        <rect
          x={pad.l}
          y={yHigh}
          width={W - pad.l - pad.r}
          height={H - pad.b - yHigh}
          fill="#f0fdf4"
          opacity="0.6"
        />

        {/* Area fill */}
        <path d={areaPath} fill="#5b0df5" opacity="0.08" />

        {/* Line */}
        <polyline
          points={polyline}
          fill="none"
          stroke="#5b0df5"
          strokeWidth="1.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Current value dot */}
        <circle cx={pts[n - 1][0]} cy={pts[n - 1][1]} r="3" fill="#5b0df5" />

        {/* Week labels */}
        {weekLabels.map((label, i) => (
          <text
            key={label}
            x={weekXs[i]}
            y={H - 2}
            fontSize="8"
            fill="#adb5bd"
            textAnchor={i === 0 ? "start" : i === 3 ? "end" : "middle"}
          >
            {label}
          </text>
        ))}
      </svg>

      {/* Legend */}
      <div className="flex gap-3">
        <div className="flex items-center gap-1">
          <span className="size-2 rounded-full bg-rose-200 inline-block" />
          <span className="text-[10px] text-[#6c757d]">High</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="size-2 rounded-full bg-amber-200 inline-block" />
          <span className="text-[10px] text-[#6c757d]">Medium</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="size-2 rounded-full bg-emerald-200 inline-block" />
          <span className="text-[10px] text-[#6c757d]">Low</span>
        </div>
      </div>

      <div className="border-t border-[#E8EAFF] pt-2 grid grid-cols-2 gap-y-1">
        <span className="text-[12px] text-[#6c757d]">Current score</span>
        <span className="text-[12px] font-semibold text-[#212529] text-right">
          {current} / 100
        </span>
        <span className="text-[12px] text-[#6c757d]">Peak this month</span>
        <span className="text-[12px] font-semibold text-[#212529] text-right">
          {peak} / 100
        </span>
        <span className="text-[12px] text-[#6c757d]">7-day avg</span>
        <span className="text-[12px] font-semibold text-[#212529] text-right">
          {recent.toFixed(0)} / 100
        </span>
      </div>
    </div>
  );
}

function PastIncidentCard({
  incident,
  resolution,
  time,
  onView,
}: {
  incident: Incident;
  resolution: "resolved" | "false_alarm";
  time: string;
  onView?: () => void;
}) {
  const isFalseAlarm = resolution === "false_alarm";
  return (
    <div
      className="bg-white rounded-[20px] border border-[#E8EAFF] shadow-[0_2px_8px_rgba(91,13,245,0.06)] overflow-hidden mb-2"
      style={{
        borderLeft: `3px solid ${isFalseAlarm ? "#94a3b8" : "#10b981"}`,
      }}
    >
      <div className="flex items-start gap-3 p-3.5">
        <div
          className={cn(
            "size-9 rounded-[10px] flex items-center justify-center flex-shrink-0",
            isFalseAlarm ? "bg-[#f8f8ff]" : "bg-emerald-50",
          )}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke={isFalseAlarm ? "#94a3b8" : "#10b981"}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start gap-2">
            <p className="text-[13px] font-semibold text-[#212529] leading-snug">
              {incident.headline}
            </p>
            <span className="text-[11px] text-[#6c757d] flex-shrink-0">
              {time}
            </span>
          </div>
          <p
            className={cn(
              "text-[11px] font-semibold mt-0.5",
              isFalseAlarm ? "text-[#6c757d]" : "text-emerald-600",
            )}
          >
            {isFalseAlarm ? "False Alarm" : "Resolved"}
          </p>
          <p className="text-[12px] text-[#6c757d] mt-0.5">
            {(incident.tags ?? []).map((t) => t.label).join(" · ")}
          </p>
        </div>
      </div>
      {onView && (
        <div className="flex gap-2 mx-3.5 mb-3.5 pt-2.5 border-t border-[#E8EAFF]">
          <button
            className="flex-1 py-1.5 px-2.5 rounded-[10px] text-[12px] font-semibold bg-[#212529] text-white cursor-pointer touch-manipulation"
            onClick={onView}
          >
            View Report
          </button>
        </div>
      )}
    </div>
  );
}

function FallRiskReport({
  onBack,
  riskScores,
}: {
  onBack: () => void;
  riskScores: number[];
}) {
  const { session: s, loading } = useSleepData();

  const score = s?.sleep_quality_score ?? null;
  const durationH = s ? Math.floor(s.total_sleep_minutes / 60) : null;
  const durationM = s ? s.total_sleep_minutes % 60 : null;
  const efficiency = s ? `${s.sleep_efficiency.toFixed(1)}%` : "--";
  const apnea = s ? `${s.total_apnea_events}` : "--";

  const sleepRiskLevel: "low" | "medium" | "high" =
    score === null
      ? "low"
      : score >= 70
        ? "low"
        : score >= 50
          ? "medium"
          : "high";

  const sleepInsight = loading
    ? "Loading sleep data…"
    : score === null
      ? "No recent sleep session available."
      : score >= 70
        ? "Sleep quality is good. No significant contribution to fall risk from sleep patterns."
        : score >= 50
          ? "Sleep quality is fair. Poor sleep can reduce reaction time — monitor closely."
          : "Poor sleep detected. Fatigue increases fall risk — consider discussing with a clinician.";

  return (
    <div className="pb-5">
      {/* Header */}
      <div className="flex justify-between items-start px-5 pt-4 pb-6">
        <div>
          <button
            className="flex items-center gap-1 mb-2 text-[#6c757d] touch-manipulation"
            onClick={onBack}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
            <span className="text-[12px] font-semibold">Back</span>
          </button>
          <p
            className="text-[28px] leading-none text-[#212529]"
            style={{
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 700,
              letterSpacing: "-0.01em",
            }}
          >
            Risk Report
          </p>
          <p className="text-[13px] text-[#6c757d] mt-1">Updated 7 Mar 2026</p>
        </div>
        <button className="size-10 rounded-full bg-[#E8EAFF] flex items-center justify-center text-[14px] font-bold text-[#5b0df5] mt-1">
          LC
        </button>
      </div>

      {/* Overall risk bar */}
      <div className="px-4 mb-3">
        <div className="bg-white rounded-[24px] border border-[#E8EAFF] shadow-[0_2px_8px_rgba(91,13,245,0.06)] p-4">
          <div className="flex justify-between items-center mb-3">
            <div>
              <p className="text-[15px] font-bold text-[#212529]">
                Overall Fall Risk
              </p>
              <p className="text-[11px] text-[#6c757d] mt-0.5">
                Score: 15 / 100
              </p>
            </div>
            <RiskBadge level="low" />
          </div>
          <div className="flex justify-between text-[10px] text-[#6c757d] mb-1">
            <span>Low</span>
            <span>Medium</span>
            <span>High</span>
          </div>
          <div className="h-2 bg-[#f8f8ff] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-emerald-500"
              style={{ width: "15%" }}
            />
          </div>
        </div>
      </div>

      <div className="space-y-2.5 px-4">
        {/* Gait Analysis */}
        <ReportCard title="Gait Analysis">
          <MetricRow
            label="Gait speed"
            value="1.12 m/s"
            sub="≥ 1.0 m/s normal"
          />
          <MetricRow label="Step length" value="58 cm" />
          <MetricRow
            label="Stride variability"
            value="11%"
            sub="< 20% normal"
          />
          <MetricRow label="Symmetry" value="96%" />
          <MetricRow label="Cadence" value="112 steps/min" />
          <MetricRow label="7-day trend" value="Stable" />
          <div className="flex justify-between items-center pt-1 border-t border-[#E8EAFF]">
            <span className="text-[11px] text-[#6c757d]">
              Risk contribution
            </span>
            <RiskBadge level="low" />
          </div>
        </ReportCard>

        {/* Sit-to-Stand Test */}
        <ReportCard title="Sit-to-Stand Test">
          <MetricRow label="5-rep time" value="10.4 s" sub="≤ 12s normal" />
          <MetricRow label="Assists needed" value="None" />
          <MetricRow label="Last tested" value="6 Mar 2026" />
          <MetricRow label="vs. baseline" value="−0.8 s" sub="improved" />
          <div className="flex justify-between items-center pt-1 border-t border-[#E8EAFF]">
            <span className="text-[11px] text-[#6c757d]">
              Risk contribution
            </span>
            <RiskBadge level="low" />
          </div>
        </ReportCard>

        {/* Room Safety Hazard */}
        <ReportCard title="Room Safety Hazard">
          <HazardRow
            room="Living / Dining"
            hazards={["Loose rug near sofa", "Low coffee table"]}
          />
          <HazardRow room="Bedroom" hazards={[]} />
          <HazardRow room="Bathroom" hazards={["No grab bar at shower"]} />
          <HazardRow room="Kitchen" hazards={[]} />
          <div className="pt-2 border-t border-[#E8EAFF] space-y-1">
            <p className="text-[11px] font-bold text-[#6c757d] uppercase tracking-[.06em]">
              Recommendations
            </p>
            {[
              "Secure or remove rug near sofa",
              "Install grab bar in bathroom shower",
            ].map((r) => (
              <div key={r} className="flex items-start gap-1.5">
                <span className="mt-1 size-1.5 rounded-full bg-slate-400 flex-shrink-0" />
                <span className="text-[12px] text-[#6c757d]">{r}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center pt-1 border-t border-[#E8EAFF]">
            <span className="text-[11px] text-[#6c757d]">
              Risk contribution
            </span>
            <RiskBadge level="medium" />
          </div>
        </ReportCard>

        {/* Sleep */}
        <ReportCard title="Sleep">
          <MetricRow
            label="Last session score"
            value={score !== null ? `${score} / 100` : "--"}
          />
          <MetricRow
            label="Sleep duration"
            value={
              durationH !== null
                ? `${durationH}h${durationM ? ` ${durationM}m` : ""}`
                : "--"
            }
          />
          <MetricRow label="Avg sleep efficiency" value={efficiency} />
          <MetricRow label="Apnea events" value={apnea} />
          <div className="bg-[#f8f8ff] rounded-[12px] px-3 py-2">
            <p className="text-[12px] text-[#6c757d] leading-relaxed">
              {sleepInsight}
            </p>
          </div>
          <div className="flex justify-between items-center pt-1 border-t border-[#E8EAFF]">
            <span className="text-[11px] text-[#6c757d]">
              Risk contribution
            </span>
            <RiskBadge level={sleepRiskLevel} />
          </div>
        </ReportCard>

        {/* Historical Risk */}
        <HistoricalRiskCard scores={riskScores} />
      </div>
    </div>
  );
}

export function FallsPage() {
  const {
    connected,
    fallStatus,
    resolvedIncident,
    onIncidentResolve,
    activeIncident,
    pastIncidents,
    riskScores,
    sendAction,
  } = useOutletContext<PatientContext>();
  const isFallen = fallStatus === "fallen";
  const currentIncident = activeIncident ?? mockIncident;

  const [viewingResolved, setViewingResolved] = useState(false);
  const [viewingRiskReport, setViewingRiskReport] = useState(false);
  const [viewingIncident, setViewingIncident] = useState(false);

  const subtitle = connected ? "Live · Updated just now" : "Connecting…";

  function handleResolve(type: "resolved" | "false_alarm") {
    const resolvedAt = new Date().toLocaleTimeString("en-SG", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    const label =
      type === "resolved" ? "Marked as resolved" : "Marked as false alarm";
    const updatedIncident: Incident = {
      ...currentIncident,
      status: "resolved",
      resolved_at: new Date().toISOString(),
      event_timeline: [
        ...currentIncident.event_timeline,
        { timestamp: resolvedAt, label, detail: "Caregiver action" },
      ],
    };
    if (sendAction && currentIncident.id) {
      sendAction(currentIncident.id, "ACK");
    }
    onIncidentResolve(type, updatedIncident);
    setViewingIncident(false);
  }

  // Drill-in: live incident detail
  if (isFallen && viewingIncident) {
    return (
      <div className="pb-5">
        <div className="flex justify-between items-start px-5 pt-4 pb-6">
          <div>
            <button
              className="flex items-center gap-1 mb-2 text-[#6c757d] touch-manipulation"
              onClick={() => setViewingIncident(false)}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
              <span className="text-[12px] font-semibold">Back</span>
            </button>
            <p
              className="text-[28px] leading-none text-[#212529]"
              style={{
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 700,
                letterSpacing: "-0.01em",
              }}
            >
              Fall Alert
            </p>
            <p className="text-[13px] text-[#6c757d] mt-1">{subtitle}</p>
          </div>
          <button className="size-10 rounded-full bg-[#E8EAFF] flex items-center justify-center text-[14px] font-bold text-[#5b0df5] mt-1">
            LC
          </button>
        </div>
        <IncidentDetail
          incident={currentIncident}
          isResolved={false}
          onResolve={handleResolve}
        />
      </div>
    );
  }

  // Drill-in: fall risk report
  if (viewingRiskReport) {
    return (
      <FallRiskReport
        onBack={() => setViewingRiskReport(false)}
        riskScores={riskScores}
      />
    );
  }

  // Drill-in: viewing a resolved incident in full detail
  if (!isFallen && resolvedIncident && viewingResolved) {
    const label =
      resolvedIncident.resolution === "false_alarm"
        ? "False Alarm"
        : "Resolved";
    return (
      <div className="pb-5">
        <div className="px-5 pt-4 pb-6">
          <p
            className="text-[28px] leading-none text-[#212529]"
            style={{
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 700,
              letterSpacing: "-0.01em",
            }}
          >
            Fall Alert
          </p>
          <p className="text-[13px] text-[#6c757d] mt-1">{subtitle}</p>
        </div>
        <IncidentDetail
          incident={resolvedIncident.incident}
          isResolved
          resolutionLabel={label}
          onBack={() => setViewingResolved(false)}
        />
      </div>
    );
  }

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
            Fall Alert
          </p>
          <p className="text-[13px] text-[#6c757d] mt-1">{subtitle}</p>
        </div>
        <button className="size-10 rounded-full bg-[#E8EAFF] flex items-center justify-center text-[14px] font-bold text-[#5b0df5] mt-1">
          LC
        </button>
      </div>

      <div className="space-y-2.5 px-4">
        {/* Live fall alert card */}
        {isFallen && (
          <button
            className="w-full text-left bg-rose-50 rounded-[24px] p-4 touch-manipulation"
            onClick={() => setViewingIncident(true)}
          >
            <div className="flex items-start gap-3">
              <div className="size-10 rounded-full bg-rose-500 flex items-center justify-center flex-shrink-0">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[13px] font-bold text-rose-700">
                    {currentIncident.headline}
                  </p>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#e11d48"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="flex-shrink-0"
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
                <p className="text-[12px] text-rose-500 mt-0.5">
                  Just now · Tap to view full report
                </p>
                <p className="text-[12px] text-rose-600/80 mt-1 leading-snug">
                  {currentIncident.narrative}
                </p>
              </div>
            </div>
          </button>
        )}

        {/* Fall risk level */}
        <button
          className="w-full bg-white rounded-[24px] border border-[#E8EAFF] shadow-[0_2px_8px_rgba(91,13,245,0.06)] p-4 text-left touch-manipulation"
          onClick={() => setViewingRiskReport(true)}
        >
          <div className="flex justify-between items-center mb-3">
            <div>
              <p className="text-[15px] font-bold text-[#212529]">
                Fall Risk Level
              </p>
              <p className="text-[11px] text-[#6c757d] mt-0.5">
                Based on current sensor data
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[13px] font-bold text-emerald-600">
                Low
              </span>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#adb5bd"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
          </div>
          <div className="flex justify-between text-[10px] text-[#6c757d] mb-1">
            <span>Low</span>
            <span>Medium</span>
            <span>High</span>
          </div>
          <div className="h-2 bg-[#f8f8ff] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700 bg-emerald-500"
              style={{ width: "15%" }}
            />
          </div>
        </button>

        {/* AI insight */}
        <div className="bg-[#212529] rounded-[24px] p-4">
          <div className="flex items-center gap-1.5 mb-2">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#6aeff3"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            <span className="text-[10px] font-extrabold tracking-[.1em] uppercase text-[#6aeff3]">
              AI Insight
            </span>
          </div>
          <p className="text-[13px] leading-relaxed text-white/80">
            Latest sensor readings indicate no fall state. Motion and body
            movement patterns are consistent with normal indoor activity.
            Continue regular monitoring.
          </p>
        </div>

        {/* Previous Fall Reports */}
        <div>
          <p className="text-[11px] font-bold tracking-[.08em] text-[#6c757d] uppercase px-1 mb-2 pt-2">
            Previous Fall Reports
          </p>
          {resolvedIncident && (
            <PastIncidentCard
              incident={resolvedIncident.incident}
              resolution={resolvedIncident.resolution}
              time={resolvedIncident.resolvedAt}
              onView={() => setViewingResolved(true)}
            />
          )}
          {pastIncidents
            .filter((pi) => pi.id !== resolvedIncident?.incident.id)
            .map((pi) => (
              <PastIncidentCard
                key={pi.id}
                incident={pi}
                resolution="resolved"
                time={
                  pi.resolved_at
                    ? new Date(pi.resolved_at).toLocaleTimeString("en-SG", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : ""
                }
              />
            ))}
          {!resolvedIncident && pastIncidents.length === 0 && (
            <p className="text-[13px] text-[#6c757d] px-1">
              No previous incidents recorded.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
