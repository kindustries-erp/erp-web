import React, { useState } from "react";
import { ChevronRight, Info } from "lucide-react";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { V2Text } from "@/v2/shared/components/atoms/v2-text";
import { cn } from "@/v2/shared/utils/cn";

export interface V2TraceCanvasLegendProps {
  className?: string;
  defaultExpanded?: boolean;
}

/**
 * Bảng chú thích mini giải thích các màu sắc của luồng chứng từ trên canvas.
 * Thiết kế chuẩn Dribbble: floating glassmorphic pill, hỗ trợ thu gọn trên mobile và dọn sạch token hex opacity.
 */
export const V2TraceCanvasLegend = React.memo(function V2TraceCanvasLegend({
  className,
  defaultExpanded = true,
}: V2TraceCanvasLegendProps) {
  const { t } = useV2Translation();
  const [expanded, setExpanded] = useState(defaultExpanded);

  if (!expanded) {
    return (
      <button
        type="button"
        data-testid="v2-trace-canvas-legend-toggle"
        onClick={() => setExpanded(true)}
        aria-label={t("v2.traceability.canvas.legend.toggle")}
        className={cn(
          "pointer-events-auto absolute bottom-3.5 right-3.5 z-20 flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 shadow-xs transition-all hover:border-primary hover:text-foreground text-muted-fg",
          className,
        )}
      >
        <Info className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
        <V2Text as="span" className="text-[11px] font-medium">
          {t("v2.traceability.canvas.legend.compact")}
        </V2Text>
      </button>
    );
  }

  return (
    <div
      role="region"
      aria-label={t("v2.traceability.canvas.legend.title")}
      data-testid="v2-trace-canvas-legend"
      className={cn(
        "pointer-events-auto absolute bottom-3.5 right-3.5 z-20 flex flex-wrap items-center gap-3.5 rounded-full border border-border bg-surface px-3.5 py-1.5 shadow-sm transition-all",
        className,
      )}
    >
      <div className="flex items-center gap-1.5">
        <span
          className="h-2.5 w-2.5 rounded-full bg-success ring-1 ring-border shadow-2xs"
          aria-hidden="true"
        />
        <V2Text as="span" className="text-[11px] font-medium text-muted-fg">
          {t("v2.traceability.canvas.legend.receipt")}
        </V2Text>
      </div>

      <div className="flex items-center gap-1.5">
        <span
          className="h-2.5 w-2.5 rounded-full bg-warning ring-1 ring-border shadow-2xs"
          aria-hidden="true"
        />
        <V2Text as="span" className="text-[11px] font-medium text-muted-fg">
          {t("v2.traceability.canvas.legend.payment")}
        </V2Text>
      </div>

      <div className="flex items-center gap-1.5">
        <span
          className="h-2.5 w-2.5 rounded-full bg-primary ring-1 ring-border shadow-2xs"
          aria-hidden="true"
        />
        <V2Text as="span" className="text-[11px] font-medium text-muted-fg">
          {t("v2.traceability.canvas.legend.current")}
        </V2Text>
      </div>

      <button
        type="button"
        onClick={() => setExpanded(false)}
        aria-label={t("v2.traceability.canvas.legend.toggle")}
        className="ml-0.5 rounded-full p-0.5 text-muted-fg/70 hover:bg-surface-hover hover:text-foreground transition-colors"
      >
        <ChevronRight className="h-3 w-3" aria-hidden="true" />
      </button>
    </div>
  );
});
