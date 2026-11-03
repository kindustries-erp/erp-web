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
 * Tính vị trí node và cạnh cho React Flow.
 * Tích hợp thuật toán Barycenter Sweep và Alignment để triệt tiêu giao cắt và gióng hàng các chứng từ liên kết.
 */
export function computeTraceabilityLayout({
  graph,
  direction,
  allowEdit,
  allowedDocTypes,
  selectedNodeId,
  actions,
}: TraceabilityLayoutInput): TraceabilityLayout {
  const selection = collectConnectedSelection(graph, selectedNodeId);
  const docsByStage = groupByStage(graph.nodes);
  const activeStages = TRACEABILITY_STAGES.filter(
    (stage) => (docsByStage.get(stage.key)?.length ?? 0) > 0,
  );
  const maxDocs = Math.max(
    1,
    ...activeStages.map((s) => docsByStage.get(s.key)?.length ?? 0),
  );

  // 1. Chuẩn bị danh sách StageNodeGroup cho Barycenter Sweep
  const stageGroups: StageNodeGroup[] = activeStages.map((stage) => ({
    stageKey: stage.key,
    nodes: docsByStage.get(stage.key) ?? [],
  }));

  // 2. Chạy Barycenter Sweep để giảm thiểu việc cắt chéo dây nối
  const sortedStages = barycenterSortStages(stageGroups, graph.edges);

  // 3. Tính toán vị trí x, y gióng hàng cho các node và kích thước stage
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
      const isSelected = selectedNodeId === doc.id;
      const pos = nodePositions.get(doc.id) ?? { x: 0, y: 0 };
      nodes.push({
        id: doc.id,
        type: "traceabilityNode",
        parentId: stageNodeId(stage),
        extent: "parent",
        position: pos,
        selected: isSelected,
        draggable: false, // Node cố định, người dùng không thể kéo rê
        zIndex: isSelected ? 30 : 10,
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
      selection.edgeIds.has(edge.id),
    );
  });

  return { nodes, edges };
}

function groupByStage(
  nodes: TraceabilityNode[],
): Map<TraceabilityStageKey, TraceabilityNode[]> {
  const groups = new Map<TraceabilityStageKey, TraceabilityNode[]>(
    TRACEABILITY_STAGES.map((stage) => [stage.key, []]),
  );
  for (const node of nodes) {
    groups.get(getStageForDocType(node.docType).key)?.push(node);
  }
  return groups;
}
