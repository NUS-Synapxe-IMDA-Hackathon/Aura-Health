import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Card, CardContent } from "../components/ui/card";
import type { PatientContext } from "../types/monitoring";
import { useSleepData } from "../hooks/useSleepData";

const STAGE_CLASS: Record<string, string> = {
  deep: "bg-cyan-600",
  light: "bg-sky-300",
  awake: "bg-amber-200",
};

const FALLBACK_SEGMENTS = [
  ["4%", "bg-amber-200"],
  ["8%", "bg-amber-200"],
  ["6%", "bg-sky-300"],
  ["6%", "bg-sky-300"],
  ["14%", "bg-cyan-600"],
  ["18%", "bg-cyan-600"],
  ["8%", "bg-amber-200"],
  ["8%", "bg-amber-200"],
  ["6%", "bg-slate-200"],
  ["10%", "bg-sky-300"],
  ["12%", "bg-cyan-600"],
] as const;

const VITALS_INFO: Record<string, string> = {
  "Avg Heart Rate":
    "Average beats per minute recorded throughout the sleep session. Elevated rates may indicate stress or restlessness.",
  "Avg Respiration":
    "Average breaths per minute during sleep. Normal range is 12–20 breaths/min.",
  "Apnea Events":
    "Number of breathing pauses (≥10 sec) detected. Zero is normal; elevated counts may indicate sleep apnea.",
  "Turns in Bed":
    "Total body movements detected. A high count may indicate restless or fragmented sleep.",
  "Sleep Onset":
    "Minutes taken to fall asleep after going to bed. Under 20 minutes is considered typical.",
  WASO: "Wake After Sleep Onset — total minutes spent awake after initially falling asleep. Under 30 min is typical.",
  "Times Out of Bed":
    "Number of times the resident left the bed during the night. Frequent trips may signal discomfort.",
  Efficiency:
    "Ratio of time asleep to total time in bed. 85% or above is considered good sleep efficiency.",
};

// Circle circumference for r=52: 2π×52 ≈ 327. Quarter arc ≈ 82.
const RING_R = 52;
const RING_CIRC = Math.round(2 * Math.PI * RING_R);

