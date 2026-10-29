import React from "react";
import { Columns3, Maximize2, Minimize2, Rows3 } from "lucide-react";
import { V2Button } from "@/v2/shared/components/atoms/v2-button";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import type {
  TraceabilityLayoutDirection,
  TraceabilityNodeType,
  TraceabilityViewMode,
} from "../../types/traceability.type";
import { V2TraceLinkTypeMenu } from "./V2TraceLinkTypeMenu";
import { V2Text } from "@/v2/shared/components/atoms/v2-text";

export interface V2TraceToolbarProps {
  linkedCount: number;
  canLink: boolean;
  linkTypes: TraceabilityNodeType[];
  linkOpen: boolean;
  onLinkOpenChange: (open: boolean) => void;
  onSelectLinkType: (type: TraceabilityNodeType) => void;
  viewMode: TraceabilityViewMode;
  onViewModeChange: (mode: TraceabilityViewMode) => void;
  direction?: TraceabilityLayoutDirection;
  onToggleDirection?: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

const VIEW_KEYS: { mode: TraceabilityViewMode; key: string }[] = [
  { mode: "canvas", key: "v2.traceability.toolbar.viewCanvas" },
  { mode: "pipeline", key: "v2.traceability.toolbar.viewPipeline" },
  { mode: "table", key: "v2.traceability.toolbar.viewTable" },
];

/** Thanh trên sơ đồ: số chứng từ, nút ghép nối, chuyển chế độ xem, và toàn màn hình */
export function V2TraceToolbar(props: V2TraceToolbarProps) {
  const { t } = useV2Translation();
  const {
    linkedCount,
    canLink,
    viewMode,
    onViewModeChange,
    direction = "horizontal",
    onToggleDirection,
    isFullscreen,
    onToggleFullscreen,
  } = props;

  const toggleDirectionLabel =
    direction === "horizontal"
      ? t("v2.traceability.canvas.toVertical")
      : t("v2.traceability.canvas.toHorizontal");

  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <V2Text as="div" className="text-xs font-medium text-muted-fg ">
        {t("v2.traceability.toolbar.total", { count: linkedCount })}
      </V2Text>

      <div className="flex flex-wrap items-center gap-2">
        {canLink && (
          <V2TraceLinkTypeMenu
            types={props.linkTypes}
            open={props.linkOpen}
            onOpenChange={props.onLinkOpenChange}
            onSelect={props.onSelectLinkType}
          />
        )}

        <div className="flex items-center gap-1 rounded-lg border border-border bg-muted p-0.5  ">
          {VIEW_KEYS.map(({ mode, key }) => (
            <V2Button
              key={mode}
              type="button"
              variant={viewMode === mode ? "pill-tab" : "ghost"}
              size="pill-sm"
              aria-pressed={viewMode === mode}
              onClick={() => onViewModeChange(mode)}
            >
              {t(key)}
            </V2Button>
          ))}
        </div>

        {viewMode === "canvas" && onToggleDirection && (
          <V2Button
            type="button"
            variant="ghost"
            size="icon-xs"
            aria-label={toggleDirectionLabel}
            title={toggleDirectionLabel}
            onClick={onToggleDirection}
          >
            {direction === "horizontal" ? (
              <Rows3 className="h-3.5 w-3.5 text-muted-fg" />
            ) : (
              <Columns3 className="h-3.5 w-3.5 text-muted-fg" />
            )}
          </V2Button>
        )}

        <V2Button
          type="button"
          variant="ghost"
          size="icon-xs"
          aria-label={
            isFullscreen
              ? t("v2.traceability.toolbar.exitFullscreen")
              : t("v2.traceability.toolbar.fullscreen")
          }
          title={
            isFullscreen
              ? t("v2.traceability.toolbar.exitFullscreen")
              : t("v2.traceability.toolbar.fullscreen")
          }
          onClick={onToggleFullscreen}
        >
          {isFullscreen ? (
            <Minimize2 className="h-3.5 w-3.5" />
          ) : (
            <Maximize2 className="h-3.5 w-3.5" />
          )}
        </V2Button>
      </div>
    </div>
  );
}
