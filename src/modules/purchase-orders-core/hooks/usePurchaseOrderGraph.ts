import { useState, useCallback } from "react";
import { Node, Edge } from "@xyflow/react";
import axiosInstance from "@/core/api/axiosInstance";
import { extractApiError } from "@/shared/utils/apiError";
import type { OperationalDocument } from "@/modules/operational/api/operationalApi";

// ─── API types ────────────────────────────────────────────────────────────────

export interface PoConnectionsData {
  purchaseOrder: {
    id: string;
    poNo: string;
    orderDate: string;
    status: string | null;
    paymentStatus: string | null;
    supplierId: string | null;
    supplierName: string | null;
    supplierCode: string | null;
  };
  goodsReceipts: {
    id: string;
    receiptNo: string;
    receiptDate: string;
    status: string | null;
  }[];
  paymentLinks: {
    linkId: string;
    voucherId: string;
    voucherNo: string;
    appliedAmount: number;
    appliedDate: string | null;
    voucherStatus: string;
  }[];
  invoices: {
    id: string;
    invoiceNo: string;
    invoiceDate: string;
    totalAmount: string | null;
    status: string | null;
    direction: string | null;
  }[];
}

// ─── Node data shapes ─────────────────────────────────────────────────────────

export type GraphNodeType =
  | "purchase_order"
  | "goods_receipt"
  | "payment_voucher"
  | "invoice"
  | "supplier"
  | "inventory_item"
  | "goods_issue"
  | "production_order"
  | "bom";

export type GraphLayoutDirection = "horizontal" | "vertical";

export interface GraphNodeData {
  nodeType: GraphNodeType;
  label: string;
  sublabel?: string;
  status?: string;
  amount?: number;
  docId?: string;
  rawDate?: string;
  layout?: GraphLayoutDirection;
  [key: string]: unknown;
}

// ─── Layout constants ─────────────────────────────────────────────────────────

const COL_GAP = 280; // horizontal spacing between columns
const ROW_GAP = 120; // vertical spacing between items in the same column

// ─── Graph builder ────────────────────────────────────────────────────────────

