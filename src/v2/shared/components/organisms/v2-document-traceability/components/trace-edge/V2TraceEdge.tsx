import React from "react";
import { BaseEdge, EdgeLabelRenderer, type EdgeProps } from "@xyflow/react";
import { cn } from "@/v2/shared/utils/cn";
import { computeEdgeGeometry } from "../../utils/traceability.edge-path";
import {
  parseEdgeLabel,
  type EdgeLabelTone,
} from "../../utils/traceability.edge-label";

const TONE_CLASS: Record<EdgeLabelTone, string> = {
  in: "text-success font-bold",
  out: "text-warning font-bold",
  neutral: "text-foreground font-bold",
};

/** Cạnh nối hai chứng từ, nhãn đặt trên đường đi và tự tránh các khung giai đoạn */
export const V2TraceEdge = React.memo(function V2TraceEdge({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  label,
  animated,
}: EdgeProps) {
  const geometry = computeEdgeGeometry({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });
  const parts = parseEdgeLabel(label);

  return (
    <>
      <BaseEdge path={geometry.path} style={style} markerEnd={markerEnd} />
      {parts && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${geometry.labelX}px,${geometry.labelY}px)`,
              pointerEvents: "all",
              zIndex: animated ? 1100 : 1000,
            }}
            className={cn(
              "nodrag nopan select-none rounded-lg border border-border bg-surface/95 px-2 py-0.5 text-foreground shadow-sm hover:border-border",
              animated && "shadow-md",
            )}
          >
            {parts.kind === "amount" && (
              <div className="flex max-w-[130px] flex-col items-center justify-center px-1 py-0.5 text-center leading-tight">
                <span className="whitespace-nowrap text-[9px] font-medium tracking-tight text-muted-fg">
                  {parts.title}
                </span>
                {parts.value && (
                  <span
                    className={cn(
                      "whitespace-nowrap font-mono text-[10px]",
                      TONE_CLASS[parts.tone],
                    )}
                  >
                    {parts.value}
                  </span>
                )}
              </div>
            )}
            {parts.kind === "note" && (
              <div className="flex max-w-[130px] flex-col items-center justify-center px-1 py-0.5 text-center leading-tight">
                <span className="whitespace-nowrap text-[9px] font-medium tracking-tight text-muted-fg">
                  {parts.title}
                </span>
                <span className="whitespace-nowrap text-[9px] italic text-muted-fg">
                  {parts.note}
                </span>
              </div>
            )}
            {parts.kind === "plain" && (
              <div className="max-w-[130px] break-words px-1 py-0.5 text-center text-[10px] font-medium leading-tight">
                {parts.text}
              </div>
            )}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
});
