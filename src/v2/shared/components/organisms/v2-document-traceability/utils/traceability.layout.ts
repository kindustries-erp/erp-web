import { MarkerType } from "@xyflow/react";
import { TRACEABILITY_STAGES } from "../constants/traceability.constants";
import type {
  TraceabilityGraphData,
  TraceabilityLayoutDirection,
  TraceabilityNode,
  TraceabilityNodeType,
  TraceabilityStageKey,
} from "../types/traceability.type";
import type {
  TraceabilityCanvasActions,
  TraceDocFlowNode,
  TraceFlowEdge,
  TraceFlowNode,
} from "../types/traceability.flow.type";
import { getStageForDocType } from "./traceability.helper";
import { collectConnectedSelection } from "./traceability.layout.selection";
import { buildTraceEdge, pickEdgeHandles } from "./traceability.layout.edges";
import { placeStage, stageNodeId } from "./traceability.layout.placement";
import {
  barycenterSortStages,
  type StageNodeGroup,
} from "./traceability.layout.barycenter";
import { computeAlignedStagePositions } from "./traceability.layout.alignment";

export interface TraceabilityLayoutInput {
  graph: TraceabilityGraphData;
  direction: TraceabilityLayoutDirection;
  allowEdit: boolean;
  allowedDocTypes?: TraceabilityNodeType[];
  selectedNodeId?: string | null;
  actions: TraceabilityCanvasActions;
}

export interface TraceabilityLayout {
  nodes: TraceFlowNode[];
  edges: TraceFlowEdge[];
}

/**
 * Tính toán hình học cơ sở (Base Geometry): tọa độ các cột và node (memo hóa cố định).
 */
export function computeBaseTraceabilityLayout({
  graph,
  direction,
  allowEdit,
  allowedDocTypes,
  actions,
}: Omit<TraceabilityLayoutInput, "selectedNodeId">): TraceabilityLayout {
  const docsByStage = groupByStage(graph.nodes);
  const activeStages = TRACEABILITY_STAGES.filter(
    (s) => (docsByStage.get(s.key)?.length ?? 0) > 0,
  );
  const maxDocs = Math.max(
    1,
    ...activeStages.map((s) => docsByStage.get(s.key)?.length ?? 0),
  );

  const stageGroups: StageNodeGroup[] = activeStages.map((stage) => ({
    stageKey: stage.key,
    nodes: docsByStage.get(stage.key) ?? [],
  }));

  const sortedStages = barycenterSortStages(stageGroups, graph.edges);
  const { nodePositions, stageDimensions } = computeAlignedStagePositions(
    sortedStages,
    graph.edges,
    direction,
  );

  const nodes: TraceFlowNode[] = [];
  activeStages.forEach((stage, stageIndex) => {
    const sortedGroup = sortedStages.find((s) => s.stageKey === stage.key);
    const docs = sortedGroup?.nodes ?? [];
    const dims = stageDimensions.get(stage.key);
    const frame = placeStage(direction, stageIndex, docs.length, maxDocs, dims);

    nodes.push({
      id: stageNodeId(stage),
      type: "stageGroupNode",
      position: { x: frame.x, y: frame.y },
      style: { width: frame.width, height: frame.height },
      selectable: false,
      draggable: false,
      zIndex: -1,
      data: { stage, count: docs.length, allowEdit, allowedDocTypes, actions },
    });

    docs.forEach((doc) => {
      const pos = nodePositions.get(doc.id) ?? { x: 0, y: 0 };
      nodes.push({
        id: doc.id,
        type: "traceabilityNode",
        parentId: stageNodeId(stage),
        extent: "parent",
        position: pos,
        selected: false,
        draggable: false,
        zIndex: 10,
        data: { node: doc, allowEdit, actions },
      });
    });
  });

  const docNodes = nodes.filter(
    (n): n is TraceDocFlowNode => n.type === "traceabilityNode",
  );
  const edges = graph.edges.map((edge) => {
    const source = docNodes.find((n) => n.id === edge.source);
    const target = docNodes.find((n) => n.id === edge.target);
    return buildTraceEdge(
      edge,
      pickEdgeHandles(direction, source, target),
      false,
    );
  });

  return { nodes, edges };
}

/**
 * Cập nhật trạng thái chọn (Selection State) siêu tốc O(N) mà không tính lại vị trí hình học.
 * Đạt chuẩn hiệu năng 60 FPS cho React Flow.
 */
export function applySelectionToLayout(
  baseLayout: TraceabilityLayout,
  graph: TraceabilityGraphData,
  selectedNodeId?: string | null,
): TraceabilityLayout {
  if (!selectedNodeId) {
    const hasActive = baseLayout.nodes.some((n) => n.selected);
    if (!hasActive) return baseLayout;
  }
  const selection = collectConnectedSelection(graph, selectedNodeId);

  const nodes = baseLayout.nodes.map((node) => {
    if (node.type !== "traceabilityNode") return node;
    const isSelected = selectedNodeId === node.id;
    if (
      node.selected === isSelected &&
      node.zIndex === (isSelected ? 30 : 10)
    ) {
      return node;
    }
    return { ...node, selected: isSelected, zIndex: isSelected ? 30 : 10 };
  });

  const edges = baseLayout.edges.map((edge) => {
    const inSelection = selection.edgeIds.has(edge.id);
    if (
      edge.animated === inSelection &&
      edge.zIndex === (inSelection ? 40 : 30)
    ) {
      return edge;
    }
    const strokeColor = inSelection ? "var(--primary)" : "var(--muted-fg)";
    return {
      ...edge,
      animated: inSelection,
      zIndex: inSelection ? 40 : 30,
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 14,
        height: 14,
        color: strokeColor,
      },
      style: {
        ...edge.style,
        stroke: strokeColor,
        strokeWidth: inSelection ? 2.2 : 1.8,
      },
    };
  });

  return { nodes, edges };
}

/**
 * Tính vị trí node và cạnh cho React Flow (hỗ trợ tương thích ngược).
 */
export function computeTraceabilityLayout(
  input: TraceabilityLayoutInput,
): TraceabilityLayout {
  const base = computeBaseTraceabilityLayout(input);
  return input.selectedNodeId
    ? applySelectionToLayout(base, input.graph, input.selectedNodeId)
    : base;
}

function groupByStage(
  nodes: TraceabilityNode[],
): Map<TraceabilityStageKey, TraceabilityNode[]> {
  const groups = new Map<TraceabilityStageKey, TraceabilityNode[]>(
    TRACEABILITY_STAGES.map((s) => [s.key, []]),
  );
  nodes.forEach((n) => groups.get(getStageForDocType(n.docType).key)?.push(n));
  return groups;
}