function buildGraph(
  data: PoConnectionsData,
  layout: GraphLayoutDirection,
): {
  nodes: Node<GraphNodeData>[];
  edges: Edge[];
} {
  const nodes: Node<GraphNodeData>[] = [];
  const edges: Edge[] = [];

  const po = data.purchaseOrder;
  const hasSupplierId = !!po.supplierId;

  // ── Lvl 0: Supplier ──────────────────────────────────────────────────────
  if (hasSupplierId) {
    nodes.push({
      id: `supplier-${po.supplierId}`,
      type: "graphNode",
      position: { x: 0, y: 0 },
      data: {
        nodeType: "supplier",
        // supplierName may be null if PO entity is not joined with partner table
        label: po.supplierName ?? "Nhà cung cấp",
        sublabel: po.supplierCode ?? po.supplierId?.slice(0, 8) + "…",
        docId: po.supplierId ?? undefined,
        layout,
      },
    });
  }

  // ── Lvl 1: PO ────────────────────────────────────────────────────────────
  const poX = layout === "horizontal" ? (hasSupplierId ? COL_GAP : 0) : 0;
  const poY = layout === "vertical" ? (hasSupplierId ? ROW_GAP : 0) : 0;
  nodes.push({
    id: `po-${po.id}`,
    type: "graphNode",
    position: { x: poX, y: poY },
    data: {
      nodeType: "purchase_order",
      label: po.poNo || "—",
      sublabel: po.orderDate ? po.orderDate.split("T")[0] : undefined,
      rawDate: po.orderDate,
      status: po.status ?? undefined,
      docId: po.id,
      layout,
    },
  });

  if (hasSupplierId) {
    edges.push({
      id: `e-sup-po`,
      source: `supplier-${po.supplierId}`,
      target: `po-${po.id}`,
      type: "smoothstep",
    });
  }

  // ── Lvl 2: GRs, Payment Vouchers, Invoices ────────────────
  const lvl2X = layout === "horizontal" ? poX + COL_GAP : 0; // if horizontal, shift right; if vertical, same x initially
  const lvl2Y = layout === "vertical" ? poY + ROW_GAP : 0; // if vertical, shift down; if horizontal, same y initially
  const allLvl2Items: Node<GraphNodeData>[] = [];

  data.goodsReceipts.forEach((gr) => {
    allLvl2Items.push({
      id: `gr-${gr.id}`,
      type: "graphNode",
      position: { x: lvl2X, y: lvl2Y },
      data: {
        nodeType: "goods_receipt",
        label: gr.receiptNo,
        sublabel: gr.receiptDate ? gr.receiptDate.split("T")[0] : undefined,
        rawDate: gr.receiptDate,
        status: gr.status ?? undefined,
        docId: gr.id,
        layout,
      },
    });
  });

  // Dedupe payment vouchers (same voucher might appear if linked multiple times)
  const seenVouchers = new Set<string>();
  data.paymentLinks.forEach((link) => {
    if (seenVouchers.has(link.voucherId)) return;
    seenVouchers.add(link.voucherId);
    allLvl2Items.push({
      id: `pv-${link.voucherId}`,
      type: "graphNode",
      position: { x: lvl2X, y: lvl2Y },
      data: {
        nodeType: "payment_voucher",
        label: link.voucherNo,
        sublabel: link.appliedDate ? link.appliedDate.split("T")[0] : undefined,
        rawDate: link.appliedDate ?? undefined,
        status: link.voucherStatus,
        amount: link.appliedAmount,
        docId: link.voucherId,
        layout,
      },
    });
  });

  data.invoices.forEach((inv) => {
    allLvl2Items.push({
      id: `inv-${inv.id}`,
      type: "graphNode",
      position: { x: lvl2X, y: lvl2Y },
      data: {
        nodeType: "invoice",
        label: inv.invoiceNo,
        sublabel: inv.invoiceDate ? inv.invoiceDate.split("T")[0] : undefined,
        rawDate: inv.invoiceDate,
        status: inv.status ?? undefined,
        amount: inv.totalAmount ? Number(inv.totalAmount) : undefined,
        docId: inv.id,
        layout,
      },
    });
  });

  // Center the lvl2 items perpendicularly
  if (layout === "horizontal") {
    const totalHeight = (allLvl2Items.length - 1) * ROW_GAP;
    const startY = -(totalHeight / 2);
    allLvl2Items.forEach((node, idx) => {
      node.position.y = startY + idx * ROW_GAP;
      nodes.push(node);
    });
  } else {
    // Vertical layout: spread horizontally
    const totalWidth = (allLvl2Items.length - 1) * COL_GAP;
    const startX = -(totalWidth / 2);
    allLvl2Items.forEach((node, idx) => {
      node.position.x = startX + idx * COL_GAP;
      nodes.push(node);
    });
  }

  // Edges for lvl2
  allLvl2Items.forEach((node) => {
    const edgeLabel =
      node.data.nodeType === "payment_voucher" && node.data.amount !== undefined
        ? new Intl.NumberFormat("vi-VN").format(node.data.amount)
        : undefined;

    edges.push({
      id: `e-po-${node.id}`,
      source: `po-${po.id}`,
      target: node.id,
      type: "smoothstep",
      animated: node.data.nodeType === "payment_voucher",
      label: edgeLabel,
    });
  });

  return { nodes, edges };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export interface UsePurchaseOrderGraphReturn {
  nodes: Node<GraphNodeData>[];
  edges: Edge[];
  loading: boolean;
  error: string | null;
  layout: GraphLayoutDirection;
  loadGraph: (row: OperationalDocument) => Promise<void>;
  toggleLayout: () => void;
  reset: () => void;
}

export function usePurchaseOrderGraph(): UsePurchaseOrderGraphReturn {
  const [nodes, setNodes] = useState<Node<GraphNodeData>[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [layout, setLayout] = useState<GraphLayoutDirection>("horizontal");
  const [rawData, setRawData] = useState<PoConnectionsData | null>(null);

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
    async (row: OperationalDocument) => {
      setLoading(true);
      setError(null);
      setNodes([]);
      setEdges([]);

      try {
        const { data: resp } = await axiosInstance.get<{
          message: string;
          data: PoConnectionsData;
        }>(`/api/v1/purchase-orders/${row.id}/connections`);

        setRawData(resp.data);
        const { nodes: n, edges: e } = buildGraph(resp.data, layout);
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
