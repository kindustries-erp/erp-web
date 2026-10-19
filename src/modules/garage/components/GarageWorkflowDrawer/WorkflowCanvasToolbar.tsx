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

import { Combobox, type ComboboxOption } from "@/shared/components/Combobox";

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
  canvasOptions: ComboboxOption[];
  activeCanvasId: string;
  onSelectCanvas: (canvasId: string) => void;
  flows?: WorkflowToolbarFlow[];
  /** Luồng đang làm nổi; `null` khi xem tất cả hoặc đang chọn một thẻ. */
  activeFlow: string | null;
  onSelectFlow: (flowId: string | null) => void;
  /** Đang chọn một thẻ: hiện nút "Bỏ chọn thẻ". */
  hasSelectedNode: boolean;
  onClearSelection: () => void;
  /** Gắn dropdown vào khung canvas khi full screen (dropdown ở body sẽ bị ẩn). */
  portalContainer?: HTMLElement | null;
}

/** Nội dung tooltip của option: tên in đậm, mô tả bên dưới. */
function TooltipText({ title, text }: { title: string; text: string }) {
  return (
    <div className="max-w-xs text-xs leading-snug">
      <div className="font-semibold">{title}</div>
      <div>{text}</div>
    </div>
  );
}

const ICON_BUTTON =
  "inline-flex h-7 w-7 items-center justify-center rounded border border-slate-300 bg-white text-slate-700 hover:bg-slate-100";
const TEXT_BUTTON =
  "inline-flex h-7 items-center gap-1.5 rounded border border-slate-300 bg-white px-2 text-slate-700 hover:bg-slate-100";

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

  const flowOptions = useMemo<ComboboxOption[]>(
    () => [
      {
        value: FLOW_ALL,
        label: labels.flowAll,
        tooltipContent: (
          <TooltipText title={labels.flowAll} text={labels.flowAllHint} />
        ),
      },
      ...(flows ?? []).map((flow) => ({
        value: flow.id,
        label: `${flow.letter}. ${flow.title}`,
        tooltipContent: (
          <TooltipText
            title={`${flow.letter}. ${flow.title}`}
            text={flow.description}
          />
        ),
      })),
    ],
    [flows, labels.flowAll],
  );

  return (
    <div className="border-b border-slate-200 bg-white px-3 py-2 text-xs text-slate-700">
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="font-semibold text-slate-800">
          {labels.canvasLabel}
        </span>
        <Combobox
          options={canvasOptions}
          value={activeCanvasId}
          onChange={onSelectCanvas}
          allowClear={false}
          className="w-32"
          searchPlaceholder={labels.canvasLabel}
          portalContainer={portalContainer}
        />
        {flows && flows.length > 0 && (
          <>
            <span className="ml-1 font-semibold text-slate-800">
              {labels.flowsLabel}
            </span>
            <Combobox
              options={flowOptions}
              value={activeFlow ?? FLOW_ALL}
              onChange={(value) =>
                onSelectFlow(value === FLOW_ALL ? null : value)
              }
              allowClear={false}
              className="w-44"
              searchPlaceholder={labels.flowsLabel}
              portalContainer={portalContainer}
            />
          </>
        )}
        <span className="mx-1 h-5 border-l border-slate-200" />
        <button
          type="button"
          className={ICON_BUTTON}
          title={labels.zoomOut}
          aria-label={labels.zoomOut}
          onClick={() => void zoomOut()}
        >
          <Minus className="h-3.5 w-3.5" />
        </button>
        <span className="w-12 text-center font-semibold tabular-nums">
          {zoomPercent}%
        </span>
        <button
          type="button"
          className={ICON_BUTTON}
          title={labels.zoomIn}
          aria-label={labels.zoomIn}
          onClick={() => void zoomIn()}
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          className={TEXT_BUTTON}
          onClick={() => void fitView({ padding: 0.05, duration: 200 })}
        >
          <ScanSearch className="h-3.5 w-3.5" />
          <span>{labels.fit}</span>
        </button>
        <button
          type="button"
          className={TEXT_BUTTON}
          aria-label={fullscreenLabel}
          onClick={onToggleFullscreen}
        >
          {isFullscreen ? (
            <Minimize2 className="h-3.5 w-3.5" />
          ) : (
            <Maximize2 className="h-3.5 w-3.5" />
          )}
          <span>{fullscreenLabel}</span>
        </button>
        {hasReadEdges && (
          <button
            type="button"
            className={`${TEXT_BUTTON} ${showReadEdges ? "bg-slate-100" : ""}`}
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
        {hasSelectedNode && (
          <button
            type="button"
            className={`${TEXT_BUTTON} border-slate-700 bg-slate-100 font-semibold`}
            onClick={onClearSelection}
          >
            <X className="h-3.5 w-3.5" />
            <span>{labels.clearSelection}</span>
          </button>
        )}

        <div className="ml-auto flex flex-wrap items-center gap-3 text-[11px] text-slate-600">
          <span className="inline-flex items-center gap-1">
            <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-slate-900 px-1 text-[10px] font-bold text-white">
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
    </div>
  );
}