function fmtHour(date: Date): string {
  const h = date.getHours();
  const m = date.getMinutes();
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return m === 0
    ? `${h12} ${ampm}`
    : `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
}

function InfoIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}

export function SleepPage() {
  const { fallStatus } = useOutletContext<PatientContext>();
  const isFallen = fallStatus === "fallen";
  const [weekOffset, setWeekOffset] = useState(0);
  const {
    session: s,
    intervals,
    weekly,
    weeklyIntervals,
    hasOlderWeek,
    hasNewerWeek,
    loading,
    weeklyLoading,
    error,
  } = useSleepData(weekOffset);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const [selectedWeekDay, setSelectedWeekDay] = useState<number | null>(null);

  function goOlder() {
    setWeekOffset((v) => v + 1);
    setSelectedWeekDay(null);
  }
  function goNewer() {
    setWeekOffset((v) => v - 1);
    setSelectedWeekDay(null);
  }

  // Hard error — no data and not loading
  if (!s && !loading) {
    return (
      <div className="px-5 pt-4">
        <p
          className="text-[28px] leading-none text-slate-900"
          style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 700 }}
        >
          Sleep
        </p>
        <p className="text-[13px] text-slate-400 mt-1 mb-1">
          {error ?? "No sleep data available."}
        </p>
        {error && (
          <p className="text-[11px] text-slate-300 font-mono break-all">
            {error}
          </p>
        )}
      </div>
    );
  }

  // ── Computed display values (-- when loading) ────────────────────────────
  const deepPct = s
    ? Math.round((s.total_deep_minutes / s.time_in_bed_minutes) * 100)
    : 0;
  const lightPct = s
    ? Math.round((s.total_light_minutes / s.time_in_bed_minutes) * 100)
    : 0;
  const awakePct = s
    ? Math.round((s.total_awake_minutes / s.time_in_bed_minutes) * 100)
    : 0;
  const scorePercent = s?.sleep_quality_score ?? 0;
  const qualityLabel =
    scorePercent >= 80 ? "Good" : scorePercent >= 60 ? "Fair" : "Poor";
  const qualityColor =
    scorePercent >= 80
      ? "text-teal-600"
      : scorePercent >= 60
        ? "text-amber-600"
        : "text-rose-600";

  const wakeDate = s ? new Date(s.end_time) : null;
  const bedDate = s ? new Date(s.start_time) : null;
  const midDate =
    bedDate && wakeDate
      ? new Date((bedDate.getTime() + wakeDate.getTime()) / 2)
      : null;
  const dateLabel = bedDate
    ? bedDate.toLocaleDateString("en-SG", { month: "short", day: "numeric" })
    : "--";
  const durationH = s ? Math.floor(s.total_sleep_minutes / 60) : 0;
  const durationM = s ? s.total_sleep_minutes % 60 : 0;

  const hasIntervals = intervals.length > 0;
  const hasApnea = intervals.some((iv) => iv.apnea_events > 0);
  const hasStruggle = intervals.some((iv) => iv.abnormal_struggle);
  const hasEvents = hasApnea || hasStruggle;

  const anomalies = Array.isArray(s?.anomalies)
    ? (s!.anomalies as string[])
    : [];

  const weekRangeLabel = (() => {
    if (weekOffset === 0) return "This week";
    const fmt = (d: Date) =>
      d.toLocaleDateString("en-SG", { month: "short", day: "numeric" });
    const end = new Date();
    end.setDate(end.getDate() - weekOffset * 7);
    const start = new Date(end);
    start.setDate(end.getDate() - 6);
    return `${fmt(start)} – ${fmt(end)}`;
  })();
  const aiInsight = isFallen
    ? "Sleep quality remains good, but an active fall status is present. Use sleep data as secondary context until safety is confirmed."
    : anomalies.length > 0
      ? `${anomalies[0]}. Sleep score ${scorePercent}/100.${s!.total_apnea_events > 0 ? ` ${s!.total_apnea_events} apnea event(s) detected during the night.` : ""}`
      : s
        ? `${qualityLabel} deep sleep (${deepPct}%) last night, ${s.total_apnea_events === 0 ? "no apnea events" : `${s.total_apnea_events} apnea event(s) detected`}, and ${s.times_out_of_bed === 1 ? "one" : s.times_out_of_bed} out-of-bed trip${s.times_out_of_bed !== 1 ? "s" : ""} during the night.`
        : "Loading sleep insights…";

  const vitalsMetrics = [
    {
      label: "Avg Heart Rate",
      value: s ? `${s.avg_heart_rate} bpm` : "--",
      tone: "",
    },
    {
      label: "Avg Respiration",
      value: s ? `${s.avg_respiration_rate} /min` : "--",
      tone: "",
    },
    {
      label: "Apnea Events",
      value: s ? `${s.total_apnea_events}` : "--",
      tone: s
        ? s.total_apnea_events === 0
          ? "text-emerald-700"
          : "text-rose-600"
        : "",
    },
    { label: "Turns in Bed", value: s ? `${s.total_turns}` : "--", tone: "" },
    {
      label: "Sleep Onset",
      value: s ? `${s.sleep_onset_latency_minutes} min` : "--",
      tone: "",
    },
    {
      label: "WASO",
      value: s ? `${s.waso_minutes} min` : "--",
      tone: s ? (s.waso_minutes > 60 ? "text-amber-600" : "") : "",
    },
    {
      label: "Times Out of Bed",
      value: s ? `${s.times_out_of_bed}` : "--",
      tone: "",
    },
    {
      label: "Efficiency",
      value: s ? `${s.sleep_efficiency.toFixed(1)}%` : "--",
      tone: s
        ? s.sleep_efficiency >= 85
          ? "text-emerald-700"
          : s.sleep_efficiency >= 70
            ? ""
            : "text-rose-600"
        : "",
    },
  ];

  // Ring arc lengths for loaded state
  const loadedArc = Math.round((scorePercent / 100) * RING_CIRC);
  const loadedGap = RING_CIRC - loadedArc;

  return (
    <div className="pb-5">
      {/* Page header */}
      <div className="flex justify-between items-start px-5 pt-4 pb-6">
        <div>
          <p
            className="text-[28px] leading-none text-slate-900"
            style={{
              fontFamily: "'Fraunces', Georgia, serif",
              fontWeight: 700,
              letterSpacing: "-0.01em",
            }}
          >
            Sleep
          </p>
          <p className="text-[13px] text-slate-400 mt-1">
            {loading
              ? "Loading session…"
              : `Last session · ${dateLabel} · ${durationH}h ${durationM > 0 ? `${durationM}m` : ""}`}
          </p>
        </div>
        <button className="size-10 rounded-full bg-slate-200 flex items-center justify-center text-[14px] font-bold text-slate-600 mt-1">
          LC
        </button>
      </div>

      <div className="space-y-3 px-4">
        {/* Anomaly banners */}
        {anomalies.length > 0 && (
          <div className="space-y-1.5">
            {anomalies.map((a, i) => (
              <div
                key={i}
                className="flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-[14px] px-3 py-2"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                <p className="text-[12px] font-semibold text-amber-800">{a}</p>
              </div>
            ))}
          </div>
        )}

        {/* Sleep score ring */}
        <div className="flex justify-center py-1">
          <div className="relative h-32 w-32">
            {loading ? (
              /* Spinning arc while loading */
              <svg
                className="absolute inset-0 animate-spin"
                style={{ animationDuration: "1.8s" }}
                viewBox="0 0 128 128"
              >
                <circle
                  cx="64"
                  cy="64"
                  r={RING_R}
                  fill="none"
                  stroke="#e2e8f0"
                  strokeWidth="12"
                />
                <circle
                  cx="64"
                  cy="64"
                  r={RING_R}
                  fill="none"
                  stroke="#14b8a6"
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={`${Math.round(RING_CIRC * 0.25)} ${Math.round(RING_CIRC * 0.75)}`}
                  transform="rotate(-90 64 64)"
                />
              </svg>
            ) : (
              /* Filled arc for loaded score */
              <svg className="absolute inset-0" viewBox="0 0 128 128">
                <circle
                  cx="64"
                  cy="64"
                  r={RING_R}
                  fill="none"
                  stroke="#e2e8f0"
                  strokeWidth="12"
                />
                <circle
                  cx="64"
                  cy="64"
                  r={RING_R}
                  fill="none"
                  stroke="#14b8a6"
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={`${loadedArc} ${loadedGap}`}
                  transform="rotate(-90 64 64)"
                />
              </svg>
            )}

            {/* Inner label */}
            <div className="absolute inset-0 grid place-items-center">
              <div className="grid h-24 w-24 place-items-center rounded-full bg-slate-50 text-center">
                <div>
                  <p
                    className={`text-4xl leading-none font-semibold ${loading ? "text-slate-300" : "text-slate-900"}`}
                  >
                    {loading ? "--" : scorePercent}
                  </p>
                  {!loading && (
                    <p
                      className={`mt-0.5 text-[10px] font-bold tracking-[1px] uppercase ${qualityColor}`}
                    >
                      {qualityLabel}
                    </p>
                  )}
                  <p className="text-[9px] text-slate-400 mt-0.5">
                    Sleep Score
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stage breakdown */}
        <div className="grid grid-cols-3 gap-1.5">
          {[
            {
              color: "bg-cyan-600",
              value: loading ? "--" : `${deepPct}%`,
              label: "Deep",
              textColor: "text-cyan-700",
            },
            {
              color: "bg-sky-300",
              value: loading ? "--" : `${lightPct}%`,
              label: "Light",
              textColor: "text-sky-700",
            },
            {
              color: "bg-amber-200",
              value: loading ? "--" : `${awakePct}%`,
              label: "Awake",
              textColor: "text-amber-800",
            },
          ].map(({ color, value, label, textColor }) => (
            <Card key={label} className="rounded-2xl py-3 shadow-sm">
              <CardContent className="px-2 text-center">
                <div
                  className={`mx-auto mb-1 h-3 w-3 rounded-sm ${loading ? "bg-slate-200" : color}`}
                />
                <p
                  className={`text-sm font-bold ${loading ? "text-slate-300" : textColor}`}
                >
                  {value}
                </p>
                <p className="text-[9px] font-bold tracking-wide text-slate-400 uppercase">
                  {label}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Sleep architecture timeline */}
        <Card className="rounded-3xl py-4">
          <CardContent className="px-4">
            <p className="mb-3 text-[15px] font-bold text-slate-900">
              Sleep Architecture
            </p>

            {loading ? (
              <div className="h-12 rounded-xl bg-slate-100 animate-pulse" />
            ) : (
              <>
                {/* Timeline bar */}
                <div className="flex h-12 overflow-hidden rounded-xl">
                  {hasIntervals
                    ? intervals.map((iv, idx) => (
                        <div
                          key={idx}
                          className={STAGE_CLASS[iv.stage]}
                          style={{
                            width: `${(iv.duration_minutes / s!.time_in_bed_minutes) * 100}%`,
                          }}
                        />
                      ))
                    : FALLBACK_SEGMENTS.map(([width, tone], idx) => (
                        <div key={idx} className={tone} style={{ width }} />
                      ))}
                </div>

                {/* Event markers row */}
                {hasIntervals && hasEvents && (
                  <div className="flex mt-1.5">
                    {intervals.map((iv, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-center gap-0.5"
                        style={{
                          width: `${(iv.duration_minutes / s!.time_in_bed_minutes) * 100}%`,
                        }}
                      >
                        {iv.apnea_events > 0 && (
                          <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                        )}
                        {iv.abnormal_struggle && (
                          <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Time labels */}
                <div className="mt-2 flex justify-between">
                  <p className="text-[10px] text-slate-400">
                    {bedDate && hasIntervals ? fmtHour(bedDate) : "10 PM"}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {midDate && hasIntervals ? fmtHour(midDate) : "2 AM"}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {wakeDate && hasIntervals ? fmtHour(wakeDate) : "6 AM"}
                  </p>
                </div>
              </>
            )}

            {/* Legend */}
            <div className="mt-2 flex items-center gap-3 flex-wrap">
              {[
                ["bg-cyan-600", "Deep"],
                ["bg-sky-300", "Light"],
                ["bg-amber-200", "Awake"],
              ].map(([color, label]) => (
                <div key={label} className="flex items-center gap-1">
                  <div className={`h-2 w-3 rounded-sm ${color}`} />
                  <span className="text-[10px] text-slate-500">{label}</span>
                </div>
              ))}
              {hasApnea && (
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  <span className="text-[10px] text-slate-500">Apnea</span>
                </div>
              )}
              {hasStruggle && (
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span className="text-[10px] text-slate-500">Movement</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Vitals grid */}
        <Card className="rounded-3xl py-4">
          <CardContent className="px-4">
            <p className="mb-3 text-[15px] font-bold text-slate-900">
              Vitals During Sleep
            </p>
            <div className="grid grid-cols-2 gap-2">
              {vitalsMetrics.map(({ label, value, tone }) => (
                <div
                  key={label}
                  className="relative rounded-xl border border-slate-100 bg-slate-50 px-3 py-2"
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <p className="text-[10px] font-bold tracking-wide text-slate-400 uppercase leading-none">
                      {label}
                    </p>
                    <button
                      className="text-slate-300 active:text-slate-500 touch-manipulation -mr-0.5 -mt-0.5 p-0.5"
                      onClick={() =>
                        setActiveTooltip(activeTooltip === label ? null : label)
                      }
                      aria-label={`Info about ${label}`}
                    >
                      <InfoIcon />
                    </button>
                  </div>
                  <p
                    className={`text-sm font-bold ${loading ? "text-slate-300" : `text-slate-800 ${tone}`}`}
                  >
                    {value}
                  </p>
                </div>
              ))}
            </div>

            {/* Tooltip panel */}
            {activeTooltip && (
              <button
                className="w-full mt-3 text-left rounded-xl bg-slate-100 px-3 py-2.5 touch-manipulation"
                onClick={() => setActiveTooltip(null)}
              >
                <p className="text-[12px] font-bold text-slate-700 mb-0.5">
                  {activeTooltip}
                </p>
                <p className="text-[12px] text-slate-500 leading-relaxed">
                  {VITALS_INFO[activeTooltip]}
                </p>
                <p className="text-[10px] text-slate-400 mt-1.5">
                  Tap to dismiss
                </p>
              </button>
            )}
          </CardContent>
        </Card>

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
              AI Sleep Insight
            </span>
          </div>
          <p
            className={`text-[13px] leading-relaxed ${loading ? "text-white/30" : "text-white/80"}`}
          >
            {aiInsight}
          </p>
        </div>

        {/* Weekly sleep architecture chart */}
        <Card className="rounded-3xl py-4">
          <CardContent className="px-4">
            <div className="flex items-center justify-between mb-0.5">
              <p className="text-[15px] font-bold text-slate-900">
                Weekly Sleep Architecture
              </p>
              <div className="flex items-center gap-0.5">
                {/* Older week */}
                <button
                  onClick={goOlder}
                  disabled={!hasOlderWeek}
                  className={`p-1.5 rounded-lg touch-manipulation ${hasOlderWeek ? "text-slate-500 active:bg-slate-100" : "text-slate-200"}`}
                  aria-label="Previous week"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>
                {/* Newer week */}
                <button
                  onClick={goNewer}
                  disabled={!hasNewerWeek}
                  className={`p-1.5 rounded-lg touch-manipulation ${hasNewerWeek ? "text-slate-500 active:bg-slate-100" : "text-slate-200"}`}
                  aria-label="Next week"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              </div>
            </div>
            {weekRangeLabel && (
              <p className="mb-3 text-[11px] text-slate-400">
                {weekRangeLabel}
              </p>
            )}

            {(() => {
              const Y_START = 20;
              const Y_END = 32;
              const RANGE = Y_END - Y_START;
              const CHART_H = 200;
              const TOP = 6;
              const LEFT = 46;
              const COL_W = 39;
              const BAR_W = 22;
              const NUM_COLS = 7;
              const TOTAL_W = LEFT + COL_W * NUM_COLS + 4;
              const TOTAL_H = TOP + CHART_H + 30;

              const toY = (h: number) =>
                TOP + ((h - Y_START) / RANGE) * CHART_H;
              const toExtH = (ts: string) => {
                const d = new Date(ts);
                const h = d.getHours() + d.getMinutes() / 60;
                return h < 12 ? h + 24 : h;
              };

              const STAGE_FILL: Record<string, string> = {
                deep: "#0891b2",
                light: "#7dd3fc",
                awake: "#fde68a",
              };

              const yLabels = [
                { t: 20, label: "8 PM" },
                { t: 22, label: "10 PM" },
                { t: 24, label: "12 AM" },
                { t: 26, label: "2 AM" },
                { t: 28, label: "4 AM" },
                { t: 30, label: "6 AM" },
                { t: 32, label: "8 AM" },
              ];

              // Plausible placeholder positions for skeleton bars
              const PLACEHOLDER = [
                { bed: 22.25, wake: 29.75 },
                { bed: 22.0, wake: 30.5 },
                { bed: 22.5, wake: 28.5 },
                { bed: 22.0, wake: 29.25 },
                { bed: 22.25, wake: 29.75 },
                { bed: 23.0, wake: 29.0 },
                { bed: 22.0, wake: 30.5 },
              ];

              const getDayBarTop = (idx: number) => {
                const dayIvs = weeklyIntervals[idx] ?? [];
                return dayIvs.length > 0
                  ? toY(toExtH(dayIvs[0].start_time))
                  : toY(weekly[idx].bedtime);
              };

              return (
                <svg
                  viewBox={`0 0 ${TOTAL_W} ${TOTAL_H}`}
                  className="w-full h-auto overflow-visible"
                  onClick={() => setSelectedWeekDay(null)}
                >
                  <defs>
                    {!weeklyLoading &&
                      weekly.map((day, idx) => {
                        const dayIvs = weeklyIntervals[idx] ?? [];
                        const clipTop =
                          dayIvs.length > 0
                            ? toY(toExtH(dayIvs[0].start_time))
                            : toY(day.bedtime);
                        const clipBot =
                          dayIvs.length > 0
                            ? toY(toExtH(dayIvs[dayIvs.length - 1].end_time))
                            : toY(day.wake);
                        const x = LEFT + idx * COL_W + (COL_W - BAR_W) / 2;
                        return (
                          <clipPath key={`clip-${idx}`} id={`clip-${idx}`}>
                            <rect
                              x={x}
                              y={clipTop}
                              width={BAR_W}
                              height={clipBot - clipTop}
                              rx="3"
                              ry="3"
                            />
                          </clipPath>
                        );
                      })}
                  </defs>

                  {/* Grid lines — always visible */}
                  {yLabels.map(({ t, label }) => (
                    <g key={t}>
                      <line
                        x1={LEFT}
                        y1={toY(t)}
                        x2={TOTAL_W - 4}
                        y2={toY(t)}
                        stroke="#f1f5f9"
                        strokeWidth="1"
                      />
                      <text
                        x={LEFT - 4}
                        y={toY(t) + 4}
                        textAnchor="end"
                        fontSize="8.5"
                        fontWeight="600"
                        fill="#94a3b8"
                      >
                        {label}
                      </text>
                    </g>
                  ))}

                  {weeklyLoading ? (
                    /* Skeleton — bars + label pills, same positions as real data */
                    <>
                      {PLACEHOLDER.map((p, idx) => {
                        const x = LEFT + idx * COL_W + (COL_W - BAR_W) / 2;
                        const y = toY(p.bed);
                        const h = toY(p.wake) - y;
                        const lx = x + BAR_W / 2 - 8;
                        const ly = TOP + CHART_H + 7;
                        return (
                          <g
                            key={idx}
                            style={{
                              animation: `pulse 1.5s ease-in-out ${idx * 80}ms infinite`,
                            }}
                          >
                            <rect
                              x={x}
                              y={y}
                              width={BAR_W}
                              height={h}
                              fill="#f1f5f9"
                              rx="3"
                              ry="3"
                            />
                            <rect
                              x={lx}
                              y={ly}
                              width={16}
                              height={5}
                              fill="#e2e8f0"
                              rx="2"
                              ry="2"
                            />
                          </g>
                        );
                      })}
                    </>
                  ) : (
                    /* Real sleep architecture per day */
                    <>
                      {weekly.map((day, idx) => {
                        const dayIvs = weeklyIntervals[idx] ?? [];
                        const x = LEFT + idx * COL_W + (COL_W - BAR_W) / 2;
                        const hasRealData = dayIvs.length > 0;

                        return (
                          <g key={idx}>
                            {hasRealData ? (
                              <>
                                <g clipPath={`url(#clip-${idx})`}>
                                  {dayIvs.map((iv, i) => {
                                    const startH = toExtH(iv.start_time);
                                    const endH = toExtH(iv.end_time);
                                    return (
                                      <rect
                                        key={i}
                                        x={x}
                                        y={toY(startH)}
                                        width={BAR_W}
                                        height={Math.max(
                                          toY(endH) - toY(startH),
                                          1,
                                        )}
                                        fill={STAGE_FILL[iv.stage] ?? "#e2e8f0"}
                                      />
                                    );
                                  })}
                                </g>
                                {dayIvs.map((iv, i) => {
                                  if (!iv.apnea_events && !iv.abnormal_struggle)
                                    return null;
                                  const midY =
                                    (toY(toExtH(iv.start_time)) +
                                      toY(toExtH(iv.end_time))) /
                                    2;
                                  return (
                                    <circle
                                      key={`ev-${i}`}
                                      cx={x + BAR_W / 2}
                                      cy={midY}
                                      r="3"
                                      fill={
                                        iv.apnea_events > 0
                                          ? "#f43f5e"
                                          : "#f59e0b"
                                      }
                                      stroke="white"
                                      strokeWidth="1.5"
                                    />
                                  );
                                })}
                              </>
                            ) : (
                              (() => {
                                const top = toY(day.bedtime);
                                const tot = toY(day.wake) - top;
                                const dH = (tot * day.deep) / 100;
                                const lH = (tot * day.light) / 100;
                                const aH = (tot * day.awake) / 100;
                                return (
                                  <>
                                    <rect
                                      x={x}
                                      y={top}
                                      width={BAR_W}
                                      height={dH}
                                      fill="#0891b2"
                                      rx="3"
                                      ry="3"
                                    />
                                    <rect
                                      x={x}
                                      y={top + dH}
                                      width={BAR_W}
                                      height={lH}
                                      fill="#7dd3fc"
                                    />
                                    <rect
                                      x={x}
                                      y={top + dH + lH}
                                      width={BAR_W}
                                      height={aH}
                                      fill="#fde68a"
                                    />
                                    <rect
                                      x={x}
                                      y={top + dH + lH + aH - 3}
                                      width={BAR_W}
                                      height={3}
                                      fill="#fde68a"
                                      rx="3"
                                      ry="3"
                                    />
                                  </>
                                );
                              })()
                            )}

                            {/* Day label */}
                            <text
                              x={x + BAR_W / 2}
                              y={TOP + CHART_H + 14}
                              textAnchor="middle"
                              fontSize="9"
                              fontWeight="700"
                              fill="#94a3b8"
                            >
                              {day.dayLabel}
                            </text>

                            {/* Transparent touch target */}
                            <rect
                              x={LEFT + idx * COL_W}
                              y={TOP}
                              width={COL_W}
                              height={CHART_H}
                              fill="transparent"
                              style={{ cursor: "pointer" }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedWeekDay(
                                  selectedWeekDay === idx ? null : idx,
                                );
                              }}
                            />

                            {/* Score popup on tap */}
                            {selectedWeekDay === idx &&
                              (() => {
                                const barTop = getDayBarTop(idx);
                                const tw = 34;
                                const th = 20;
                                const tx = x + BAR_W / 2 - tw / 2;
                                const ty = barTop - th - 7;
                                const cx = x + BAR_W / 2;
                                return (
                                  <g>
                                    <rect
                                      x={tx}
                                      y={ty}
                                      width={tw}
                                      height={th}
                                      rx="5"
                                      ry="5"
                                      fill="#0f172a"
                                    />
                                    <text
                                      x={cx}
                                      y={ty + th - 6}
                                      textAnchor="middle"
                                      fontSize="10"
                                      fontWeight="700"
                                      fill="white"
                                    >
                                      {day.score}
                                    </text>
                                    <polygon
                                      points={`${cx - 4},${barTop - 7} ${cx + 4},${barTop - 7} ${cx},${barTop - 2}`}
                                      fill="#0f172a"
                                    />
                                  </g>
                                );
                              })()}
                          </g>
                        );
                      })}
                    </>
                  )}
                </svg>
              );
            })()}

            {/* Legend */}
            <div className="mt-2 flex items-center gap-4 flex-wrap">
              {[
                ["bg-cyan-600", "Deep"],
                ["bg-sky-300", "Light"],
                ["bg-amber-200", "Awake"],
              ].map(([color, label]) => (
                <div key={label} className="flex items-center gap-1">
                  <div className={`h-2 w-3 rounded-sm ${color}`} />
                  <span className="text-[10px] text-slate-500">{label}</span>
                </div>
              ))}
              {(weeklyIntervals.some((ivs) =>
                ivs.some((iv) => iv.apnea_events > 0),
              ) ||
                weekly.some((d) => d.hasApnea)) && (
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-rose-500" />
                  <span className="text-[10px] text-slate-500">Apnea</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
