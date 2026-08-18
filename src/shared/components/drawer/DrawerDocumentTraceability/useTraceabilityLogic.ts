import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import type {
  TraceabilityGraphData,
  TraceabilityNode,
  TraceabilityNodeType,
} from "@/shared/types/traceability";
import type {
  DrawerDocumentTraceabilityProps,
  TraceabilityViewMode,
  CanvasLayoutDirection,
} from "./types";

export function useTraceabilityLogic(props: DrawerDocumentTraceabilityProps) {
  const {
    rootId,
    fetchGraph,
    graphData: controlledGraphData,
    editMode = false,
    allowedDocTypes,
    onUnlinkNode,
  } = props;

  const [viewMode, setViewMode] = useState<TraceabilityViewMode>("canvas");
  const [canvasDirection, setCanvasDirection] =
    useState<CanvasLayoutDirection>("horizontal");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [internalGraphData, setInternalGraphData] =
    useState<TraceabilityGraphData | null>(null);
  const [loading, setLoading] = useState(
    controlledGraphData === undefined && Boolean(rootId && fetchGraph),
  );
  const [error, setError] = useState<string | null>(null);

  const graphData =
    controlledGraphData !== undefined ? controlledGraphData : internalGraphData;

  // Keyboard shortcut to exit fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen]);

  // Link Selector Popover State
  const [linkSelectorOpen, setLinkSelectorOpen] = useState(false);
  const [emptyLinkSelectorOpen, setEmptyLinkSelectorOpen] = useState(false);

  // Unlink Confirm State
  const [unlinkingNode, setUnlinkingNode] = useState<TraceabilityNode | null>(
    null,
  );
  const [unlinkingLoading, setUnlinkingLoading] = useState(false);

  // Strict Edit Mode enforcement: Only enable adding, linking or deleting when in editMode
  const effectiveAllowEdit = Boolean(editMode);

  const fetchGraphRef = useRef(fetchGraph);
  useEffect(() => {
    fetchGraphRef.current = fetchGraph;
  }, [fetchGraph]);

  const loadData = useCallback(
    async (silent = false) => {
      if (
        !rootId ||
        controlledGraphData !== undefined ||
        !fetchGraphRef.current
      )
        return;
      if (!silent) {
        setLoading(!internalGraphData);
      }
      setError(null);
      try {
        const data = await fetchGraphRef.current(rootId);
        setInternalGraphData(data);
      } catch (err: any) {
        setError(err?.message || "Không thể tải đồ thị chứng từ liên đới");
      } finally {
        setLoading(false);
      }
    },
    [rootId, internalGraphData, controlledGraphData],
  );

  useEffect(() => {
    if (controlledGraphData !== undefined) {
      setLoading(false);
      setError(null);
    } else {
      loadData();
    }
  }, [rootId, controlledGraphData]);

  useEffect(() => {
    if (!editMode && controlledGraphData === undefined) {
      loadData(true);
    }
  }, [editMode, controlledGraphData]);

  const handleRequestUnlink = (node: TraceabilityNode) => {
    setUnlinkingNode(node);
  };

  const handleConfirmUnlink = async () => {
    if (!unlinkingNode || !onUnlinkNode) return;
    setUnlinkingLoading(true);
    try {
      await onUnlinkNode(unlinkingNode);
      const unlinkedId = unlinkingNode.id;
      setUnlinkingNode(null);

      if (controlledGraphData === undefined) {
        if (editMode) {
          // In editMode without controlled graph, optimistically update internalGraphData
          setInternalGraphData((prev) => {
            if (!prev) return prev;
            const removedNode = prev.nodes.find((n) => n.id === unlinkedId);
            const removedAmount = Number(
              removedNode?.netOffAmount || removedNode?.amount || 0,
            );
            const filteredNodes = prev.nodes.filter((n) => n.id !== unlinkedId);
            const filteredEdges = prev.edges.filter(
              (e) => e.source !== unlinkedId && e.target !== unlinkedId,
            );
            const newNetOff = Math.max(
              0,
              (prev.summary?.totalNetOffAmount || 0) - removedAmount,
            );
            return {
              ...prev,
              nodes: filteredNodes,
              edges: filteredEdges,
              summary: {
                ...prev.summary,
                directCount: Math.max(0, (prev.summary?.directCount || 1) - 1),
                totalNetOffAmount: newNetOff,
              },
            };
          });
        } else {
          await loadData(true);
        }
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setUnlinkingLoading(false);
    }
  };

  const selectableDocTypes = useMemo(() => {
    if (allowedDocTypes && allowedDocTypes.length > 0) {
      return allowedDocTypes;
    }
    return [
      "BANK_TXN",
      "PURCHASE_ORDER",
      "SALES_ORDER",
      "GARAGE_CASE",
      "GOODS_RECEIPT",
      "GOODS_ISSUE",
    ] as TraceabilityNodeType[];
  }, [allowedDocTypes]);

  const toggleLayoutDirection = () => {
    setCanvasDirection((d) => (d === "horizontal" ? "vertical" : "horizontal"));
  };

  const toggleFullscreen = () => {
    setIsFullscreen((f) => !f);
  };

  return {
    viewMode,
    setViewMode,
    canvasDirection,
    setCanvasDirection,
    toggleLayoutDirection,
    isFullscreen,
    setIsFullscreen,
    toggleFullscreen,
    graphData,
    loading,
    error,
    loadData,
    linkSelectorOpen,
    setLinkSelectorOpen,
    emptyLinkSelectorOpen,
    setEmptyLinkSelectorOpen,
    unlinkingNode,
    setUnlinkingNode,
    unlinkingLoading,
    effectiveAllowEdit,
    selectableDocTypes,
    handleRequestUnlink,
    handleConfirmUnlink,
  };
}
