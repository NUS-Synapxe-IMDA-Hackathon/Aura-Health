import type {
  Alert,
  AlertCategory,
  AlertIconType,
  AlertItem,
} from "../types/monitoring";

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
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function alertToAlertItem(alert: Alert): AlertItem {
  return {
    id: alert.id,
    severity: alert.severity === "notice" ? "notice" : alert.severity,
    iconType: categoryToIconType(alert.category),
    title: alert.title,
    detail: alert.ai_insight.summary,
    context: alert.ai_insight.context || undefined,
    time: formatRelativeTime(alert.timestamp),
  };
}
