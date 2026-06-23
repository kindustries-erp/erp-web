import { useState, useCallback } from "react";
import { Node, Edge } from "@xyflow/react";
import { extractApiError } from "@/shared/utils/apiError";
import { inventoryCoreApi } from "@/modules/inventory-core/api/inventoryCoreApi";
import type {
  GraphNodeType,
  GraphLayoutDirection,
  GraphNodeData,
} from "@/modules/purchase-orders-core/hooks/usePurchaseOrderGraph";

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface InventoryConnectionsData {
  item: {
    id: string;
    sku: string;
    itemName: string;
    uom: string;
    itemType: string;
  };
  goodsReceipts: {
    id: string;
    receiptNo: string;
    receiptDate: string;
    status: string | null;
    qty?: string;
  }[];
  goodsIssues: {
    id: string;
    issueNo: string;
    issueDate: string;
    status: string | null;
    qty?: string;
  }[];
  productionOrders: {
    id: string;
    orderNo: string;
    orderDate: string;
    status: string | null;
    role: "FG" | "COMPONENT";
    qty?: string;
  }[];
  boms: {
    id: string;
    bomCode: string;
    bomName: string;
    status: string | null;
    role: "FG" | "COMPONENT";
  }[];
}

// ─── Layout constants ─────────────────────────────────────────────────────────

const COL_GAP = 300;
const ROW_GAP = 120;

// ─── Graph builder ────────────────────────────────────────────────────────────

function buildGraph(
  data: InventoryConnectionsData,
  layout: GraphLayoutDirection,
): {
  nodes: Node<GraphNodeData>[];
  edges: Edge[];
} {
  const nodes: Node<GraphNodeData>[] = [];
  const edges: Edge[] = [];

  const item = data.item;

  // Center node: Inventory Item
  nodes.push({
    id: `item-${item.id}`,
    type: "graphNode",
    position: { x: 0, y: 0 },
    data: {
      nodeType: "inventory_item" as any, // We will update NODE_CONFIG in ConnectionGraphDrawer
      label: item.itemName || item.sku,
      sublabel: item.sku,
      docId: item.id,
      layout,
    },
  });

  const inbounds: Node<GraphNodeData>[] = [];
  const outbounds: Node<GraphNodeData>[] = [];

  // Goods Receipts -> Inbound
  data.goodsReceipts.forEach((gr) => {
    inbounds.push({
      id: `gr-${gr.id}`,
      type: "graphNode",
      position: { x: 0, y: 0 }, // position computed later
      data: {
        nodeType: "goods_receipt",
        label: gr.receiptNo,
        sublabel: gr.receiptDate ? gr.receiptDate.split("T")[0] : undefined,
        status: gr.status || undefined,
        amount: gr.qty ? Number(gr.qty) : undefined,
        docId: gr.id,
        layout,
      },
    });
  });

  // Goods Issues -> Outbound
  data.goodsIssues.forEach((gi) => {
    outbounds.push({
      id: `gi-${gi.id}`,
      type: "graphNode",
      position: { x: 0, y: 0 },
      data: {
        nodeType: "goods_issue" as any, // Add to NODE_CONFIG
        label: gi.issueNo,
        sublabel: gi.issueDate ? gi.issueDate.split("T")[0] : undefined,
        status: gi.status || undefined,
        amount: gi.qty ? Number(gi.qty) : undefined,
        docId: gi.id,
        layout,
      },
    });
  });

  // Production Orders
  data.productionOrders.forEach((po) => {
    const node: Node<GraphNodeData> = {
      id: `po-${po.id}`,
      type: "graphNode",
      position: { x: 0, y: 0 },
      data: {
        nodeType: "production_order" as any, // Add to NODE_CONFIG
        label: po.orderNo,
        sublabel: po.orderDate ? po.orderDate.split("T")[0] : undefined,
        status: po.status || undefined,
        amount: po.qty ? Number(po.qty) : undefined,
        docId: po.id,
        layout,
      },
    };
    if (po.role === "FG") inbounds.push(node);
    else outbounds.push(node);
  });

  // BOMs
  data.boms.forEach((bom) => {
    const node: Node<GraphNodeData> = {
      id: `bom-${bom.id}`,
      type: "graphNode",
      position: { x: 0, y: 0 },
      data: {
        nodeType: "bom" as any, // Add to NODE_CONFIG
        label: bom.bomCode,
        sublabel: bom.bomName,
        status: bom.status || undefined,
        docId: bom.id,
        layout,
      },
    };
    if (bom.role === "FG") inbounds.push(node);
    else outbounds.push(node);
  });

  // Position calculation
  const setPositions = (nodesArr: Node<GraphNodeData>[], colIndex: number) => {
    if (layout === "horizontal") {
      const startY = -((nodesArr.length - 1) * ROW_GAP) / 2;
      nodesArr.forEach((node, idx) => {
        node.position.x = colIndex * COL_GAP;
        node.position.y = startY + idx * ROW_GAP;
      });
    } else {
      // vertical layout
      const startX = -((nodesArr.length - 1) * COL_GAP) / 2;
      nodesArr.forEach((node, idx) => {
        node.position.x = startX + idx * COL_GAP;
        node.position.y = colIndex * ROW_GAP;
      });
    }
  };

  setPositions(inbounds, -1);
  setPositions(outbounds, 1);

  nodes.push(...inbounds, ...outbounds);

  // Edges
  inbounds.forEach((node) => {
    edges.push({
      id: `e-in-${node.id}`,
      source: node.id,
      target: `item-${item.id}`,
      type: "smoothstep",
      animated: true,
    });
  });

  outbounds.forEach((node) => {
    edges.push({
      id: `e-out-${node.id}`,
      source: `item-${item.id}`,
      target: node.id,
      type: "smoothstep",
      animated: true,
    });
  });

  return { nodes, edges };
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
      if (rawData) {
        const { nodes: n, edges: e } = buildGraph(rawData, next);
        setNodes(n);
        setEdges(e);
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
        const { nodes: n, edges: e } = buildGraph(resp, layout);
        setNodes(n);
        setEdges(e);
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
