import React from "react";
import { Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { useT } from "@/core/i18n";

export interface FullscreenToggleProps {
  isFullscreen: boolean;
  onToggle: () => void;
}

export function FullscreenToggle({
  isFullscreen,
  onToggle,
}: FullscreenToggleProps) {
  const t = useT();
  return (
    <Button
      type="button"
      variant="secondary"
      size="icon"
      className="h-8 w-8 px-0 cursor-pointer shrink-0"
      title={
        isFullscreen
          ? t("table.exitFullscreen", "Thu nhỏ lại (Esc)")
          : t("table.fullscreen", "Toàn màn hình")
      }
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
    >
      {isFullscreen ? (
        <Minimize2 className="h-4 w-4 text-primary" />
      ) : (
        <Maximize2 className="h-4 w-4" />
      )}
    </Button>
  );
}
