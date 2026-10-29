import React from "react";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { V2Text } from "@/v2/shared/components/atoms/v2-text";

/** Bảng chú thích mini giải thích các màu sắc của luồng chứng từ trên canvas */
export const V2TraceCanvasLegend = React.memo(function V2TraceCanvasLegend() {
  const { t } = useV2Translation();

  return (
    <div
      data-testid="v2-trace-canvas-legend"
      className="pointer-events-auto absolute bottom-3.5 right-3.5 z-20 flex flex-wrap items-center gap-3.5 rounded-lg border border-border/80 bg-surface/90 px-3 py-1.5 shadow-2xs backdrop-blur-xs"
    >
      <div className="flex items-center gap-1.5">
        <span className="h-2 w-2 rounded-full bg-success ring-2 ring-success/20" />
        <V2Text as="span" className="text-[11px] font-medium text-muted-fg">
          {t("v2.traceability.canvas.legend.receipt")}
        </V2Text>
      </div>

      <div className="flex items-center gap-1.5">
        <span className="h-2 w-2 rounded-full bg-warning ring-2 ring-warning/20" />
        <V2Text as="span" className="text-[11px] font-medium text-muted-fg">
          {t("v2.traceability.canvas.legend.payment")}
        </V2Text>
      </div>

      <div className="flex items-center gap-1.5">
        <span className="h-2 w-2 rounded-full bg-primary ring-2 ring-primary/30" />
        <V2Text as="span" className="text-[11px] font-medium text-muted-fg">
          {t("v2.traceability.canvas.legend.current")}
        </V2Text>
      </div>
    </div>
  );
});

