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
import {
  placeDocument,
  placeStage,
  stageNodeId,
} from "./traceability.layout.placement";

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
 * Tính vị trí node và cạnh cho React Flow. Chỉ giai đoạn có ít nhất một chứng từ mới được vẽ.
 * Hàm thuần: cùng đầu vào cho cùng đầu ra.
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

  const nodes: TraceFlowNode[] = [];
  activeStages.forEach((stage, stageIndex) => {
    const docs = docsByStage.get(stage.key) ?? [];
    const frame = placeStage(direction, stageIndex, docs.length, maxDocs);
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

    docs.forEach((doc, docIndex) => {
      const isSelected = selectedNodeId === doc.id;
      nodes.push({
        id: doc.id,
        type: "traceabilityNode",
        parentId: stageNodeId(stage),
        extent: "parent",
        position: placeDocument(direction, docIndex, frame.width),
        selected: isSelected,
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
