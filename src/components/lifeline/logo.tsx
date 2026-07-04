import logoAsset from "@/assets/lifeline-logo.png.asset.json";
import { cn } from "@/lib/utils";

type Props = {
  size?: number;
  emergency?: boolean;
  showWordmark?: boolean;
  className?: string;
};

export function LifeLineLogo({ size = 36, emergency = false, showWordmark = true, className }: Props) {
  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <div
        className={cn(
          "relative inline-flex items-center justify-center rounded-full",
          emergency ? "pulse-alert" : "pulse-calm",
        )}
        style={{ width: size + 4, height: size + 4 }}
        aria-hidden="true"
      >
        <img src={logoAsset.url} alt="" width={size} height={size} className="rounded-full object-contain" />
      </div>
      {showWordmark ? (
        <span className="font-display text-lg font-semibold tracking-tight text-foreground">
          LifeLine<span className="text-[color:var(--emerald-brand)]">+</span>
        </span>
      ) : null}
    </div>
  );
}

export const logoUrl = logoAsset.url;