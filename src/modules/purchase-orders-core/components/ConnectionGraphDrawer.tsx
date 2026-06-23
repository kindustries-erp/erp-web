import { useCallback, useEffect } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  ControlButton,
  MiniMap,
  useNodesState,
  useEdgesState,
  useReactFlow,
  Handle,
  Position,
  type Node,
  type Edge,
  type NodeTypes,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { DrawerModal } from "@/shared/components/DrawerModal";
import { useT } from "@/core/i18n";
import { cn } from "@/shared/utils";
import { Network, Loader2, ArrowRightLeft } from "lucide-react";
import { Tooltip } from "@/core/components/ui/Tooltip";
import { format } from "date-fns";
import type {
  GraphNodeData,
  GraphLayoutDirection,
} from "@/modules/purchase-orders-core/hooks/usePurchaseOrderGraph";

// ─── Node label config per type ───────────────────────────────────────────────

const NODE_CONFIG: Record<
  GraphNodeData["nodeType"],
  { accentClass: string; borderClass: string; iconLabel: string }
> = {
  purchase_order: {
    accentClass:
      "bg-[color:var(--primary)]/10 text-[color:var(--primary)] font-semibold",
    borderClass: "border-[color:var(--primary)]/40",
    iconLabel: "PO",
  },
  goods_receipt: {
    accentClass:
      "bg-emerald-50 text-emerald-700 font-semibold dark:bg-emerald-900/30 dark:text-emerald-300",
    borderClass: "border-emerald-400/40",
    iconLabel: "GR",
  },
  payment_voucher: {
    accentClass:
      "bg-amber-50 text-amber-700 font-semibold dark:bg-amber-900/30 dark:text-amber-300",
    borderClass: "border-amber-400/40",
    iconLabel: "PV",
  },
  invoice: {
    accentClass:
      "bg-indigo-50 text-indigo-700 font-semibold dark:bg-indigo-900/30 dark:text-indigo-300",
    borderClass: "border-indigo-400/40",
    iconLabel: "HĐ",
  },
  supplier: {
    accentClass:
      "bg-slate-100 text-slate-700 font-semibold dark:bg-slate-800 dark:text-slate-300",
    borderClass: "border-slate-400/40",
    iconLabel: "SUP",
  },
};

// ─── Custom Node ───────────────────────────────────────────────────────────────

function LayoutFitter({ layout }: { layout: GraphLayoutDirection }) {
  const { fitView } = useReactFlow();

  useEffect(() => {
    // Wait for nodes to update their positions before fitting
    const t = setTimeout(() => {
      fitView({ duration: 600, padding: 0.25 });
    }, 50);
    return () => clearTimeout(t);
  }, [layout, fitView]);

  return null;
}

