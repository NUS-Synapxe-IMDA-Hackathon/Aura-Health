import { cn } from "../../lib/utils";

type Severity = "ok" | "notice" | "warning" | "critical";

const severityMap: Record<Severity, { className: string; label: string }> = {
  ok: { className: "bg-emerald-100 text-emerald-800", label: "OK" },
  notice: { className: "bg-blue-100 text-blue-800", label: "Notice" },
  warning: { className: "bg-amber-100 text-amber-800", label: "Warning" },
  critical: { className: "bg-rose-100 text-rose-800", label: "Critical" },
};

type SeverityBadgeProps = {
  severity: Severity;
  className?: string;
};

export function SeverityBadge({ severity, className }: SeverityBadgeProps) {
  const { className: colorClass, label } = severityMap[severity];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
        colorClass,
        className,
      )}
    >
      {label}
    </span>
  );
}
