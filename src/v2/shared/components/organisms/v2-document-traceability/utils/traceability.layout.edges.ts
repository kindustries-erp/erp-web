import { MarkerType } from "@xyflow/react";
import type {
  TraceabilityEdge,
  TraceabilityLayoutDirection,
} from "../types/traceability.type";
import type {
  TraceDocFlowNode,
  TraceFlowEdge,
} from "../types/traceability.flow.type";

const EDGE_STROKE = "#94a3b8";

export interface EdgeHandles {
  sourceHandle: string;
  targetHandle: string;
}

/**
 * Handle nối giữa hai chứng từ. Cùng giai đoạn: nối theo trục của bố cục;
 * khác giai đoạn: nối theo hướng chảy của giai đoạn.
 */
export function pickEdgeHandles(
  direction: TraceabilityLayoutDirection,
  source: TraceDocFlowNode | undefined,
  target: TraceDocFlowNode | undefined,
): EdgeHandles {
  const sameStage =
    Boolean(source?.parentId) && source?.parentId === target?.parentId;
  const sourcePos = source?.position ?? { x: 0, y: 0 };
  const targetPos = target?.position ?? { x: 0, y: 0 };

  if (direction === "horizontal") {
    if (!sameStage) return { sourceHandle: "right", targetHandle: "left" };
    return sourcePos.y <= targetPos.y
      ? { sourceHandle: "bottom", targetHandle: "top" }
      : { sourceHandle: "top", targetHandle: "bottom" };
  }
  if (!sameStage) return { sourceHandle: "bottom", targetHandle: "top" };
  return sourcePos.x <= targetPos.x
    ? { sourceHandle: "right", targetHandle: "left" }
    : { sourceHandle: "left", targetHandle: "right" };
}

/** Một cạnh của đồ thị thành edge của React Flow; cạnh thuộc vùng chọn thì chạy animation */
export function buildTraceEdge(
  edge: TraceabilityEdge,
  handles: EdgeHandles,
  inSelection: boolean,
): TraceFlowEdge {
  return {
    id: edge.id,
    source: edge.source,
    target: edge.target,
    sourceHandle: handles.sourceHandle,
    targetHandle: handles.targetHandle,
    type: "labeledSmoothStep",
    label: edge.label || undefined,
    animated: inSelection,
    interactionWidth: 30,
    reconnectable: true,
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 14,
      height: 14,
      color: EDGE_STROKE,
    },
    style: {
      stroke: EDGE_STROKE,
      strokeWidth: inSelection ? 2.2 : 1.8,
      strokeDasharray: edge.isTransitive && !inSelection ? "4 4" : undefined,
    },
    zIndex: inSelection ? 40 : 30,
  };
}
