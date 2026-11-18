import type React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  reconnectEdge,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type Connection,
  type Node,
} from "@xyflow/react";
import type {
  TraceabilityGraphData,
  TraceabilityLayoutDirection,
  TraceabilityNodeType,
} from "../../types/traceability.type";
import type {
  TraceabilityCanvasActions,
  TraceFlowEdge,
} from "../../types/traceability.flow.type";
import {
  applySelectionToLayout,
  computeBaseTraceabilityLayout,
} from "../../utils/traceability.layout";

/**
 * Bọc các callback của cha bằng hàm có tham chiếu ổn định: layout không tính lại
 * khi cha render lại với callback mới, chỉ đổi khi cha thêm/bớt một hành động.
 */
export function useStableCanvasActions(
  actions: TraceabilityCanvasActions,
): TraceabilityCanvasActions {
  const latest = useRef(actions);
  useEffect(() => {
    latest.current = actions;
  });

  const hasAddLink = Boolean(actions.onAddLink);
  const hasUnlink = Boolean(actions.onUnlinkNode);
  const hasOpen = Boolean(actions.onOpenDocument);
  const hasEditManual = Boolean(actions.onEditManualSettlement);

  return useMemo(
    () => ({
      onAddLink: hasAddLink
        ? (...args) => latest.current.onAddLink?.(...args)
        : undefined,
      onUnlinkNode: hasUnlink
        ? (node) => latest.current.onUnlinkNode?.(node)
        : undefined,
      onOpenDocument: hasOpen
        ? (node) => latest.current.onOpenDocument?.(node)
        : undefined,
      onEditManualSettlement: hasEditManual
        ? (node) => latest.current.onEditManualSettlement?.(node)
        : undefined,
    }),
    [hasAddLink, hasUnlink, hasOpen, hasEditManual],
  );
}

export interface UseTraceabilityCanvasOptions {
  graph: TraceabilityGraphData;
  direction: TraceabilityLayoutDirection;
  allowEdit: boolean;
  allowedDocTypes?: TraceabilityNodeType[];
  isFullscreen: boolean;
  actions: TraceabilityCanvasActions;
}

/** Trạng thái canvas: layout, chọn node, căn lại khung nhìn và nối lại cạnh */
export function useTraceabilityCanvas({
  graph,
  direction,
  allowEdit,
  allowedDocTypes,
  isFullscreen,
  actions,
}: UseTraceabilityCanvasOptions) {
  const stableActions = useStableCanvasActions(actions);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const { fitView } = useReactFlow();

  // Khóa chuỗi để mảng loại chứng từ tạo bởi cha (mỗi lần render một tham chiếu mới) không làm layout tính lại
  const allowedKey = allowedDocTypes?.join(",") ?? "";

  // 1. Tầng hình học (Base Layout): chỉ tính toán tọa độ khi đồ thị, hướng hoặc quyền sửa thay đổi
  const baseLayout = useMemo(
    () =>
      computeBaseTraceabilityLayout({
        graph,
        direction,
        allowEdit,
        allowedDocTypes: allowedKey
          ? (allowedKey.split(",") as TraceabilityNodeType[])
          : undefined,
        actions: stableActions,
      }),
    [graph, direction, allowEdit, allowedKey, stableActions],
  );

  // 2. Tầng chọn (Selection State): cập nhật cờ selected/animated tức thì trong O(N) mà không tính lại Barycenter
  const layout = useMemo(
    () => applySelectionToLayout(baseLayout, graph, selectedNodeId),
    [baseLayout, graph, selectedNodeId],
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(layout.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layout.edges);

  useEffect(() => {
    setNodes(layout.nodes);
    setEdges(layout.edges);
  }, [layout, setNodes, setEdges]);

  // Căn khung nhìn khi đổi đồ thị, hướng bố cục, hoặc chuyển toàn màn hình
  useEffect(() => {
    const timer = setTimeout(
      () => fitView({ duration: 400, padding: 0.2 }),
      60,
    );
    return () => clearTimeout(timer);
  }, [graph.rootId, direction, fitView]);

  useEffect(() => {
    const timer = setTimeout(
      () => fitView({ duration: 350, padding: 0.2 }),
      120,
    );
    return () => clearTimeout(timer);
  }, [isFullscreen, fitView]);

  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    if (node.type === "stageGroupNode") return;
    setSelectedNodeId((prev) => (prev === node.id ? null : node.id));
  }, []);

  const onPaneClick = useCallback(() => setSelectedNodeId(null), []);

  const onReconnect = useCallback(
    (oldEdge: TraceFlowEdge, connection: Connection) => {
      setEdges((current) =>
        reconnectEdge<TraceFlowEdge>(oldEdge, connection, current),
      );
    },
    [setEdges],
  );

  return {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onNodeClick,
    onPaneClick,
    onReconnect,
  };
}
