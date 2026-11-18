import type {
  TraceabilityEdge,
  TraceabilityGraphData,
  TraceabilityNode,
  TraceabilitySummary,
} from "../types/traceability.type";

export interface MergeTraceabilityGraphInput {
  /** Đồ thị backend trả về; null khi chưa tải hoặc lỗi */
  server: TraceabilityGraphData | null;
  /** Node gốc dùng khi đồ thị server không có node gốc */
  root: TraceabilityNode;
  /** Quyết định giữ node server (vd: liên kết đã bị gỡ trong lúc sửa). Không áp cho node gốc */
  isNodeActive?: (node: TraceabilityNode) => boolean;
  /** Node phía client (liên kết đang thêm khi sửa); bỏ qua nếu id đã có */
  overlayNodes?: TraceabilityNode[];
  /** Cạnh phía client; bỏ qua nếu cặp node đã có cạnh (cạnh server được ưu tiên) */
  overlayEdges?: TraceabilityEdge[];
  /** Giá trị chứng từ gốc để tính tỷ lệ cấn trừ; mặc định lấy từ server hoặc node gốc */
  totalAmount?: number;
  /** Bỏ node có `depth` lớn hơn giá trị này (vd: 1 = chỉ liên kết trực tiếp) */
  maxDepth?: number;
}

/** Khóa cạnh không phân biệt chiều: hai cạnh cùng cặp node được coi là một */
const pairKey = (a: string, b: string): string =>
  a < b ? `${a}|${b}` : `${b}|${a}`;

/** Id các node nối được tới node gốc (duyệt vô hướng) */
function collectReachable(
  rootId: string,
  nodeIds: Set<string>,
  edges: TraceabilityEdge[],
): Set<string> {
  const adjacency = new Map<string, string[]>();
  edges.forEach((edge) => {
    adjacency.set(edge.source, [
      ...(adjacency.get(edge.source) ?? []),
      edge.target,
    ]);
    adjacency.set(edge.target, [
      ...(adjacency.get(edge.target) ?? []),
      edge.source,
    ]);
  });
  const reachable = new Set<string>([rootId]);
  const queue = [rootId];
  while (queue.length > 0) {
    const current = queue.shift() as string;
    (adjacency.get(current) ?? []).forEach((next) => {
      if (nodeIds.has(next) && !reachable.has(next)) {
        reachable.add(next);
        queue.push(next);
      }
    });
  }
  return reachable;
}

function buildSummary(
  rootId: string,
  nodes: TraceabilityNode[],
  edges: TraceabilityEdge[],
  totalAmount: number,
): TraceabilitySummary {
  const linked = nodes.filter((node) => node.id !== rootId);
  const directCount = linked.filter((node) => node.depth === 1).length;
  const totalNetOffAmount = edges
    .filter((edge) => edge.relationType === "NET_OFF")
    .reduce((sum, edge) => sum + Number(edge.amount || 0), 0);
  return {
    totalAmount,
    totalNetOffAmount,
    matchRatio:
      totalAmount > 0
        ? Math.min(100, Math.round((totalNetOffAmount / totalAmount) * 100))
        : 0,
    directCount,
    transitiveCount: linked.length - directCount,
  };
}

/**
 * Gộp đồ thị server với thay đổi phía client (đang sửa) thành một đồ thị duy nhất:
 * bỏ node không còn hiệu lực, thêm node/cạnh client không trùng, loại node không nối được
 * tới node gốc và tính lại số liệu tổng. Hàm thuần, không đổi dữ liệu đầu vào.
 */
export function mergeTraceabilityGraph(
  input: MergeTraceabilityGraphInput,
): TraceabilityGraphData {
  const { server, root, isNodeActive, maxDepth } = input;
  const nodes = new Map<string, TraceabilityNode>();
  const rootNode = server?.nodes.find((n) => n.id === root.id) ?? root;
  nodes.set(rootNode.id, rootNode);

  (server?.nodes ?? []).forEach((node) => {
    if (node.id === root.id) return;
    if (maxDepth !== undefined && node.depth > maxDepth) return;
    if (isNodeActive && !isNodeActive(node)) return;
    nodes.set(node.id, node);
  });
  (input.overlayNodes ?? []).forEach((node) => {
    if (!nodes.has(node.id)) nodes.set(node.id, node);
  });

  const edgesById = new Map<string, TraceabilityEdge>();
  const pairs = new Set<string>();
  (server?.edges ?? []).forEach((edge) => {
    if (!nodes.has(edge.source) || !nodes.has(edge.target)) return;
    edgesById.set(edge.id, edge);
    pairs.add(pairKey(edge.source, edge.target));
  });
  (input.overlayEdges ?? []).forEach((edge) => {
    if (!nodes.has(edge.source) || !nodes.has(edge.target)) return;
    const key = pairKey(edge.source, edge.target);
    if (edgesById.has(edge.id) || pairs.has(key)) return;
    edgesById.set(edge.id, edge);
    pairs.add(key);
  });

  const reachable = collectReachable(
    root.id,
    new Set(nodes.keys()),
    Array.from(edgesById.values()),
  );
  const keptNodes = Array.from(nodes.values()).filter((node) =>
    reachable.has(node.id),
  );
  const keptEdges = Array.from(edgesById.values()).filter(
    (edge) => reachable.has(edge.source) && reachable.has(edge.target),
  );

  const totalAmount =
    input.totalAmount ?? server?.summary?.totalAmount ?? rootNode.amount ?? 0;
  return {
    rootId: root.id,
    rootType: root.docType,
    nodes: keptNodes,
    edges: keptEdges,
    summary: buildSummary(root.id, keptNodes, keptEdges, Number(totalAmount)),
  };
}
