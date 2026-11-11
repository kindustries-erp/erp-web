import React, { useMemo } from "react";
import { useReactFlow, useStore } from "@xyflow/react";
import {
  Eye,
  EyeOff,
  Maximize2,
  Minimize2,
  Minus,
  Plus,
  ScanSearch,
  X,
} from "lucide-react";

import { V2Button } from "@/v2/shared/components";
import { cn } from "@/v2/shared/utils/cn";

import { ToolbarSelect, type WorkflowCanvasOption } from "./ToolbarSelect";
import { WorkflowCanvasLegend } from "./WorkflowCanvasLegend";

export type { WorkflowCanvasOption } from "./ToolbarSelect";

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
  canvasLabel: string;
  flowsLabel: string;
  flowAll: string;
  flowAllHint: string;
  clearSelection: string;
}

/** Luồng tự động hiển thị trong dropdown (đã dịch). */
export interface WorkflowToolbarFlow {
  id: string;
  letter: string;
  color: string;
  title: string;
  description: string;
}

const FLOW_ALL = "all";

interface WorkflowCanvasToolbarProps {
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  showReadEdges: boolean;
  onToggleReadEdges: () => void;
  hasReadEdges: boolean;
  labels: WorkflowCanvasToolbarLabels;
  /** Danh sách sơ đồ để chọn (End user, Dev) và sơ đồ đang xem. */
  canvasOptions: WorkflowCanvasOption[];
  activeCanvasId: string;
  onSelectCanvas: (canvasId: string) => void;
  flows?: WorkflowToolbarFlow[];
  /** Luồng đang làm nổi; `null` khi xem tất cả hoặc đang chọn một thẻ. */
  activeFlow: string | null;
  onSelectFlow: (flowId: string | null) => void;
  /** Đang chọn một thẻ: hiện nút "Bỏ chọn thẻ". */
  hasSelectedNode: boolean;
  onClearSelection: () => void;
  /** Khung fullscreen của canvas, dùng làm nơi portal danh sách của ô chọn. */
  portalContainer?: HTMLElement | null;
}

const ICON_BUTTON = "h-11 w-11 sm:h-7 sm:w-7";
const TEXT_BUTTON = "h-11 gap-1.5 sm:h-7";

/**
 * Thanh công cụ một hàng nằm trên khung canvas (không đè lên sơ đồ):
 * dropdown Sơ đồ, dropdown Luồng tự động, zoom (− % +), "Vừa khung", "Toàn màn hình",
 * luồng đọc, bỏ chọn thẻ và chú giải.
 */
export function WorkflowCanvasToolbar({
  isFullscreen,
  onToggleFullscreen,
  showReadEdges,
  onToggleReadEdges,
  hasReadEdges,
  labels,
  canvasOptions,
  activeCanvasId,
  onSelectCanvas,
  flows,
  activeFlow,
  onSelectFlow,
  hasSelectedNode,
  onClearSelection,
  portalContainer,
}: WorkflowCanvasToolbarProps) {
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  const zoomPercent = useStore((state) => Math.round(state.transform[2] * 100));
  const fullscreenLabel = isFullscreen
    ? labels.exitFullscreen
    : labels.enterFullscreen;
  const readLabel = showReadEdges ? labels.hideRead : labels.showRead;

  const flowOptions = useMemo<WorkflowCanvasOption[]>(
    () => [
      {
        value: FLOW_ALL,
        label: labels.flowAll,
        description: labels.flowAllHint,
      },
      ...(flows ?? []).map((flow) => ({
        value: flow.id,
        label: `${flow.letter}. ${flow.title}`,
        description: flow.description,
      })),
    ],
    [flows, labels.flowAll, labels.flowAllHint],
  );

  return (
    <div className="border-b border-slate-200 bg-white px-3 py-2 text-xs text-slate-700">
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="font-semibold text-slate-800">
          {labels.canvasLabel}
        </span>
        <ToolbarSelect
          options={canvasOptions}
          value={activeCanvasId}
          onChange={onSelectCanvas}
          label={labels.canvasLabel}
          portalContainer={portalContainer}
          className="w-36"
        />
        {flows && flows.length > 0 && (
          <>
            <span className="ml-1 font-semibold text-slate-800">
              {labels.flowsLabel}
            </span>
            <ToolbarSelect
              options={flowOptions}
              value={activeFlow ?? FLOW_ALL}
              onChange={(value) =>
                onSelectFlow(value === FLOW_ALL ? null : value)
              }
              label={labels.flowsLabel}
              portalContainer={portalContainer}
              className="w-48"
            />
          </>
        )}
        <span className="mx-1 h-5 border-l border-slate-200" />
        <V2Button
          variant="outline"
          size="icon-sm"
          className={ICON_BUTTON}
          title={labels.zoomOut}
          aria-label={labels.zoomOut}
          onClick={() => void zoomOut()}
        >
          <Minus className="h-3.5 w-3.5" />
        </V2Button>
        <span className="w-12 text-center font-semibold tabular-nums">
          {zoomPercent}%
        </span>
        <V2Button
          variant="outline"
          size="icon-sm"
          className={ICON_BUTTON}
          title={labels.zoomIn}
          aria-label={labels.zoomIn}
          onClick={() => void zoomIn()}
        >
          <Plus className="h-3.5 w-3.5" />
        </V2Button>
        <V2Button
          variant="outline"
          size="sm"
          className={TEXT_BUTTON}
          leftIcon={<ScanSearch className="h-3.5 w-3.5" />}
          onClick={() => void fitView({ padding: 0.05, duration: 200 })}
        >
          {labels.fit}
        </V2Button>
        <V2Button
          variant="outline"
          size="sm"
          className={TEXT_BUTTON}
          aria-label={fullscreenLabel}
          leftIcon={
            isFullscreen ? (
              <Minimize2 className="h-3.5 w-3.5" />
            ) : (
              <Maximize2 className="h-3.5 w-3.5" />
            )
          }
          onClick={onToggleFullscreen}
        >
          {fullscreenLabel}
        </V2Button>
        {hasReadEdges && (
          <V2Button
            variant="outline"
            size="sm"
            className={cn(TEXT_BUTTON, showReadEdges && "bg-accent")}
            aria-pressed={showReadEdges}
            leftIcon={
              showReadEdges ? (
                <EyeOff className="h-3.5 w-3.5" />
              ) : (
                <Eye className="h-3.5 w-3.5" />
              )
            }
            onClick={onToggleReadEdges}
          >
            {readLabel}
          </V2Button>
        )}
        {hasSelectedNode && (
          <V2Button
            variant="outline"
            size="sm"
            className={cn(
              TEXT_BUTTON,
              "border-slate-700 bg-accent font-semibold",
            )}
            leftIcon={<X className="h-3.5 w-3.5" />}
            onClick={onClearSelection}
          >
            {labels.clearSelection}
          </V2Button>
        )}

        <WorkflowCanvasLegend labels={labels} />
      </div>
    </div>
  );
}
