import type {
  TraceabilityEdge,
  TraceabilityNode,
  TraceabilityStageKey,
} from "../types/traceability.type";

export interface StageNodeGroup {
  stageKey: TraceabilityStageKey;
  nodes: TraceabilityNode[];
}

/**
 * Thuật toán Barycenter Sweep sắp xếp lại thứ tự node trong từng stage
 * để giảm thiểu tối đa việc các dây nối cắt chéo nhau (edge crossings).
 */
export function barycenterSortStages(
  stages: StageNodeGroup[],
  edges: TraceabilityEdge[],
  passes = 2,
): StageNodeGroup[] {
  if (stages.length <= 1 || edges.length === 0) {
    return stages.map((s) => ({ ...s, nodes: [...s.nodes] }));
  }

  // Tạo map id -> stageIndex
  const nodeStageMap = new Map<string, number>();
  stages.forEach((stage, idx) => {
    stage.nodes.forEach((n) => nodeStageMap.set(n.id, idx));
  });

  // Bản đồ lân cận 2 chiều
  const adjacency = new Map<string, Set<string>>();
  for (const edge of edges) {
    if (!adjacency.has(edge.source)) adjacency.set(edge.source, new Set());
    if (!adjacency.has(edge.target)) adjacency.set(edge.target, new Set());
    adjacency.get(edge.source)?.add(edge.target);
    adjacency.get(edge.target)?.add(edge.source);
  }

  // Sao chép danh sách nodes từng stage
  const result: StageNodeGroup[] = stages.map((s) => ({
    stageKey: s.stageKey,
    nodes: [...s.nodes],
  }));

  // Thực hiện các lượt quét (Forward rồi Backward)
  for (let pass = 0; pass < passes; pass++) {
    // 1. Quét xuôi: từ stage 1 đến N-1, dựa vào vị trí stage trước
    for (let i = 1; i < result.length; i++) {
      result[i].nodes = sortStageByNeighbors(
        result[i].nodes,
        adjacency,
        nodeStageMap,
        (neighborStage) => neighborStage < i,
        result,
      );
    }

    // 2. Quét ngược: từ stage N-2 về 0, dựa vào vị trí stage sau
    for (let i = result.length - 2; i >= 0; i--) {
      result[i].nodes = sortStageByNeighbors(
        result[i].nodes,
        adjacency,
        nodeStageMap,
        (neighborStage) => neighborStage > i,
        result,
      );
    }
  }

  return result;
}

function sortStageByNeighbors(
  currentNodes: TraceabilityNode[],
  adjacency: Map<string, Set<string>>,
  nodeStageMap: Map<string, number>,
  stageFilter: (neighborStage: number) => boolean,
  currentStages: StageNodeGroup[],
): TraceabilityNode[] {
  if (currentNodes.length <= 1) return currentNodes;

  // Map vị trí index hiện tại của từng node trong từng stage
  const posMap = new Map<string, number>();
  currentStages.forEach((stg) => {
    stg.nodes.forEach((node, idx) => posMap.set(node.id, idx));
  });

  const scores = new Map<
    string,
    { barycenter: number; originalIndex: number }
  >();

  currentNodes.forEach((node, idx) => {
    const neighbors = adjacency.get(node.id);
    let sum = 0;
    let count = 0;

    if (neighbors) {
      for (const neighborId of neighbors) {
        const neighborStage = nodeStageMap.get(neighborId);
        if (neighborStage !== undefined && stageFilter(neighborStage)) {
          const pos = posMap.get(neighborId);
          if (pos !== undefined) {
            sum += pos;
            count++;
          }
        }
      }
    }

    // Nếu không có liên kết nào ở chiều quét, giữ nguyên chỉ số ban đầu
    const barycenter = count > 0 ? sum / count : idx;
    scores.set(node.id, { barycenter, originalIndex: idx });
  });

  return [...currentNodes].sort((a, b) => {
    const sa = scores.get(a.id)!;
    const sb = scores.get(b.id)!;
    if (sa.barycenter !== sb.barycenter) {
      return sa.barycenter - sb.barycenter;
    }
    return sa.originalIndex - sb.originalIndex;
  });
}
