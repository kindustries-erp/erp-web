import { useCallback, useEffect, useState, useMemo } from "react";
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
import { DrawerModal } from "@/shared/components/DrawerModal";
import { useT } from "@/core/i18n";
import { cn } from "@/shared/utils";
import { Network, Loader2, ChevronRight } from "lucide-react";
import { Tooltip } from "@/core/components/ui/Tooltip";
import { format } from "date-fns";
import type {
  GraphNodeData,
  GraphLayoutDirection,
} from "@/modules/purchase-orders-core/hooks/usePurchaseOrderGraph";

// ─── Node label config per type ───────────────────────────────────────────────

const NODE_CONFIG: Record<
  GraphNodeData["nodeType"],
  {
    accentClass: string;
    borderClass: string;
    solidBorder: string;
    iconLabel: string;
  }
> = {
  purchase_order: {
    accentClass:
      "bg-blue-50/80 text-blue-700 font-bold dark:bg-blue-900/30 dark:text-blue-300",
    borderClass: "border-blue-100 dark:border-blue-800/50",
    solidBorder: "border-l-blue-500",
    iconLabel: "PO",
  },
  goods_receipt: {
    accentClass:
      "bg-emerald-50/80 text-emerald-700 font-bold dark:bg-emerald-900/30 dark:text-emerald-300",
    borderClass: "border-emerald-100 dark:border-emerald-800/50",
    solidBorder: "border-l-emerald-500",
    iconLabel: "GR",
  },
  payment_voucher: {
    accentClass:
      "bg-amber-50/80 text-amber-700 font-bold dark:bg-amber-900/30 dark:text-amber-300",
    borderClass: "border-amber-100 dark:border-amber-800/50",
    solidBorder: "border-l-amber-500",
    iconLabel: "PV",
  },
  invoice: {
    accentClass:
      "bg-indigo-50/80 text-indigo-700 font-bold dark:bg-indigo-900/30 dark:text-indigo-300",
    borderClass: "border-indigo-100 dark:border-indigo-800/50",
    solidBorder: "border-l-indigo-500",
    iconLabel: "HĐ",
  },
  supplier: {
    accentClass:
      "bg-slate-50/80 text-slate-700 font-bold dark:bg-slate-800/50 dark:text-slate-300",
    borderClass: "border-slate-200 dark:border-slate-700",
    solidBorder: "border-l-slate-500",
    iconLabel: "SUP",
  },
  inventory_item: {
    accentClass:
      "bg-cyan-50/80 text-cyan-700 font-bold dark:bg-cyan-900/30 dark:text-cyan-300",
    borderClass: "border-cyan-100 dark:border-cyan-800/50",
    solidBorder: "border-l-cyan-500",
    iconLabel: "KHO",
  },
  goods_issue: {
    accentClass:
      "bg-orange-50/80 text-orange-700 font-bold dark:bg-orange-900/30 dark:text-orange-300",
    borderClass: "border-orange-100 dark:border-orange-800/50",
    solidBorder: "border-l-orange-500",
    iconLabel: "XK",
  },
  production_order: {
    accentClass:
      "bg-fuchsia-50/80 text-fuchsia-700 font-bold dark:bg-fuchsia-900/30 dark:text-fuchsia-300",
    borderClass: "border-fuchsia-100 dark:border-fuchsia-800/50",
    solidBorder: "border-l-fuchsia-500",
    iconLabel: "SX",
  },
  bom: {
    accentClass:
      "bg-pink-50/80 text-pink-700 font-bold dark:bg-pink-900/30 dark:text-pink-300",
    borderClass: "border-pink-100 dark:border-pink-800/50",
    solidBorder: "border-l-pink-500",
    iconLabel: "BOM",
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
        "bg-red-50/80 text-red-700 font-bold dark:bg-red-900/30 dark:text-red-300",
      borderClass: "border-red-100 dark:border-red-800/50",
      solidBorder: "border-l-red-500",
      iconLabel: "GI",
    };
  }

  let tooltipDate = "";
  if (data.rawDate) {
    try {
      tooltipDate = format(new Date(data.rawDate), "dd/MM/yyyy HH:mm");
    } catch {
      tooltipDate = data.rawDate;
    }
  }

  const isCompleted = data.status === "POSTED" || data.status === "COMPLETED";

  return (
    <div
      className={cn(
        "w-[320px] rounded-2xl border border-[color:var(--border)] bg-white dark:bg-slate-900 overflow-hidden flex flex-col relative group transition-all duration-300 cursor-pointer",
        "shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:shadow-[0_16px_40px_rgb(0,0,0,0.12)] hover:-translate-y-1.5",
        "border-l-[6px]",
        cfg.solidBorder,
      )}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 !bg-[color:var(--primary)] border-2 border-white opacity-0 group-hover:opacity-100 transition-opacity z-10"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 !bg-[color:var(--primary)] border-2 border-white opacity-0 group-hover:opacity-100 transition-opacity z-10"
      />

      {/* Colored Header */}
      <div
        className={cn(
          "px-5 py-3.5 text-[15px] tracking-tight font-extrabold truncate border-b backdrop-blur-sm",
          cfg.accentClass,
          cfg.borderClass,
        )}
      >
        {data.label}
      </div>

      <div className="p-5 flex flex-col">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[color:var(--muted-fg)]">
            <div
              className={cn(
                "px-2 py-0.5 rounded text-[10px] uppercase tracking-widest font-black shadow-sm",
                cfg.accentClass,
                cfg.borderClass,
                "border",
              )}
            >
              {cfg.iconLabel}
            </div>
            <span className="text-[12px] font-medium truncate max-w-[150px]">
              {tooltipDate ? (
                <Tooltip content={tooltipDate}>
                  <span className="cursor-help">
                    {data.sublabel || "Transaction"}
                  </span>
                </Tooltip>
              ) : (
                data.sublabel || "Transaction"
              )}
            </span>
          </div>
          <button
            type="button"
            className="text-[10px] text-[color:var(--muted-fg)] hover:text-foreground cursor-pointer flex items-center gap-0.5 transition-colors z-20"
            onClick={(e) => {
              e.stopPropagation();
              const onClickFn = (data as Record<string, unknown>)
                .onDetailsClick;
              if (typeof onClickFn === "function") {
                onClickFn();
              }
            }}
          >
            Details <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        <div className="flex items-center justify-end mt-5">
          {data.status && (
            <span
              className={cn(
                "text-[11px] font-black px-2.5 py-1 rounded uppercase tracking-widest shadow-sm",
                isCompleted
                  ? "bg-emerald-500 text-white"
                  : "bg-amber-400 text-amber-950 dark:bg-amber-500 dark:text-amber-950",
              )}
            >
              {data.status}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function GroupNode({ data }: { data: Record<string, unknown> }) {
  return (
    <div className="h-full w-full rounded-3xl border-[3px] border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/50 backdrop-blur-sm pointer-events-none relative shadow-xl">
      <Handle
        type="target"
        position={Position.Left}
        className="w-4 h-4 !bg-transparent border-none opacity-0"
      />
      <div className="absolute top-0 left-0 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-6 py-2 rounded-br-2xl rounded-tl-[21px] text-[13px] font-black tracking-widest uppercase shadow-sm">
        {data.label === "inventory" ? "WAREHOUSE" : String(data.label)}
      </div>
    </div>
  );
}

const NODE_TYPES: NodeTypes = {
  graphNode: GraphNode,
  groupNode: GroupNode,
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

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const onSelectionChange = useCallback((params: { nodes: Node[] }) => {
    const selected = params.nodes.find((n) => n.selected);
    setSelectedNodeId(selected ? selected.id : null);
  }, []);

  const { highlightedNodeIds, highlightedEdgeIds } = useMemo(() => {
    if (!selectedNodeId)
      return {
        highlightedNodeIds: new Set<string>(),
        highlightedEdgeIds: new Set<string>(),
      };

    const nodeIds = new Set<string>([selectedNodeId]);
    const edgeIds = new Set<string>();

    // Upstream BFS
    const upQueue = [selectedNodeId];
    const upVisited = new Set<string>([selectedNodeId]);
    while (upQueue.length > 0) {
      const current = upQueue.shift()!;
      edges.forEach((e) => {
        if (e.target === current) {
          if (!upVisited.has(e.source)) {
            upVisited.add(e.source);
            upQueue.push(e.source);
            nodeIds.add(e.source);
          }
          edgeIds.add(e.id);
        }
      });
    }

    // Downstream BFS
    const downQueue = [selectedNodeId];
    const downVisited = new Set<string>([selectedNodeId]);
    while (downQueue.length > 0) {
      const current = downQueue.shift()!;
      edges.forEach((e) => {
        if (e.source === current) {
          if (!downVisited.has(e.target)) {
            downVisited.add(e.target);
            downQueue.push(e.target);
            nodeIds.add(e.target);
          }
          edgeIds.add(e.id);
        }
      });
    }

    return { highlightedNodeIds: nodeIds, highlightedEdgeIds: edgeIds };
  }, [selectedNodeId, edges]);

  const displayNodes = useMemo(() => {
    return nodes.map((n) => {
      const isGroup = n.type === "groupNode";
      const isRoot = n.data?.nodeType === "inventory_item";
      const isDimmed =
        selectedNodeId && !isGroup && !highlightedNodeIds.has(n.id);
      return {
        ...n,
        selectable: !isRoot && !isGroup, // Prevent selection of root node and group nodes
        style: {
          ...n.style,
          opacity: isDimmed ? 0.2 : 1,
          transition: "opacity 0.3s",
        },
        data: {
          ...n.data,
          onDetailsClick: () => onNodeClick?.(n.data as GraphNodeData),
        },
      };
    });
  }, [nodes, selectedNodeId, highlightedNodeIds, onNodeClick]);

  const displayEdges = useMemo(() => {
    return edges.map((e) => {
      const isHighlighted = selectedNodeId && highlightedEdgeIds.has(e.id);
      const isDimmed = selectedNodeId && !highlightedEdgeIds.has(e.id);
      return {
        ...e,
        animated: isHighlighted || !selectedNodeId,
        style: {
          ...e.style,
          stroke: isHighlighted ? "#ef4444" : undefined,
          strokeWidth: isHighlighted ? 3 : 2,
          opacity: isDimmed ? 0.1 : 1,
          transition: "all 0.3s",
        },
      };
    });
  }, [edges, selectedNodeId, highlightedEdgeIds]);

  const handleClose = useCallback(() => {
    onClose();
    setSelectedNodeId(null);
  }, [onClose]);

  return (
    <DrawerModal
      open={open}
      onClose={handleClose}
      icon={<Network className="h-4 w-4" />}
      title={title}
      subtitle={subtitle}
      panelClassName="min-[1024px]:w-[80vw] min-[1024px]:max-w-[1400px] flex flex-col"
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
        <div className="flex-1 w-full h-full min-h-[500px] bg-slate-50 dark:bg-slate-950">
          <ReactFlow
            nodes={displayNodes}
            edges={displayEdges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onSelectionChange={onSelectionChange}
            nodeTypes={NODE_TYPES}
            fitView
            fitViewOptions={{ padding: 0.25 }}
            minZoom={0.05}
            maxZoom={2}
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
            />
          </ReactFlow>
        </div>
      )}
    </DrawerModal>
  );
}