function GraphNode({ data }: NodeProps<Node<GraphNodeData>>) {
  let cfg = NODE_CONFIG[data.nodeType] ?? NODE_CONFIG.supplier;

  // Override for XK (Goods Issue)
  if (data.nodeType === "goods_receipt" && data.label.startsWith("XK")) {
    cfg = {
      ...cfg,
      accentClass:
        "bg-red-50 text-red-700 font-semibold dark:bg-red-900/30 dark:text-red-300",
      borderClass: "border-red-400/40",
      iconLabel: "GI", // Goods Issue
    };
  }

  const formattedAmount =
    data.amount !== undefined
      ? new Intl.NumberFormat("vi-VN").format(data.amount)
      : undefined;

  // If we have a rawDate, try to format it nicely for the tooltip
  let tooltipDate = "";
  if (data.rawDate) {
    try {
      tooltipDate = format(new Date(data.rawDate), "dd/MM/yyyy HH:mm");
    } catch {
      tooltipDate = data.rawDate;
    }
  }

  return (
    <div
      className={cn(
        "rounded-xl border bg-surface card-shadow overflow-hidden flex flex-col",
        "min-w-[160px] max-w-[220px] text-left relative",
        "cursor-pointer hover:border-[color:var(--primary)]/50 hover:shadow-md transition-all select-none",
        cfg.borderClass,
      )}
    >
      {/* Target Handle (Left or Top) - for incoming edges */}
      {data.nodeType !== "supplier" && (
        <Handle
          type="target"
          position={data.layout === "vertical" ? Position.Top : Position.Left}
          className={cn(
            "w-2 h-2 !bg-[color:var(--primary)] border-none",
            data.layout === "vertical"
              ? "left-1/2 -translate-x-1/2"
              : "top-1/2 -translate-y-1/2",
          )}
        />
      )}

      {/* Source Handle (Right or Bottom) - for outgoing edges */}
      {(data.nodeType === "supplier" || data.nodeType === "purchase_order") && (
        <Handle
          type="source"
          position={
            data.layout === "vertical" ? Position.Bottom : Position.Right
          }
          className={cn(
            "w-2 h-2 !bg-[color:var(--primary)] border-none",
            data.layout === "vertical"
              ? "left-1/2 -translate-x-1/2"
              : "top-1/2 -translate-y-1/2",
          )}
        />
      )}

      {/* Top bar header */}
      <div
        className={cn(
          "px-3 py-1.5 flex items-center gap-2 border-b",
          cfg.accentClass,
          cfg.borderClass,
        )}
      >
        <span className="text-[10px] uppercase tracking-widest shrink-0">
          {cfg.iconLabel}
        </span>
        <span className="text-[12px] font-bold truncate" title={data.label}>
          {data.label}
        </span>
      </div>

      <div className="px-3 py-2 flex flex-col">
        {/* Sublabel / Date */}
        {data.sublabel &&
          (tooltipDate ? (
            <Tooltip content={tooltipDate}>
              <div className="text-[11px] text-[color:var(--muted-fg)] truncate inline-block w-fit cursor-help">
                {data.sublabel}
              </div>
            </Tooltip>
          ) : (
            <div className="text-[11px] text-[color:var(--muted-fg)] truncate">
              {data.sublabel}
            </div>
          ))}

        {/* Amount */}
        {formattedAmount && (
          <div className="text-[11px] text-[color:var(--muted-fg)] mt-[2px] truncate">
            {formattedAmount}
          </div>
        )}

        {/* Status */}
        {data.status && (
          <div className="mt-[6px]">
            <span className="text-[9px] uppercase tracking-wider bg-[color:var(--muted)] text-[color:var(--muted-fg)] rounded px-[5px] py-[1px]">
              {data.status}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

const NODE_TYPES: NodeTypes = {
  graphNode: GraphNode,
};

// ─── ConnectionGraphDrawer props ──────────────────────────────────────────────

interface ConnectionGraphDrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  loading: boolean;
  error: string | null;
  initialNodes: Node<GraphNodeData>[];
  initialEdges: Edge[];
  layout: GraphLayoutDirection;
  toggleLayout: () => void;
  onNodeClick?: (nodeData: GraphNodeData) => void;
}

// ─── Main component ───────────────────────────────────────────────────────────

export function ConnectionGraphDrawer({
  open,
  onClose,
  title,
  subtitle,
  loading,
  error,
  initialNodes,
  initialEdges,
  layout,
  toggleLayout,
  onNodeClick,
}: ConnectionGraphDrawerProps) {
  const t = useT();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Sync khi data load xong (initialNodes ban đầu là [] vì drawer mở trước khi fetch xong)
  useEffect(() => {
    setNodes(initialNodes);
  }, [initialNodes, setNodes]);

  useEffect(() => {
    setEdges(initialEdges);
  }, [initialEdges, setEdges]);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  return (
    <DrawerModal
      open={open}
      onClose={handleClose}
      icon={<Network className="h-4 w-4" />}
      title={title}
      subtitle={subtitle}
      panelClassName="min-[1024px]:min-w-[800px] flex flex-col"
      bodyClassName="p-0 flex-1 flex flex-col overflow-hidden relative"
    >
      {loading && (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-[color:var(--muted-fg)] absolute inset-0">
          <Loader2 className="h-7 w-7 animate-spin text-[color:var(--primary)]" />
          <span className="text-sm">{t("connectionGraph.loading")}</span>
        </div>
      )}

      {!loading && error && (
        <div className="flex-1 flex flex-col items-center justify-center gap-2 px-6 text-center absolute inset-0">
          <span className="text-sm font-medium text-[color:var(--warn-fg)]">
            {error}
          </span>
        </div>
      )}

      {!loading && !error && initialNodes.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center gap-2 text-[color:var(--muted-fg)] absolute inset-0">
          <Network className="h-8 w-8 opacity-30" />
          <span className="text-sm">{t("connectionGraph.empty")}</span>
        </div>
      )}

      {!loading && !error && initialNodes.length > 0 && (
        <div className="flex-1 w-full h-full min-h-[500px]">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={(_, node) => onNodeClick?.(node.data as GraphNodeData)}
            nodeTypes={NODE_TYPES}
            fitView
            fitViewOptions={{ padding: 0.25 }}
            nodesDraggable
            nodesConnectable={false}
            elementsSelectable
            proOptions={{ hideAttribution: true }}
          >
            <LayoutFitter layout={layout} />
            <Background color="var(--border)" gap={20} size={1} />
            <Controls
              showInteractive={false}
              className="!border-border !bg-surface !shadow-sm !rounded-xl overflow-hidden"
            >
              <ControlButton onClick={toggleLayout} title="Rotate Direction">
                <ArrowRightLeft className="w-4 h-4" />
              </ControlButton>
            </Controls>
            <MiniMap
              nodeColor={(node) => {
                const n = node as Node<GraphNodeData>;
                switch (n.data?.nodeType) {
                  case "purchase_order":
                    return "hsl(217 91% 60%)";
                  case "goods_receipt":
                    return "#34d399";
                  case "payment_voucher":
                    return "#fbbf24";
                  case "invoice":
                    return "#818cf8";
                  default:
                    return "#94a3b8";
                }
              }}
              maskColor="rgba(0,0,0,0.04)"
              className="!border-border !bg-surface !rounded-xl overflow-hidden"
            />
          </ReactFlow>
        </div>
      )}
    </DrawerModal>
  );
}
