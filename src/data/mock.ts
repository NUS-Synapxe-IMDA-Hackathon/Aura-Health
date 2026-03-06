import type { AlertItem, EventRow, SleepSession } from "../types/monitoring";

export const alerts: AlertItem[] = [
  {
    id: "a2",
    severity: "warning",
    iconType: "circle-info",
    title: "No movement detected",
    detail: "Bathroom · 18 minutes",
    context: "Longer than her usual pattern",
    time: "2h ago",
  },
  {
    id: "a3",
    severity: "warning",
    iconType: "heart",
    title: "Elevated heart rate",
    detail: "102 bpm · 9 minutes sustained",
    context: "Detected at 6:00 AM during rest",
    time: "6h ago",
  },
  {
    id: "a4",
    severity: "notice",
    iconType: "clock",
    title: "Morning walk",
    detail: "Left 8:14 AM · Returned 9:02 AM",
    context: "48 minutes · Matches usual routine",
    time: "14h ago",
  },
  {
    id: "a5",
    severity: "notice",
    iconType: "moon",
    title: "Late bedtime",
    detail: "11:28 PM",
    context: "1h 43m later than her usual bedtime",
    time: "2d ago",
  },
  {
    id: "a6",
    severity: "notice",
    iconType: "walking",
    title: "Extended walk",
    detail: "Away 2h 14m",
    time: "3d ago",
  },
  {
    id: "a7",
    severity: "critical",
    iconType: "alert-triangle",
    title: "Fall detected",
    detail: "Living room",
    context: "Emergency contacts notified",
    time: "4d ago",
  },
];

export const eventRows: EventRow[] = [
  ["1:23:24 PM", "Bathroom was empty", "No one present", "ok"],
  [
    "1:23:29 PM",
    "Ashley entered the bathroom",
    "Normal movement detected",
    "notice",
  ],
  [
    "1:23:39 PM",
    "Fall detected — sudden impact",
    "Significant body movement spike detected",
    "critical",
  ],
  [
    "1:23:49 PM",
    "No movement after fall",
    "Ashley remains still on the floor",
    "warning",
  ],
  [
    "1:23:59 PM",
    "EMS automatically notified",
    "Emergency contacts alerted via app",
    "critical",
  ],
];

export const sleepSession: SleepSession = {
  id: "ss-1",
  date: "2026-03-04",
  score: 88,
  deep_pct: 64,
  light_pct: 25,
  awake_pct: 11,
  duration_min: 480,
  avg_hr: 61,
  respiration: 15,
};

export const weeklyScores = [72, 88, 38, 65, 80, 30, 88];

// bedtime / wake in extended 24h (e.g. 26 = 2 AM next day)
export const weeklySleep = [
  { bedtime: 22.5, wake: 28.5, deep: 58, light: 30, awake: 12 }, // Mon
  { bedtime: 22.0, wake: 30.0, deep: 64, light: 25, awake: 11 }, // Tue
  { bedtime: 23.5, wake: 28.5, deep: 35, light: 45, awake: 20 }, // Wed
  { bedtime: 22.8, wake: 29.3, deep: 52, light: 35, awake: 13 }, // Thu
  { bedtime: 22.2, wake: 29.7, deep: 60, light: 28, awake: 12 }, // Fri
  { bedtime: 23.8, wake: 27.8, deep: 28, light: 48, awake: 24 }, // Sat
  { bedtime: 22.0, wake: 30.0, deep: 64, light: 25, awake: 11 }, // Sun
];
