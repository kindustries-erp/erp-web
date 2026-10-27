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
  in: "text-emerald-600 dark:text-emerald-400 font-bold",
  out: "text-[#ea580c] dark:text-orange-400 font-bold",
  neutral: "text-slate-900 dark:text-slate-100 font-bold",
};

/** Cạnh nối hai chứng từ, nhãn đặt trên đường đi và tự tránh các khung giai đoạn */
export function V2TraceEdge({
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
              "nodrag nopan select-none rounded-lg border border-slate-200/90 bg-white/95 px-2 py-0.5 text-slate-800 shadow-sm backdrop-blur-xs transition-all hover:border-slate-400 dark:border-slate-700 dark:bg-slate-900/95 dark:text-slate-200",
              animated && "shadow-md",
            )}
          >
            {parts.kind === "amount" && (
              <div className="flex max-w-[130px] flex-col items-center justify-center px-1 py-0.5 text-center leading-tight">
                <V2Text
                  as="span"
                  className="whitespace-nowrap text-[9px] font-medium tracking-tight text-slate-500 dark:text-slate-400"
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
              <div className="flex max-w-[130px] flex-col items-center justify-center px-1 py-0.5 text-center leading-tight">
                <V2Text
                  as="span"
                  className="whitespace-nowrap text-[9px] font-medium tracking-tight text-slate-700 dark:text-slate-300"
                >
                  {parts.title}
                </V2Text>
                <V2Text
                  as="span"
                  className="whitespace-nowrap text-[9px] italic text-slate-500 dark:text-slate-400"
                >
                  {parts.note}
                </V2Text>
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
}
