import { cn } from "@/lib/utils";
import { useT } from "@/i18n";

const styles = {
  low: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
  medium: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30",
  high: "bg-orange-500/15 text-orange-700 dark:text-orange-300 border-orange-500/40",
  critical: "bg-[color:var(--alert)]/15 text-[color:var(--alert)] border-[color:var(--alert)]/40",
} as const;

export function SeverityBadge({
  severity,
  className,
}: {
  severity: keyof typeof styles;
  className?: string;
}) {
  const t = useT();
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium uppercase tracking-wide",
        styles[severity],
        className,
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          severity === "critical" ? "pulse-alert" : "pulse-calm",
        )}
        style={{ background: "currentColor" }}
      />
      {t(`severity.${severity}`)}
    </span>
  );
}
