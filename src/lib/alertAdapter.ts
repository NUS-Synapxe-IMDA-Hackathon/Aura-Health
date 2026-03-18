import type {
  Alert,
  AlertCategory,
  AlertIconType,
  AlertItem,
  CalledState,
} from "../types/monitoring";
import { APP_NOW } from "./appTime";

const CATEGORY_ICON: Record<AlertCategory, AlertIconType> = {
  vital_signs: "heart",
  bathroom_dwell: "clock",
  absence: "circle-info",
  room_hazard: "alert-triangle",
  risk_spike: "alert-triangle",
  sleep_anomaly: "moon",
  bed_exit: "moon",
  sedentary: "clock",
  wellness_checkin: "circle-info",
  post_fall_pattern: "walking",
};

export function categoryToIconType(category: AlertCategory): AlertIconType {
  return CATEGORY_ICON[category] ?? "circle-info";
}

export function formatRelativeTime(iso: string): string {
  const diff = APP_NOW - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function alertToAlertItem(alert: Alert): AlertItem {
  // Handle both nested ai_insight (live WS) and flat columns (Supabase rows)
  const row = alert as Record<string, unknown>;
  const insight = alert.ai_insight ?? {
    summary: (row.ai_insight_summary as string) ?? "",
    context: (row.ai_insight_context as string) ?? "",
    recommendation: (row.ai_insight_recommendation as string) ?? "",
  };

  const rawCalledState = (row.called_state ?? alert.called_state) as string | null;
  const calledState: CalledState =
    rawCalledState === "resolved" || rawCalledState === "unresolved"
      ? rawCalledState
      : null;

  return {
    id: alert.id,
    severity: alert.severity === "notice" ? "notice" : alert.severity,
    iconType: categoryToIconType(alert.category),
    title: alert.title,
    detail: insight.summary,
    context: insight.context || undefined,
    time: formatRelativeTime(alert.timestamp),
    calledState,
  };
}
