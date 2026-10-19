import React from "react";
import { useReactFlow, useStore } from "@xyflow/react";
import {
  Eye,
  EyeOff,
  Maximize,
  Minimize,
  Scan,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

export interface WorkflowCanvasToolbarLabels {
  zoomIn: string;
  zoomOut: string;
  fit: string;
  enterFullscreen: string;
  exitFullscreen: string;
  showRead: string;
  hideRead: string;
  step: string;
  solidArrow: string;
  dashedArrow: string;
  readArrow: string;
  completed: string;
  cancelled: string;
}

interface WorkflowCanvasToolbarProps {
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  showReadEdges: boolean;
  onToggleReadEdges: () => void;
  hasReadEdges: boolean;
  labels: WorkflowCanvasToolbarLabels;
}

const BUTTON =
  "inline-flex h-7 w-7 items-center justify-center rounded border border-slate-300 bg-white text-slate-700 hover:bg-slate-100";

/** Thanh công cụ nằm trên khung canvas (không đè lên sơ đồ): zoom, vừa khung, toàn màn hình, luồng đọc, chú giải. */
export function WorkflowCanvasToolbar({
  isFullscreen,
  onToggleFullscreen,
  showReadEdges,
  onToggleReadEdges,
  hasReadEdges,
  labels,
}: WorkflowCanvasToolbarProps) {
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  const zoomPercent = useStore((state) => Math.round(state.transform[2] * 100));
  const fullscreenLabel = isFullscreen
    ? labels.exitFullscreen
    : labels.enterFullscreen;
  const readLabel = showReadEdges ? labels.hideRead : labels.showRead;

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 bg-white px-3 py-2 text-xs text-slate-700">
      <button
        type="button"
        className={BUTTON}
        title={labels.zoomOut}
        aria-label={labels.zoomOut}
        onClick={() => void zoomOut()}
      >
        <ZoomOut className="h-3.5 w-3.5" />
      </button>
      <span className="w-12 text-center font-semibold tabular-nums">
        {zoomPercent}%
      </span>
      <button
        type="button"
        className={BUTTON}
        title={labels.zoomIn}
        aria-label={labels.zoomIn}
        onClick={() => void zoomIn()}
      >
        <ZoomIn className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        className={BUTTON}
        title={labels.fit}
        aria-label={labels.fit}
        onClick={() => void fitView({ padding: 0.05, duration: 200 })}
      >
        <Scan className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        className={BUTTON}
        title={fullscreenLabel}
        aria-label={fullscreenLabel}
        onClick={onToggleFullscreen}
      >
        {isFullscreen ? (
          <Minimize className="h-3.5 w-3.5" />
        ) : (
          <Maximize className="h-3.5 w-3.5" />
        )}
      </button>
      {hasReadEdges && (
        <button
          type="button"
          className={`${BUTTON} w-auto gap-1 px-2 ${showReadEdges ? "bg-slate-100" : ""}`}
          aria-pressed={showReadEdges}
          onClick={onToggleReadEdges}
        >
          {showReadEdges ? (
            <EyeOff className="h-3.5 w-3.5" />
          ) : (
            <Eye className="h-3.5 w-3.5" />
          )}
          <span>{readLabel}</span>
        </button>
      )}

      <div className="ml-auto flex flex-wrap items-center gap-3 text-[11px] text-slate-600">
        <span className="inline-flex items-center gap-1">
          <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-slate-900 text-[10px] font-bold text-white">
            1
          </span>
          {labels.step}
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="inline-block w-6 border-t-2 border-slate-700" />
          {labels.solidArrow}
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="inline-block w-6 border-t-2 border-dashed border-slate-500" />
          {labels.dashedArrow}
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="inline-block w-6 border-t border-dotted border-slate-400" />
          {labels.readArrow}
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="inline-block h-3 w-4 rounded-sm border-2 border-green-700" />
          {labels.completed}
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="inline-block h-3 w-4 rounded-sm border-2 border-red-700" />
          {labels.cancelled}
        </span>
      </div>
    </div>
  );
}
