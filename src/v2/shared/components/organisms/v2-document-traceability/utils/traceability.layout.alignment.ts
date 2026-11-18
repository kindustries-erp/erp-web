import type {
  TraceabilityEdge,
  TraceabilityLayoutDirection,
  TraceabilityStageKey,
} from "../types/traceability.type";
import type { StageNodeGroup } from "./traceability.layout.barycenter";
import {
  alignHorizontal,
  HORIZONTAL_METRICS,
} from "./traceability.layout.alignment.horizontal";
import {
  alignVertical,
  VERTICAL_METRICS,
} from "./traceability.layout.alignment.vertical";

export { HORIZONTAL_METRICS, VERTICAL_METRICS };

export interface AlignedStageResult {
  nodePositions: Map<string, { x: number; y: number }>;
  stageDimensions: Map<TraceabilityStageKey, { width: number; height: number }>;
}

/**
 * Tính toán vị trí x, y gióng hàng cho các node chứng từ trong từng stage,
 * ưu tiên các cặp node có liên kết nằm ngang hàng nhau và căn giữa cân đối.
 */
export function computeAlignedStagePositions(
  stages: StageNodeGroup[],
  edges: TraceabilityEdge[],
  direction: TraceabilityLayoutDirection,
): AlignedStageResult {
  const nodePositions = new Map<string, { x: number; y: number }>();
  const stageDimensions = new Map<
    TraceabilityStageKey,
    { width: number; height: number }
  >();

  const nodeStageMap = new Map<string, number>();
  stages.forEach((stage, idx) =>
    stage.nodes.forEach((n) => nodeStageMap.set(n.id, idx)),
  );

  const upstreamNeighbors = new Map<string, string[]>();
  for (const edge of edges) {
    const sStage = nodeStageMap.get(edge.source);
    const tStage = nodeStageMap.get(edge.target);
    if (sStage === undefined || tStage === undefined || sStage === tStage)
      continue;
    const [parent, child] =
      sStage < tStage ? [edge.source, edge.target] : [edge.target, edge.source];
    if (!upstreamNeighbors.has(child)) upstreamNeighbors.set(child, []);
    upstreamNeighbors.get(child)!.push(parent);
  }

  if (direction === "horizontal") {
    alignHorizontal(stages, upstreamNeighbors, nodePositions, stageDimensions);
  } else {
    alignVertical(stages, upstreamNeighbors, nodePositions, stageDimensions);
  }
  return { nodePositions, stageDimensions };
}
