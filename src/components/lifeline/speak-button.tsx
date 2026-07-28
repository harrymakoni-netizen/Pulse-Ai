import { useEffect, useState } from "react";
import { Volume2, Square, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { speak, stopSpeech, currentlySpeakingId, subscribeTts } from "@/lib/tts";
import { useI18n } from "@/i18n";

type Props = {
  text: string;
  id: string;
  size?: "sm" | "icon";
  variant?: "ghost" | "outline";
  className?: string;
};

export function SpeakButton({ text, id, size = "icon", variant = "ghost", className }: Props) {
  const { lang, t } = useI18n();
  const [activeId, setActiveId] = useState<string | null>(() => currentlySpeakingId());
  const [loading, setLoading] = useState(false);
  const active = activeId === id;

  useEffect(() => subscribeTts(() => setActiveId(currentlySpeakingId())), []);
  useEffect(() => () => {
    if (currentlySpeakingId() === id) stopSpeech();
  }, [id]);

  const label = active ? t("tts.stop") : t("tts.play");
  const trimmed = text.trim();

  return (
    <Button
      type="button"
      size={size}
      variant={variant}
      className={className}
      aria-label={label}
      title={label}
      disabled={!trimmed || loading}
      onClick={async (e) => {
        e.stopPropagation();
        e.preventDefault();
        if (active) {
          stopSpeech();
          return;
        }
        setLoading(true);
        try {
          await speak(trimmed, lang, id);
        } catch {
          /* toast handled elsewhere; ignore here */
        } finally {
          setLoading(false);
        }
      }}
    >
      {loading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : active ? (
        <Square className="h-3.5 w-3.5" />
      ) : (
        <Volume2 className="h-3.5 w-3.5" />
      )}
    </Button>
  );
}