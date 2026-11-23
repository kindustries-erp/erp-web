import { useCallback, useEffect, useMemo, useState } from "react";
import {
  useNodesInitialized,
  useReactFlow,
  type NodeMouseHandler,
} from "@xyflow/react";

import { buildCanvasEdges, buildCanvasRouting } from "./canvasEdges";
import { buildCanvasNodes } from "./canvasNodes";
import { computeFocus, type WorkflowFocus } from "./workflowFocus";
import type { WorkflowCanvasDefinition } from "./workflowTypes";

function sameHeights(
  a: Record<string, number>,
  b: Record<string, number>,
): boolean {
  const keys = Object.keys(b);
  return (
    keys.length === Object.keys(a).length &&
    keys.every((key) => a[key] === b[key])
  );
}

interface FocusState {
  canvasId: string;
  focus: WorkflowFocus;
}

interface UseWorkflowGraphInput {
  canvas: WorkflowCanvasDefinition;
  t: (key: string, fallback: string) => string;
  showRead: boolean;
  exportMode: boolean;
}

/** Trạng thái và dữ liệu xyflow của một sơ đồ: làm nổi bật, node, mũi tên, định tuyến và xử lý click. */
export function useWorkflowGraph({
  canvas,
  t,
  showRead,
  exportMode,
}: UseWorkflowGraphInput) {
  const { getNodes } = useReactFlow();
  const nodesInitialized = useNodesInitialized();
  const [measuredHeights, setMeasuredHeights] = useState<
    Record<string, number>
  >({});
  // Trạng thái làm nổi bật gắn với id sơ đồ: đổi sơ đồ thì tự coi như chưa chọn gì.
  const [focusState, setFocusState] = useState<FocusState>({
    canvasId: canvas.id,
    focus: null,
  });
  const focus = focusState.canvasId === canvas.id ? focusState.focus : null;
  const updateFocus = useCallback(
    (next: WorkflowFocus) =>
      setFocusState({ canvasId: canvas.id, focus: next }),
    [canvas.id],
  );

  // Thẻ đang hiển thị (lớp đọc chỉ hiện khi bật).
  const visibleNodes = useMemo(
    () => canvas.nodes.filter((node) => showRead || node.layer !== "read"),
    [canvas, showRead],
  );

  const visibleEdges = useMemo(() => {
    const ids = new Set(visibleNodes.map((node) => node.id));
    return canvas.edges.filter(
      (edge) =>
        (showRead || edge.kind !== "read") &&
        ids.has(edge.source) &&
        ids.has(edge.target),
    );
  }, [canvas, showRead, visibleNodes]);

  const focusResult = useMemo(
    () => computeFocus(visibleEdges, focus),
    [visibleEdges, focus],
  );

  const cardTexts = useMemo(
    () =>
      new Map(
        visibleNodes.map((node) => [
          node.id,
          {
            title: t(node.title.key, node.title.fallback),
            badges: (node.badges ?? []).map((badge) =>
              t(badge.key, badge.fallback),
            ),
          },
        ]),
      ),
    [visibleNodes, t],
  );

  const nodes = useMemo(
    () =>
      buildCanvasNodes({
        canvas,
        t,
        showRead,
        exportMode,
        visibleNodes,
        cardTexts,
        focusResult,
        focus,
      }),
    [
      canvas,
      exportMode,
      showRead,
      t,
      visibleNodes,
      cardTexts,
      focusResult,
      focus,
    ],
  );

  // Sau khi xyflow đo xong, lấy chiều cao thật của thẻ để mũi tên chạm đúng tâm cạnh.
  useEffect(() => {
    if (!nodesInitialized) return;
    const next: Record<string, number> = {};
    getNodes().forEach((node) => {
      if (node.type === "workflow-card" && node.measured?.height)
        next[node.id] = node.measured.height;
    });
    setMeasuredHeights((prev) => (sameHeights(prev, next) ? prev : next));
  }, [nodesInitialized, getNodes, nodes]);

  const routing = useMemo(
    () =>
      buildCanvasRouting({
        canvas,
        t,
        showRead,
        visibleNodes,
        visibleEdges,
        cardTexts,
        measuredHeights,
      }),
    [
      canvas,
      showRead,
      t,
      visibleNodes,
      visibleEdges,
      cardTexts,
      measuredHeights,
    ],
  );

  const edges = useMemo(
    () =>
      buildCanvasEdges({
        canvas,
        t,
        routing,
        visibleEdges,
        focus,
        focusResult,
      }),
    [canvas, routing, visibleEdges, focus, focusResult, t],
  );

  const handleNodeClick = useCallback<NodeMouseHandler>(
    (_, node) => {
      if (node.type !== "workflow-card") return;
      // Bấm lại đúng thẻ đang chọn thì bỏ chọn.
      setFocusState((prev) => {
        const current = prev.canvasId === canvas.id ? prev.focus : null;
        const same = current?.kind === "node" && current.id === node.id;
        return {
          canvasId: canvas.id,
          focus: same ? null : { kind: "node", id: node.id },
        };
      });
    },
    [canvas.id],
  );

  const handlePaneClick = useCallback(() => updateFocus(null), [updateFocus]);

  return {
    focus,
    updateFocus,
    nodes,
    edges,
    handleNodeClick,
    handlePaneClick,
  };
}
