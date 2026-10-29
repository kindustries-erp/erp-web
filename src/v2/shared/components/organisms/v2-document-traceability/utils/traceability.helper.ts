import { TRACEABILITY_STAGES } from "../constants/traceability.constants";
import type {
  TraceabilityGraphData,
  TraceabilityNodeType,
  TraceabilityStageConfig,
} from "../types/traceability.type";

/** Giai đoạn chứa loại chứng từ; mặc định là giai đoạn đầu nếu không khớp */
export function getStageForDocType(
  docType: TraceabilityNodeType,
): TraceabilityStageConfig {
  return (
    TRACEABILITY_STAGES.find((stage) => stage.types.includes(docType)) ??
    TRACEABILITY_STAGES[0]
  );
}

/** Số chứng từ liên kết (không tính node gốc) */
export function countLinkedNodes(graph: TraceabilityGraphData): number {
  return Math.max(0, graph.nodes.length - 1);
}

/** Loại chứng từ mặc định cho nút ghép nối khi không truyền allowedDocTypes (khớp V1) */
export const DEFAULT_SELECTABLE_DOC_TYPES: TraceabilityNodeType[] = [
  "BANK_TXN",
  "PURCHASE_ORDER",
  "SALES_ORDER",
  "GARAGE_CASE",
  "GOODS_RECEIPT",
  "GOODS_ISSUE",
];

/** Loại chứng từ được phép ghép nối: allowedDocTypes nếu có, ngược lại dùng danh sách mặc định */
export function getSelectableDocTypes(
  allowedDocTypes?: TraceabilityNodeType[],
): TraceabilityNodeType[] {
  return allowedDocTypes?.length
    ? allowedDocTypes
    : DEFAULT_SELECTABLE_DOC_TYPES;
}

/**
 * Gỡ một node khỏi đồ thị (cập nhật lạc quan khi đang edit): bỏ node, các cạnh nối vào nó,
 * và trừ số liệu tổng. Không đổi đồ thị gốc.
 */
export function removeNodeFromGraph(
  graph: TraceabilityGraphData,
  nodeId: string,
): TraceabilityGraphData {
  const removed = graph.nodes.find((node) => node.id === nodeId);
  const removedAmount = Number(removed?.netOffAmount || removed?.amount || 0);
  const summary = graph.summary;
  return {
    ...graph,
    nodes: graph.nodes.filter((node) => node.id !== nodeId),
    edges: graph.edges.filter(
      (edge) => edge.source !== nodeId && edge.target !== nodeId,
    ),
    summary: {
      ...summary,
      directCount: Math.max(0, (summary?.directCount || 1) - 1),
      totalNetOffAmount: Math.max(
        0,
        (summary?.totalNetOffAmount || 0) - removedAmount,
      ),
    },
  };
}
