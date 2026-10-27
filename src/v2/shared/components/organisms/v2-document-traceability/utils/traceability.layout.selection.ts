import type { TraceabilityGraphData } from "../types/traceability.type";

export interface TraceabilitySelection {
  nodeIds: Set<string>;
  edgeIds: Set<string>;
}

/**
 * Các node và cạnh liên quan tới node đang chọn, duyệt nhiều bậc cả hai chiều
 * (xuôi theo cạnh và ngược cạnh). Không chọn gì thì trả về tập rỗng.
 */
export function collectConnectedSelection(
  graph: TraceabilityGraphData,
  selectedNodeId?: string | null,
): TraceabilitySelection {
  const selection: TraceabilitySelection = {
    nodeIds: new Set(),
    edgeIds: new Set(),
  };
  if (!selectedNodeId) return selection;

  selection.nodeIds.add(selectedNodeId);
  walk(graph, selectedNodeId, "source", selection);
  walk(graph, selectedNodeId, "target", selection);
  return selection;
}

function walk(
  graph: TraceabilityGraphData,
  startId: string,
  direction: "source" | "target",
  selection: TraceabilitySelection,
) {
  // Xuôi: từ source sang target; ngược: từ target về source
  const from = direction === "source" ? "source" : "target";
  const to = direction === "source" ? "target" : "source";
  let frontier = [startId];
  while (frontier.length > 0) {
    const next: string[] = [];
    for (const id of frontier) {
      for (const edge of graph.edges) {
        if (edge[from] !== id || selection.edgeIds.has(edge.id)) continue;
        selection.edgeIds.add(edge.id);
        selection.nodeIds.add(edge[to]);
        next.push(edge[to]);
      }
    }
    frontier = next;
  }
}
