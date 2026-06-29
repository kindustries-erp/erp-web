import React, { useState, useMemo, useEffect } from "react";
import { Network, List, Loader2, ExternalLink } from "lucide-react";
import { DrawerModal } from "@/shared/components/DrawerModal";
import { StandardTable } from "@/shared/components/StandardTable";
import { type DataTableColumn } from "@/shared/components/DataTable";
import { useTagConnections } from "../hooks/useTags";
import { format } from "date-fns";
import { useAppStore } from "@/core/config/appStore";
import {
  ReactFlow,
  Background,
  Controls,
  Handle,
  Position,
  useNodesState,
  useEdgesState,
  useReactFlow,
  type Node,
  type Edge,
  type NodeTypes,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { cn } from "@/shared/utils";
import type { PageKey } from "@/shared/types";

// ─── Reusable Node UI (Adapted from ConnectionGraphDrawer) ─────────────

const NODE_CONFIG: Record<
  string,
  {
    accentClass: string;
    borderClass: string;
    solidBorder: string;
    iconLabel: string;
  }
> = {
  erp_purchase_order: {
    accentClass:
      "bg-blue-50/80 text-blue-700 font-bold dark:bg-blue-900/30 dark:text-blue-300",
    borderClass: "border-blue-100 dark:border-blue-800/50",
    solidBorder: "border-l-blue-500",
    iconLabel: "PO",
  },
  erp_sales_order: {
    accentClass:
      "bg-indigo-50/80 text-indigo-700 font-bold dark:bg-indigo-900/30 dark:text-indigo-300",
    borderClass: "border-indigo-100 dark:border-indigo-800/50",
    solidBorder: "border-l-indigo-500",
    iconLabel: "SO",
  },
  erp_invoice: {
    accentClass:
      "bg-amber-50/80 text-amber-700 font-bold dark:bg-amber-900/30 dark:text-amber-300",
    borderClass: "border-amber-100 dark:border-amber-800/50",
    solidBorder: "border-l-amber-500",
    iconLabel: "HĐ",
  },
  tag: {
    accentClass:
      "bg-slate-50/80 text-slate-700 font-bold dark:bg-slate-800/50 dark:text-slate-300",
    borderClass: "border-slate-200 dark:border-slate-700",
    solidBorder: "border-l-slate-500",
    iconLabel: "TAG",
  },
};

// Define the connection interface locally if not exported
interface TagConnection {
  entityId: string;
  entityType: string;
  displayCode: string;
  entityDate?: string | null;
  entityStatus?: string | null;
  meta?: {
    partnerName?: string;
    totalAmount?: number;
    [key: string]: unknown;
  };
}

interface TagGraphNodeData extends Record<string, unknown> {
  nodeType: string;
  label: string;
  sublabel?: string;
  status?: string;
  onClick?: () => void;
}

function GraphNode({ data }: NodeProps<Node<TagGraphNodeData>>) {
  const cfg = NODE_CONFIG[data.nodeType] ?? NODE_CONFIG.tag;
  const isCompleted = data.status === "POSTED" || data.status === "COMPLETED";

  return (
    <div
      className={cn(
        "w-[260px] rounded-xl border border-[color:var(--border)] bg-white dark:bg-slate-900 overflow-hidden flex flex-col relative group transition-all duration-300 cursor-pointer shadow-md hover:shadow-lg",
        "border-l-[6px]",
        cfg.solidBorder,
      )}
      onClick={data.onClick}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="w-2 h-2 opacity-0"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-2 h-2 opacity-0"
      />

      <div
        className={cn(
          "px-4 py-2.5 text-sm tracking-tight font-extrabold truncate border-b",
          cfg.accentClass,
          cfg.borderClass,
        )}
      >
        {data.label}
      </div>

      <div className="p-4 flex flex-col">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[color:var(--muted-fg)]">
            <div
              className={cn(
                "px-2 py-0.5 rounded text-[10px] uppercase font-black shadow-sm border",
                cfg.accentClass,
                cfg.borderClass,
              )}
            >
              {cfg.iconLabel}
            </div>
            <span className="text-xs font-medium truncate max-w-[120px]">
              {data.sublabel}
            </span>
          </div>
          {data.nodeType !== "tag" && (
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          )}
        </div>

        {data.status && (
          <div className="flex items-center justify-end mt-4">
            <span
              className={cn(
                "text-[10px] font-black px-2 py-1 rounded uppercase shadow-sm",
                isCompleted
                  ? "bg-emerald-500 text-white"
                  : "bg-amber-400 text-amber-950",
              )}
            >
              {data.status}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

const NODE_TYPES: NodeTypes = { graphNode: GraphNode };

function LayoutFitter() {
  const { fitView } = useReactFlow();
  useEffect(() => {
    const t = setTimeout(() => fitView({ duration: 600, padding: 0.3 }), 100);
    return () => clearTimeout(t);
  }, [fitView]);
  return null;
}

// ─── Main Component ────────────────────────────────────────────────────────────

export interface TagConnectionsDrawerProps {
  open: boolean;
  onClose: () => void;
  tagId: string;
  tagName: string;
  tagColor?: string | null;
}

export function TagConnectionsDrawer({
  open,
  onClose,
  tagId,
  tagName,
  tagColor,
}: TagConnectionsDrawerProps) {
  const [viewMode, setViewMode] = useState<"canvas" | "table">("canvas");
  const { data: connections = [], isLoading } = useTagConnections(tagId);

  const preloadTab = useAppStore((s) => s.preloadTab);

  // Navigate function
  const navigateToDoc = (type: string, id: string) => {
    let page = "";
    if (type === "erp_purchase_order") page = "purchasing";
    if (type === "erp_sales_order") page = "erp-sales-orders";
    if (type === "erp_invoice") page = "erp-invoices";

    if (page) {
      preloadTab(page as PageKey);

      // Allow DOM to mount the hidden tab before dispatching event
      setTimeout(() => {
        window.dispatchEvent(
          new CustomEvent("open_erp_document", { detail: { type, id } }),
        );
      }, 50);
    }
  };

  // Table columns
  const columns = useMemo<DataTableColumn<TagConnection>[]>(
    () => [
      {
        key: "displayCode",
        header: "Mã chứng từ",
        cell: (row) => (
          <span
            className="text-blue-600 dark:text-blue-400 font-medium cursor-pointer hover:underline"
            onClick={() => navigateToDoc(row.entityType, row.entityId)}
          >
            {row.displayCode}
          </span>
        ),
      },
      {
        key: "entityType",
        header: "Loại chứng từ",
        cell: (row) => (
          <span className="text-[color:var(--secondary-text)] text-sm">
            {row.entityType === "erp_purchase_order"
              ? "Đơn mua hàng"
              : row.entityType === "erp_sales_order"
                ? "Đơn bán hàng"
                : row.entityType === "erp_invoice"
                  ? "Hóa đơn"
                  : row.entityType}
          </span>
        ),
      },
      {
        key: "partnerName",
        header: "Đối tác",
        cell: (row) => (
          <span className="text-sm">{row.meta?.partnerName || "-"}</span>
        ),
      },
      {
        key: "entityStatus",
        header: "Trạng thái",
        cell: (row) => (
          <span className="text-xs font-bold px-2 py-1 rounded bg-slate-100 dark:bg-slate-800">
            {row.entityStatus}
          </span>
        ),
      },
      {
        key: "amount",
        header: "Giá trị / Số lượng",
        cell: (row) => (
          <span className="text-sm font-medium">
            {row.meta?.totalAmount != null
              ? new Intl.NumberFormat("vi-VN").format(row.meta.totalAmount)
              : "-"}
          </span>
        ),
      },
      {
        key: "entityDate",
        header: "Ngày tạo",
        cell: (row) => (
          <span className="text-[color:var(--secondary-text)] text-sm">
            {row.entityDate
              ? format(new Date(row.entityDate), "dd/MM/yyyy HH:mm")
              : "-"}
          </span>
        ),
      },
    ],
    [],
  );

  // Canvas Nodes
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  useEffect(() => {
    if (!open) return;

    // Build Tag Node (Center)
    const newNodes: Node[] = [
      {
        id: "tag-root",
        type: "graphNode",
        position: { x: 0, y: Math.max(0, (connections.length - 1) * 75) },
        data: {
          label: tagName,
          sublabel: "Thẻ nhãn",
          nodeType: "tag",
        },
      },
    ];

    const newEdges: Edge[] = [];

    connections.forEach((connItem, idx) => {
      const conn = connItem as unknown as TagConnection;
      newNodes.push({
        id: conn.entityId,
        type: "graphNode",
        position: { x: 400, y: idx * 150 },
        data: {
          label: conn.displayCode,
          sublabel: conn.entityDate
            ? format(new Date(conn.entityDate), "dd/MM/yyyy")
            : "",
          nodeType: conn.entityType,
          status: conn.entityStatus,
          onClick: () => navigateToDoc(conn.entityType, conn.entityId),
        },
      });
      newEdges.push({
        id: `e-tag-${conn.entityId}`,
        source: "tag-root",
        target: conn.entityId,
        animated: true,
        style: { strokeWidth: 2, stroke: tagColor || "#94a3b8" },
      });
    });

    setNodes(newNodes);
    setEdges(newEdges);
  }, [connections, tagName, tagColor, open]);

  return (
    <DrawerModal
      open={open}
      onClose={onClose}
      icon={<Network className="h-4 w-4" />}
      title={`Liên kết thẻ: ${tagName}`}
      subtitle={`${connections.length} chứng từ`}
      panelClassName="min-[1024px]:w-[80vw] min-[1024px]:max-w-[1200px] flex flex-col"
      bodyClassName="p-0 flex-1 flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-950"
    >
      <div className="flex items-center gap-2 p-3 border-b bg-white dark:bg-slate-900 shadow-sm z-10 relative">
        <button
          onClick={() => setViewMode("canvas")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
            viewMode === "canvas"
              ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
              : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800",
          )}
        >
          <Network className="w-4 h-4" /> Lược đồ (Canvas)
        </button>
        <button
          onClick={() => setViewMode("table")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
            viewMode === "table"
              ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
              : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800",
          )}
        >
          <List className="w-4 h-4" /> Danh sách (Table)
        </button>
      </div>

      <div className="flex-1 relative overflow-hidden">
        {isLoading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            <span>Đang tải liên kết...</span>
          </div>
        ) : connections.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 gap-2">
            <Network className="w-10 h-10 opacity-20" />
            <span>Thẻ này chưa được liên kết với chứng từ nào</span>
          </div>
        ) : viewMode === "table" ? (
          <div className="p-4 h-full overflow-y-auto">
            <StandardTable
              columns={columns}
              items={connections as unknown as TagConnection[]}
              getRowKey={(item: TagConnection) => item.entityId}
              loading={false}
            />
          </div>
        ) : (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={NODE_TYPES}
            fitView
            minZoom={0.1}
            maxZoom={1.5}
            nodesDraggable
            nodesConnectable={false}
            proOptions={{ hideAttribution: true }}
          >
            <LayoutFitter />
            <Background color="var(--border)" gap={20} size={1} />
            <Controls className="!border-slate-200 dark:!border-slate-800 !bg-white dark:!bg-slate-900 !rounded-lg overflow-hidden shadow-md" />
          </ReactFlow>
        )}
      </div>
    </DrawerModal>
  );
}
