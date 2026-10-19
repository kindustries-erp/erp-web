/** Đối tượng đang được làm nổi bật: một luồng tự động, một thẻ, hoặc không có gì. */
export type WorkflowFocus =
  | { kind: "flow"; id: string }
  | { kind: "node"; id: string }
  | null;

export interface FocusEdge {
  id: string;
  source: string;
  target: string;
  flows?: string[];
}

export interface FocusResult {
  /** Thẻ được giữ sáng; `null` khi không làm nổi bật gì (không thẻ nào mờ). */
  litNodes: Set<string> | null;
  /** Mũi tên được giữ sáng; `null` khi không làm nổi bật gì. */
  litEdges: Set<string> | null;
  /** Mũi tên chạy animation (luôn là tập con của `litEdges`). */
  animatedEdges: Set<string>;
}

const NO_FOCUS: FocusResult = {
  litNodes: null,
  litEdges: null,
  animatedEdges: new Set(),
};

/**
 * Tính tập thẻ và mũi tên được làm nổi bật trên các mũi tên đang hiển thị:
 * - chọn luồng: mũi tên thuộc luồng và hai đầu của chúng;
 * - chọn thẻ: thẻ đó, các thẻ nối trực tiếp (hai chiều) và mọi mũi tên chạm thẻ đó.
 */
export function computeFocus(
  edges: FocusEdge[],
  focus: WorkflowFocus,
): FocusResult {
  if (!focus) return NO_FOCUS;

  const litNodes = new Set<string>();
  const litEdges = new Set<string>();

  if (focus.kind === "node") litNodes.add(focus.id);

  edges.forEach((edge) => {
    const related =
      focus.kind === "flow"
        ? Boolean(edge.flows?.includes(focus.id))
        : edge.source === focus.id || edge.target === focus.id;
    if (!related) return;
    litEdges.add(edge.id);
    litNodes.add(edge.source);
    litNodes.add(edge.target);
  });

  return { litNodes, litEdges, animatedEdges: new Set(litEdges) };
}

export const isNodeDimmed = (result: FocusResult, nodeId: string): boolean =>
  result.litNodes !== null && !result.litNodes.has(nodeId);

export const isEdgeDimmed = (result: FocusResult, edgeId: string): boolean =>
  result.litEdges !== null && !result.litEdges.has(edgeId);
