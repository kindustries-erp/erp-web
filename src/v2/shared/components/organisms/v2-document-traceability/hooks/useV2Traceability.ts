import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useV2TraceabilityGraphQuery } from "./useV2TraceabilityGraphQuery";
import { removeNodeFromGraph } from "../utils/traceability.helper";
import type {
  TraceabilityGraphData,
  TraceabilityLayoutDirection,
  TraceabilityNode,
  TraceabilityViewMode,
} from "../types/traceability.type";

export interface UseV2TraceabilityOptions {
  rootId: string;
  fetchGraph?: (id: string) => Promise<TraceabilityGraphData>;
  /** Đồ thị do cha quản lý (cập nhật lạc quan từ ngoài); khi có thì không tự tải */
  graphData?: TraceabilityGraphData | null;
  editMode?: boolean;
  onUnlinkNode?: (node: TraceabilityNode) => Promise<void> | void;
}

const NO_IDS: string[] = [];

interface OptimisticRemoval {
  rootId: string;
  nodeIds: string[];
}

/** State và luồng gỡ liên kết của sơ đồ chứng từ V2 (không chứa JSX hay chuỗi hiển thị) */
export function useV2Traceability({
  rootId,
  fetchGraph,
  graphData,
  editMode = false,
  onUnlinkNode,
}: UseV2TraceabilityOptions) {
  const controlled = graphData !== undefined;
  const query = useV2TraceabilityGraphQuery({
    rootId,
    fetchGraph,
    enabled: !controlled,
  });

  const [viewMode, setViewMode] = useState<TraceabilityViewMode>("canvas");
  const [direction, setDirection] =
    useState<TraceabilityLayoutDirection>("horizontal");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [linkSelectorOpen, setLinkSelectorOpen] = useState(false);
  const [unlinkingNode, setUnlinkingNode] = useState<TraceabilityNode | null>(
    null,
  );
  const [unlinkingLoading, setUnlinkingLoading] = useState(false);
  const [removal, setRemoval] = useState<OptimisticRemoval>({
    rootId,
    nodeIds: [],
  });

  // Refetch đúng một lần khi thoát edit mode (chuyển true → false), không gọi lúc mount
  const wasEditMode = useRef(editMode);
  useEffect(() => {
    const exitedEditMode = wasEditMode.current && !editMode;
    wasEditMode.current = editMode;
    if (exitedEditMode && !controlled) query.refetch();
  }, [editMode, controlled, query]);

  // Escape thoát chế độ toàn màn hình
  useEffect(() => {
    if (!isFullscreen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsFullscreen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen]);

  const serverGraph = controlled ? graphData : (query.data ?? null);
  const hiddenIds = removal.rootId === rootId ? removal.nodeIds : NO_IDS;

  const graph = useMemo(() => {
    if (!serverGraph) return null;
    return hiddenIds.reduce(removeNodeFromGraph, serverGraph);
  }, [serverGraph, hiddenIds]);

  const requestUnlink = useCallback((node: TraceabilityNode) => {
    setUnlinkingNode(node);
  }, []);

  const cancelUnlink = useCallback(() => setUnlinkingNode(null), []);

  const confirmUnlink = useCallback(async () => {
    if (!unlinkingNode || !onUnlinkNode) return;
    setUnlinkingLoading(true);
    try {
      await onUnlinkNode(unlinkingNode);
      const unlinkedId = unlinkingNode.id;
      setUnlinkingNode(null);
      if (controlled) return;
      if (editMode) {
        setRemoval((prev) => ({
          rootId,
          nodeIds: [
            ...(prev.rootId === rootId ? prev.nodeIds : []),
            unlinkedId,
          ],
        }));
      } else {
        await query.refetch();
      }
    } finally {
      setUnlinkingLoading(false);
    }
  }, [unlinkingNode, onUnlinkNode, controlled, editMode, rootId, query]);

  return {
    graph,
    loading: !controlled && query.isPending,
    error: controlled ? null : (query.error as Error | null),
    viewMode,
    setViewMode,
    direction,
    toggleDirection: () =>
      setDirection((d) => (d === "horizontal" ? "vertical" : "horizontal")),
    isFullscreen,
    toggleFullscreen: () => setIsFullscreen((f) => !f),
    linkSelectorOpen,
    setLinkSelectorOpen,
    unlinkingNode,
    unlinkingLoading,
    requestUnlink,
    cancelUnlink,
    confirmUnlink,
    reload: () => query.refetch(),
  };
}
