import type { Edge, Node } from "@xyflow/react";
import type {
  TraceabilityNode,
  TraceabilityNodeType,
  TraceabilityStageConfig,
  TraceabilityStageKey,
} from "./traceability.type";

/** Hành động của canvas do cha truyền vào; canvas không tự mở màn hình khác */
export interface TraceabilityCanvasActions {
  /** `stageKey` vắng mặt khi ghép nối từ thanh công cụ (không thuộc giai đoạn nào) */
  onAddLink?: (
    stageKey?: TraceabilityStageKey,
    docType?: TraceabilityNodeType,
  ) => void;
  onUnlinkNode?: (node: TraceabilityNode) => void;
  onOpenDocument?: (node: TraceabilityNode) => void;
  onEditManualSettlement?: (node: TraceabilityNode) => void;
}

export interface TraceNodeData extends Record<string, unknown> {
  node: TraceabilityNode;
  allowEdit: boolean;
  actions: TraceabilityCanvasActions;
}

export interface TraceStageGroupData extends Record<string, unknown> {
  stage: TraceabilityStageConfig;
  count: number;
  allowEdit: boolean;
  allowedDocTypes?: TraceabilityNodeType[];
  actions: TraceabilityCanvasActions;
}

export type TraceDocFlowNode = Node<TraceNodeData, "traceabilityNode">;
export type TraceStageFlowNode = Node<TraceStageGroupData, "stageGroupNode">;
export type TraceFlowNode = TraceDocFlowNode | TraceStageFlowNode;
export type TraceFlowEdge = Edge<Record<string, unknown>, "labeledSmoothStep">;

/** Hàm dịch của V2 (`useV2Translation().t`), truyền xuống các hàm dựng cột và nhãn */
export type TranslateFn = (
  key: string,
  options?: Record<string, unknown>,
) => string;
