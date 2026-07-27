import { cn } from "@/lib/utils";

export function EcgLoader({ className, label }: { className?: string; label?: string }) {
  return (
    <div
      className={cn("flex flex-col items-center justify-center gap-3 p-6", className)}
      role="status"
      aria-live="polite"
    >
      <svg width="120" height="40" viewBox="0 0 120 40" fill="none" aria-hidden="true">
        <path
          d="M0 20 H30 L38 20 L42 8 L50 32 L58 12 L64 24 L72 20 H120"
          stroke="var(--medical)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="300"
          style={{ animation: "lifeline-ecg 1.6s linear infinite" }}
        />
      </svg>
      {label ? <p className="text-sm text-muted-foreground">{label}</p> : null}
    </div>
  );
}
