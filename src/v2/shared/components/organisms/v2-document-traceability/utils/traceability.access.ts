import type {
  TraceabilityGraphData,
  TraceabilityNode,
} from "../types/traceability.type";
import { isManualSettlementNode } from "./traceability.visual";

/**
 * Mở được chi tiết chứng từ: có quyền, không bị hạn chế, không phải sổ kế toán;
 * giao dịch nhập tay chỉ mở để sửa khi đang ở chế độ sửa.
 */
export function canOpenTraceNode(
  node: TraceabilityNode,
  allowEdit: boolean,
): boolean {
  if (node.restricted || node.hasPermission === false) return false;
  if (node.docType === "JOURNAL_ENTRY") return false;
  if (isManualSettlementNode(node)) return allowEdit;
  return true;
}

/** Gỡ liên kết chỉ với chứng từ nối trực tiếp (cấp 1), không phải node gốc, khi đang sửa */
export function canUnlinkTraceNode(
  node: TraceabilityNode,
  allowEdit: boolean,
): boolean {
  return allowEdit && !node.isCurrent && !node.restricted && node.depth === 1;
}

/** Tách chứng từ liên kết thành nhóm trực tiếp (cấp 1) và gián tiếp (cấp 2 trở lên), bỏ node gốc */
export function splitLinkedNodes(graph: TraceabilityGraphData): {
  direct: TraceabilityNode[];
  transitive: TraceabilityNode[];
} {
  const linked = graph.nodes.filter((node) => !node.isCurrent);
  return {
    direct: linked.filter((node) => node.depth === 1),
    transitive: linked.filter((node) => node.depth > 1),
  };
}
