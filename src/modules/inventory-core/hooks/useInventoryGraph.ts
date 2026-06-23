import { useState, useCallback } from "react";
import { Node, Edge } from "@xyflow/react";
import { extractApiError } from "@/shared/utils/apiError";
import { inventoryCoreApi } from "@/modules/inventory-core/api/inventoryCoreApi";
import type {
  GraphLayoutDirection,
  GraphNodeData,
} from "@/modules/purchase-orders-core/hooks/usePurchaseOrderGraph";

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface InventoryConnectionsData {
  item: Record<string, unknown>;
  goodsReceipts: Record<string, unknown>[];
  goodsIssues: Record<string, unknown>[];
  productionOrders: Record<string, unknown>[];
  boms: Record<string, unknown>[];
  graph?: {
    nodes: Node<GraphNodeData>[];
    edges: Edge[];
  };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export interface UseInventoryGraphReturn {
  nodes: Node<GraphNodeData>[];
  edges: Edge[];
  loading: boolean;
  error: string | null;
  layout: GraphLayoutDirection;
  loadGraph: (itemId: string) => Promise<void>;
  toggleLayout: () => void;
  reset: () => void;
}

export function useInventoryGraph(): UseInventoryGraphReturn {
  const [nodes, setNodes] = useState<Node<GraphNodeData>[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [layout, setLayout] = useState<GraphLayoutDirection>("horizontal");
  const [rawData, setRawData] = useState<InventoryConnectionsData | null>(null);

  const reset = useCallback(() => {
    setNodes([]);
    setEdges([]);
    setError(null);
    setRawData(null);
    setLayout("horizontal");
  }, []);

  const toggleLayout = useCallback(() => {
    setLayout((prev) => {
      const next = prev === "horizontal" ? "vertical" : "horizontal";
      if (rawData && rawData.graph) {
        setNodes(rawData.graph.nodes);
        setEdges(rawData.graph.edges);
      }
      return next;
    });
  }, [rawData]);

  const loadGraph = useCallback(
    async (itemId: string) => {
      setLoading(true);
      setError(null);
      setNodes([]);
      setEdges([]);

      try {
        const resp = await inventoryCoreApi.getConnections(itemId);
        setRawData(resp);
        if (resp.graph) {
          setNodes(resp.graph.nodes);
          setEdges(resp.graph.edges);
        }
      } catch (err) {
        setError(extractApiError(err, "Không tải được đồ thị liên kết"));
      } finally {
        setLoading(false);
      }
    },
    [layout],
  );

  return {
    nodes,
    edges,
    loading,
    error,
    layout,
    loadGraph,
    toggleLayout,
    reset,
  };
}
