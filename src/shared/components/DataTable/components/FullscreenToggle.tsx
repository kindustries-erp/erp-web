import React from "react";
import { Maximize2, Minimize2 } from "lucide-react";
import { V2ToolbarIconButton } from "@/v2/shared/components";
import { Tooltip } from "@/core/components/ui/Tooltip";
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
  const label = isFullscreen
    ? t("table.exitFullscreen", "Thu nhỏ lại (Esc)")
    : t("table.fullscreen", "Toàn màn hình");

  return (
    <Tooltip content={label}>
      <V2ToolbarIconButton
        label={label}
        icon={
          isFullscreen ? (
            <Minimize2 className="h-4 w-4 text-primary" />
          ) : (
            <Maximize2 className="h-4 w-4" />
          )
        }
        active={isFullscreen}
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
      />
    </Tooltip>
  );
}
