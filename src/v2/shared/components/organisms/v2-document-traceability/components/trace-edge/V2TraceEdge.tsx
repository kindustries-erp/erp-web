import React from "react";
import { BaseEdge, EdgeLabelRenderer, type EdgeProps } from "@xyflow/react";
import { cn } from "@/v2/shared/utils/cn";
import { computeEdgeGeometry } from "../../utils/traceability.edge-path";
import {
  parseEdgeLabel,
  type EdgeLabelTone,
} from "../../utils/traceability.edge-label";
import { V2Text } from "@/v2/shared/components/atoms/v2-text";

const TONE_CLASS: Record<EdgeLabelTone, string> = {
  in: "text-success font-bold",
  out: "text-warning font-bold",
  neutral: "text-foreground font-bold",
};

/** Cạnh nối hai chứng từ, nhãn đặt trên đường đi và tự tránh các khung giai đoạn */
export const V2TraceEdge = React.memo(
  function V2TraceEdge({
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

    const edgeStyle: React.CSSProperties = {
      ...style,
      transition: "stroke 0.2s ease, stroke-width 0.2s ease",
      ...(animated
        ? {
            strokeDasharray: "6 4",
            animation: "dashdraw 0.6s linear infinite",
          }
        : {}),
    };

    return (
      <>
        <BaseEdge
          path={geometry.path}
          style={edgeStyle}
          markerEnd={markerEnd}
        />
        {parts && (
          <EdgeLabelRenderer>
            <div
              data-testid="v2-trace-edge-label"
              style={{
                position: "absolute",
                transform: `translate(-50%, -100%) translate3d(${geometry.labelX}px,${geometry.labelY - 6}px,0)`,
                pointerEvents: "all",
                willChange: "transform",
                zIndex: animated ? 1100 : 1000,
              }}
              className={cn(
                "nodrag nopan select-none rounded-full border border-border bg-surface px-2.5 py-0.5 text-foreground shadow-2xs transition-all duration-200 hover:border-primary hover:scale-105",
                animated && "border-primary ring-1 ring-primary/40 shadow-sm",
              )}
            >
              {parts.kind === "amount" && (
                <div className="flex max-w-[140px] flex-col items-center justify-center px-1 py-0.5 text-center leading-tight">
                  <V2Text
                    as="span"
                    className="whitespace-nowrap text-[9px] font-medium tracking-tight text-muted-fg"
                  >
                    {parts.title}
                  </V2Text>
                  {parts.value && (
                    <V2Text
                      as="span"
                      className={cn(
                        "whitespace-nowrap font-mono text-[10px]",
                        TONE_CLASS[parts.tone],
                      )}
                    >
                      {parts.value}
                    </V2Text>
                  )}
                </div>
              )}
              {parts.kind === "note" && (
                <div className="flex max-w-[140px] flex-col items-center justify-center px-1 py-0.5 text-center leading-tight">
                  <V2Text
                    as="span"
                    className="whitespace-nowrap text-[9px] font-medium tracking-tight text-muted-fg"
                  >
                    {parts.title}
                  </V2Text>
                  <V2Text
                    as="span"
                    className="whitespace-nowrap text-[9px] italic text-muted-fg"
                  >
                    {parts.note}
                  </V2Text>
                </div>
              )}
              {parts.kind === "plain" && (
                <V2Text
                  as="div"
                  className="max-w-[140px] break-words px-1.5 py-0.5 text-center text-[10px] font-medium leading-tight"
                >
                  {parts.text}
                </V2Text>
              )}
            </div>
          </EdgeLabelRenderer>
        )}
      </>
    );
  },
  (prev, next) =>
    prev.sourceX === next.sourceX &&
    prev.sourceY === next.sourceY &&
    prev.targetX === next.targetX &&
    prev.targetY === next.targetY &&
    prev.animated === next.animated &&
    prev.label === next.label &&
    prev.markerEnd === next.markerEnd,
);
