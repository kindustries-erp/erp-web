import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  Handle,
  Position,
  useNodesState,
  useEdgesState,
  useReactFlow,
  ReactFlowProvider,
  MarkerType,
  type Node,
  type Edge,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { cn } from "@/shared/utils";
import { useT } from "@/core/i18n";
import {
  Network,
  GitCommit,
  Table as TableIcon,
  ExternalLink,
  Lock,
  Loader2,
  Copy,
  Check,
  RotateCcw,
  ArrowRight,
  ShieldAlert,
  Plus,
  Trash2,
  ChevronDown,
  FilePlus,
  Link2,
} from "lucide-react";

import { Button } from "@/shared/components/ui/Button";
import { ConfirmModal } from "@/shared/components/ConfirmModal";
import { ActionDropdown } from "@/shared/components/ActionDropdown";
import { money, formatGMT7 } from "@/shared/utils/format";
import type {
  TraceabilityGraphData,
  TraceabilityNode,
  TraceabilityNodeType,
} from "@/shared/types/traceability";

// ─── 4 Enterprise Business Stages ─────────────────────────────────────────────

export type BusinessStageKey =
  | "ORDER_STOCK"
  | "INVOICE"
  | "PAYMENT"
  | "GENERAL_LEDGER";

export interface StageConfig {
  key: BusinessStageKey;
  stageNo: number;
  title: string;
  shortTitle: string;
  types: TraceabilityNodeType[];
  accentBorder: string;
  badgeCls: string;
  bgCls: string;
}

export const STAGES_CONFIG: StageConfig[] = [
  {
    key: "ORDER_STOCK",
    stageNo: 1,
    title: "1. Mua / Bán hàng & Kho",
    shortTitle: "ĐƠN HÀNG & KHO",
    types: [
      "PURCHASE_ORDER",
      "SALES_ORDER",
      "GOODS_RECEIPT",
      "GOODS_ISSUE",
      "GARAGE_CASE",
    ],
    accentBorder: "border-zinc-300/80 dark:border-zinc-700",
    badgeCls: "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200",
    bgCls: "bg-zinc-50/50 dark:bg-zinc-950/40",
  },
  {
    key: "INVOICE",
    stageNo: 2,
    title: "2. Hóa đơn VAT",
    shortTitle: "HÓA ĐƠN VAT",
    types: ["INVOICE"],
    accentBorder: "border-slate-300/80 dark:border-slate-700",
    badgeCls:
      "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200",
    bgCls: "bg-slate-50/50 dark:bg-slate-950/40",
  },
  {
    key: "PAYMENT",
    stageNo: 3,
    title: "3. Dòng tiền & Sổ quỹ",
    shortTitle: "DÒNG TIỀN / SAO KÊ",
    types: ["BANK_TXN"],
    accentBorder: "border-slate-300/80 dark:border-slate-700",
    badgeCls:
      "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    bgCls: "bg-slate-50/50 dark:bg-slate-950/40",
  },
  {
    key: "GENERAL_LEDGER",
    stageNo: 4,
    title: "4. Sổ cái Kế toán",
    shortTitle: "SỔ CÁI KẾ TOÁN",
    types: ["JOURNAL_ENTRY"],
    accentBorder: "border-neutral-300/80 dark:border-neutral-700",
    badgeCls:
      "bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200",
    bgCls: "bg-neutral-50/50 dark:bg-neutral-950/40",
  },
];

export function getStageForDocType(docType: TraceabilityNodeType): StageConfig {
  return (
    STAGES_CONFIG.find((s) => s.types.includes(docType)) || STAGES_CONFIG[0]
  );
}

// ─── Module Badge & Config (Business Neutral Tone) ────────────────────────────

const MODULE_CONFIG: Record<
  TraceabilityNodeType,
  { label: string; badgeCls: string }
> = {
  INVOICE: {
    label: "HĐ",
    badgeCls:
      "bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700",
  },
  BANK_TXN: {
    label: "UNC / GBC",
    badgeCls:
      "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
  },
  PURCHASE_ORDER: {
    label: "PO",
    badgeCls:
      "bg-zinc-100 text-zinc-800 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-700",
  },
  SALES_ORDER: {
    label: "SO",
    badgeCls:
      "bg-zinc-100 text-zinc-800 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-700",
  },
  GOODS_RECEIPT: {
    label: "NK",
    badgeCls:
      "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
  },
  GOODS_ISSUE: {
    label: "XK",
    badgeCls:
      "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
  },
  JOURNAL_ENTRY: {
    label: "GL",
    badgeCls:
      "bg-neutral-100 text-neutral-800 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-200 dark:border-neutral-700",
  },
  GARAGE_CASE: {
    label: "RO / QTO",
    badgeCls:
      "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
  },
};

export function openGlobalErpDocument(
  docType: TraceabilityNodeType,
  id: string,
) {
  let type = "";
  if (docType === "INVOICE") type = "erp_invoice";
  else if (docType === "BANK_TXN") type = "bank_transaction";
  else if (docType === "PURCHASE_ORDER") type = "erp_purchase_order";
  else if (docType === "SALES_ORDER") type = "erp_sales_order";
  else if (docType === "GOODS_RECEIPT" || docType === "GOODS_ISSUE")
    type = "inventory_voucher";
  else if (docType === "GARAGE_CASE") type = "garage_case";

  if (type) {
    window.dispatchEvent(
      new CustomEvent("open_erp_document", {
        detail: { type, id },
      }),
    );
  }
}

// ─── Custom Stage Group Background Node (Swimlane Container) ─────────────────

interface StageGroupData extends Record<string, unknown> {
  stage: StageConfig;
  count: number;
  width: number;
  height: number;
  allowEdit?: boolean;
  onAddLink?: (stageKey: BusinessStageKey) => void;
}

function StageGroupNodeCard({ data }: NodeProps<Node<StageGroupData>>) {
  const t = useT();
  const group = data as StageGroupData;
  const { stage, count, width, height, allowEdit, onAddLink } = group;

  return (
    <div
      style={{ width: `${width}px`, height: `${height}px` }}
      className={cn(
        "rounded-2xl border-2 border-dashed relative pointer-events-none transition-all",
        stage.accentBorder,
        stage.bgCls,
      )}
    >
      {/* Top Header of Swimlane / Stage Group */}
      <div className="absolute top-2.5 left-3.5 right-3.5 flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={cn(
              "px-2 py-0.5 rounded-md text-[11px] font-bold tracking-wider font-mono uppercase border",
              stage.badgeCls,
            )}
          >
            {stage.shortTitle}
          </span>
          <span className="text-[11px] font-mono font-medium text-slate-500 dark:text-slate-400">
            {count} {t("chứng từ")}
          </span>
        </div>

        {allowEdit && onAddLink && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-[11px] text-slate-500 hover:text-slate-900 bg-white/80 dark:bg-slate-800 hover:bg-white border border-slate-200 dark:border-slate-700 shadow-2xs gap-1"
            onClick={() => onAddLink(stage.key)}
            title={t("Ghép nối chứng từ vào giai đoạn này")}
          >
            <Plus className="w-3 h-3" />
            <span>{t("Ghép nối")}</span>
          </Button>
        )}
      </div>
    </div>
  );
}

// ─── Custom Canvas Document Node Card ─────────────────────────────────────────

interface NodeCardCustomData extends TraceabilityNode, Record<string, unknown> {
  allowEdit?: boolean;
  onUnlink?: (node: TraceabilityNode) => void;
}

function TraceabilityNodeCard({ data }: NodeProps<Node<NodeCardCustomData>>) {
  const t = useT();
  const node = data as NodeCardCustomData;
  const cfg = MODULE_CONFIG[node.docType] || {
    label: node.docType,
    badgeCls: "bg-slate-100 text-slate-700 border-slate-200",
  };

  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (node.docNo && node.docNo !== "***") {
      navigator.clipboard.writeText(node.docNo);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const handleOpenDetail = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!node.restricted && node.hasPermission) {
      openGlobalErpDocument(node.docType, node.id);
    }
  };

  const handleUnlink = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (node.onUnlink) {
      node.onUnlink(node);
    }
  };

  const canUnlink = Boolean(
    node.allowEdit &&
    !node.isCurrent &&
    !node.restricted &&
    node.depth === 1 &&
    node.onUnlink,
  );

  return (
    <div
      className={cn(
        "w-[290px] rounded-xl border bg-white dark:bg-slate-900 transition-all duration-200 group text-left relative z-10",
        node.isCurrent
          ? "ring-2 ring-slate-900 dark:ring-slate-100 border-slate-500 shadow-md"
          : "border-slate-200/90 dark:border-slate-800 shadow-2xs hover:border-slate-400 dark:hover:border-slate-600 hover:shadow-sm",
        node.restricted &&
          "border-dashed border-slate-300 bg-slate-50/70 dark:bg-slate-900/50 opacity-80",
      )}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="w-2.5 h-2.5 !bg-slate-400 border border-white opacity-0 group-hover:opacity-100 transition-opacity z-20"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-2.5 h-2.5 !bg-slate-400 border border-white opacity-0 group-hover:opacity-100 transition-opacity z-20"
      />

      {/* Top Header Row */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100 dark:border-slate-800/80 gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <span
            className={cn(
              "px-1.5 py-0.5 rounded text-[10px] font-bold border font-mono tracking-wider",
              cfg.badgeCls,
            )}
          >
            {cfg.label}
          </span>
          <span className="font-mono text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
            {node.docNo}
          </span>
          {node.docNo !== "***" && (
            <button
              type="button"
              onClick={handleCopy}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded transition-colors"
              title={copied ? t("Đã chép") : t("Sao chép")}
            >
              {copied ? (
                <Check className="w-3 h-3 text-emerald-600" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
            </button>
          )}
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          {node.isCurrent && (
            <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900">
              ĐANG XEM
            </span>
          )}

          {canUnlink && (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="h-6 w-6 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
              title={t("Gỡ liên kết chứng từ này")}
              onClick={handleUnlink}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          )}

          {node.restricted ? (
            <div
              className="p-1 rounded text-slate-400 cursor-not-allowed"
              title={`${t("Bạn không có quyền truy cập module này")} (${node.requiredResource})`}
            >
              <Lock className="w-3.5 h-3.5 text-slate-400" />
            </div>
          ) : !node.isCurrent ? (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="h-6 w-6 text-slate-400 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={t("Mở chi tiết chứng từ")}
              onClick={handleOpenDetail}
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </Button>
          ) : null}
        </div>
      </div>

      {/* Body Content */}
      <div className="p-3 space-y-2">
        <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
          {node.restricted ? (
            <span className="italic flex items-center gap-1 text-slate-400">
              <Lock className="w-3 h-3" /> {t("Chứng từ bảo mật")}
            </span>
          ) : (
            node.partnerName || node.title || "—"
          )}
        </div>

        <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 dark:border-slate-800/60 font-mono">
          <span className="text-[11px] text-slate-400 font-sans">
            {node.date ? formatGMT7(node.date, "date") : "—"}
          </span>

          <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
            {node.restricted ? (
              <span className="text-slate-400 font-normal">***</span>
            ) : node.netOffAmount ? (
              <span
                className="text-emerald-700 dark:text-emerald-400"
                title={t("Số tiền cấn trừ")}
              >
                {money(node.netOffAmount)}
              </span>
            ) : node.amount ? (
              <span>{money(node.amount)}</span>
            ) : (
              <span className="text-slate-400 font-normal">0 ₫</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const NODE_TYPES = {
  traceabilityNode: TraceabilityNodeCard,
  stageGroupNode: StageGroupNodeCard,
};

// ─── Graph Layout Auto-Arranger with Stage Swimlanes ──────────────────────────

const CARD_WIDTH = 290;
const STAGE_COL_WIDTH = 330;
const STAGE_HEADER_HEIGHT = 48;
const CARD_ROW_GAP = 130;
const STAGE_COL_GAP = 120;

function computeLayout(
  graphData: TraceabilityGraphData,
  direction: "horizontal" | "vertical" = "horizontal",
  allowEdit?: boolean,
  onAddLink?: (stageKey: BusinessStageKey) => void,
  onUnlinkNode?: (node: TraceabilityNode) => void,
): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  // 1. Group nodes by Stage
  const stageGroupsMap = new Map<BusinessStageKey, TraceabilityNode[]>();
  STAGES_CONFIG.forEach((s) => stageGroupsMap.set(s.key, []));

  graphData.nodes.forEach((n) => {
    const stage = getStageForDocType(n.docType);
    stageGroupsMap.get(stage.key)!.push(n);
  });

  // Filter only active stages (stages with at least 1 document)
  const activeStages = STAGES_CONFIG.filter(
    (s) => (stageGroupsMap.get(s.key) || []).length > 0,
  );

  activeStages.forEach((stage, stageIdx) => {
    const stageDocs = stageGroupsMap.get(stage.key) || [];
    const count = stageDocs.length;

    if (direction === "horizontal") {
      const stageWidth = STAGE_COL_WIDTH;
      const stageHeight = Math.max(
        180,
        STAGE_HEADER_HEIGHT + count * CARD_ROW_GAP + 20,
      );
      const stageX = stageIdx * (stageWidth + STAGE_COL_GAP);
      const stageY = 0;

      // Add Stage Group Container Background Node
      nodes.push({
        id: `stage-group-${stage.key}`,
        type: "stageGroupNode",
        position: { x: stageX, y: stageY },
        selectable: false,
        draggable: false,
        data: {
          stage,
          count,
          width: stageWidth,
          height: stageHeight,
          allowEdit,
          onAddLink,
        },
        zIndex: -1,
      });

      // Add Document Nodes inside this Stage Column
      stageDocs.forEach((doc, docIdx) => {
        const docX = stageX + (stageWidth - CARD_WIDTH) / 2;
        const docY = stageY + STAGE_HEADER_HEIGHT + docIdx * CARD_ROW_GAP;

        nodes.push({
          id: doc.id,
          type: "traceabilityNode",
          position: { x: docX, y: docY },
          data: {
            ...doc,
            allowEdit,
            onUnlink: onUnlinkNode,
          },
          zIndex: 10,
        });
      });
    } else {
      // Vertical Stage Rows
      const stageWidth = Math.max(
        STAGE_COL_WIDTH,
        count * (CARD_WIDTH + 30) + 30,
      );
      const stageHeight = 220;
      const stageX = 0;
      const stageY = stageIdx * (stageHeight + 50);

      nodes.push({
        id: `stage-group-${stage.key}`,
        type: "stageGroupNode",
        position: { x: stageX, y: stageY },
        selectable: false,
        draggable: false,
        data: {
          stage,
          count,
          width: stageWidth,
          height: stageHeight,
          allowEdit,
          onAddLink,
        },
        zIndex: -1,
      });

      stageDocs.forEach((doc, docIdx) => {
        const docX = stageX + 20 + docIdx * (CARD_WIDTH + 30);
        const docY = stageY + STAGE_HEADER_HEIGHT + 10;

        nodes.push({
          id: doc.id,
          type: "traceabilityNode",
          position: { x: docX, y: docY },
          data: {
            ...doc,
            allowEdit,
            onUnlink: onUnlinkNode,
          },
          zIndex: 10,
        });
      });
    }
  });

  // 2. Build Edges with Directional Arrows & Clean Labels
  graphData.edges.forEach((e) => {
    edges.push({
      id: e.id,
      source: e.source,
      target: e.target,
      type: "smoothstep",
      label: e.label || undefined,
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 14,
        height: 14,
        color: "#94a3b8",
      },
      labelStyle: {
        fontSize: 10,
        fontFamily: "monospace",
        fontWeight: 600,
        fill: "#0f172a",
      },
      labelBgStyle: {
        fill: "#ffffff",
        fillOpacity: 1,
        stroke: "#94a3b8",
        strokeWidth: 1,
        rx: 6,
        ry: 6,
      },
      labelBgBorderRadius: 6,
      labelBgPadding: [8, 4],
      style: {
        stroke: "#94a3b8",
        strokeWidth: 1.8,
        strokeDasharray: e.isTransitive ? "4 4" : undefined,
      },
      zIndex: 30,
    });
  });

  return { nodes, edges };
}

function CanvasFlowInner({
  graphData,
  direction,
  allowEdit,
  onAddLink,
  onUnlinkNode,
}: {
  graphData: TraceabilityGraphData;
  direction: "horizontal" | "vertical";
  allowEdit?: boolean;
  onAddLink?: (stageKey: BusinessStageKey) => void;
  onUnlinkNode?: (node: TraceabilityNode) => void;
}) {
  const { fitView } = useReactFlow();
  const { nodes: initialNodes, edges: initialEdges } = useMemo(
    () =>
      computeLayout(graphData, direction, allowEdit, onAddLink, onUnlinkNode),
    [graphData, direction, allowEdit, onAddLink, onUnlinkNode],
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    const { nodes: nextNodes, edges: nextEdges } = computeLayout(
      graphData,
      direction,
      allowEdit,
      onAddLink,
      onUnlinkNode,
    );
    setNodes(nextNodes);
    setEdges(nextEdges);

    const t = setTimeout(() => {
      fitView({ duration: 400, padding: 0.2 });
    }, 60);
    return () => clearTimeout(t);
  }, [
    graphData,
    direction,
    allowEdit,
    onAddLink,
    onUnlinkNode,
    fitView,
    setNodes,
    setEdges,
  ]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      nodeTypes={NODE_TYPES}
      fitView
      fitViewOptions={{ padding: 0.2 }}
      minZoom={0.1}
      maxZoom={2}
      nodesDraggable
      nodesConnectable={false}
      elementsSelectable
      proOptions={{ hideAttribution: true }}
    >
      <Background color="#cbd5e1" gap={20} size={1} />
      <Controls
        showInteractive={false}
        className="!border-slate-200 !bg-white !shadow-xs !rounded-lg overflow-hidden"
      />
    </ReactFlow>
  );
}

// ─── Pipeline View (Sequential Column Flow) ───────────────────────────────────

function TraceabilityPipelineView({
  graphData,
  allowEdit,
  onAddLink,
  onUnlinkNode,
}: {
  graphData: TraceabilityGraphData;
  allowEdit?: boolean;
  onAddLink?: (stageKey: BusinessStageKey) => void;
  onUnlinkNode?: (node: TraceabilityNode) => void;
}) {
  const t = useT();

  return (
    <div className="flex items-start gap-4 overflow-x-auto p-4 min-h-[360px] bg-slate-50/50 dark:bg-slate-950/40 rounded-xl border border-slate-200/80">
      {STAGES_CONFIG.map((stage, sIdx) => {
        const stageNodes = graphData.nodes.filter((n) =>
          stage.types.includes(n.docType),
        );

        return (
          <React.Fragment key={stage.key}>
            <div className="flex-1 min-w-[250px] max-w-[310px] flex flex-col gap-2.5">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-200 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <span>{stage.title}</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-mono px-1.5 py-0.2 rounded bg-slate-200/60 dark:bg-slate-800 text-slate-600">
                    {stageNodes.length}
                  </span>
                  {allowEdit && onAddLink && (
                    <button
                      type="button"
                      onClick={() => onAddLink(stage.key)}
                      className="text-slate-400 hover:text-slate-700 p-0.5 rounded transition-colors"
                      title={t("Ghép nối")}
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {stageNodes.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400 border border-dashed rounded-lg border-slate-200 bg-white/40">
                  {t("Không có chứng từ")}
                </div>
              ) : (
                <div className="space-y-2.5">
                  {stageNodes.map((n) => (
                    <div
                      key={n.id}
                      className={cn(
                        "p-3 rounded-lg border bg-white dark:bg-slate-900 transition-all group",
                        n.isCurrent
                          ? "ring-2 ring-slate-900 dark:ring-slate-100 border-slate-500 shadow-xs"
                          : "border-slate-200/90 shadow-2xs hover:border-slate-400",
                        n.restricted && "border-dashed bg-slate-50 opacity-80",
                      )}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1.5">
                        <span className="font-mono text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                          {n.docNo}
                        </span>
                        <div className="flex items-center gap-1">
                          {allowEdit &&
                            !n.isCurrent &&
                            !n.restricted &&
                            n.depth === 1 &&
                            onUnlinkNode && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                className="h-5 w-5 text-slate-400 hover:text-red-600 hover:bg-red-50"
                                onClick={() => onUnlinkNode(n)}
                                title={t("Gỡ liên kết")}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            )}

                          {!n.restricted && n.hasPermission && !n.isCurrent ? (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              className="h-5 w-5 text-slate-400 hover:text-slate-900"
                              onClick={() =>
                                openGlobalErpDocument(n.docType, n.id)
                              }
                              title={t("Xem chi tiết")}
                            >
                              <ExternalLink className="w-3 h-3" />
                            </Button>
                          ) : n.restricted ? (
                            <Lock className="w-3 h-3 text-slate-400" />
                          ) : null}
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-500 truncate mb-2">
                        {n.restricted
                          ? t("Chứng từ bảo mật")
                          : n.partnerName || n.title || "—"}
                      </div>

                      <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-slate-100 font-mono">
                        <span className="text-slate-400 font-sans">
                          {n.date ? formatGMT7(n.date, "date") : "—"}
                        </span>
                        <span className="font-semibold text-slate-800">
                          {n.restricted
                            ? "***"
                            : n.netOffAmount
                              ? money(n.netOffAmount)
                              : money(n.amount || 0)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {sIdx < STAGES_CONFIG.length - 1 && (
              <div className="pt-8 flex-shrink-0 text-slate-300 dark:text-slate-700">
                <ArrowRight className="w-4 h-4" />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ─── Table View (Matrix Detail & Edit Support) ────────────────────────────────

function TraceabilityTableView({
  graphData,
  editMode,
  editActionsSlot,
  allowEdit,
  onUnlinkNode,
}: {
  graphData: TraceabilityGraphData;
  editMode?: boolean;
  editActionsSlot?: React.ReactNode;
  allowEdit?: boolean;
  onUnlinkNode?: (node: TraceabilityNode) => void;
}) {
  const t = useT();

  const directNodes = useMemo(
    () => graphData.nodes.filter((n) => !n.isCurrent && n.depth === 1),
    [graphData],
  );

  const transitiveNodes = useMemo(
    () => graphData.nodes.filter((n) => !n.isCurrent && n.depth > 1),
    [graphData],
  );

  const renderTableSection = (
    title: string,
    list: TraceabilityNode[],
    isDirect: boolean,
  ) => {
    return (
      <div className="space-y-2">
        <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
          <span>{title}</span>
          <span className="font-mono text-[11px] text-slate-500">
            {list.length} {t("bản ghi")}
          </span>
        </div>

        {list.length === 0 ? (
          <div className="py-4 text-center text-xs text-slate-400 border border-dashed rounded-lg bg-white/40">
            {t("Không có chứng từ liên kết.")}
          </div>
        ) : (
          <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-x-auto bg-white dark:bg-slate-900 shadow-2xs">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-3 py-2 font-medium text-slate-600 w-28">
                    {t("Loại chứng từ")}
                  </th>
                  <th className="px-3 py-2 font-medium text-slate-600">
                    {t("Số chứng từ")}
                  </th>
                  <th className="px-3 py-2 font-medium text-slate-600">
                    {t("Ngày lập")}
                  </th>
                  <th className="px-3 py-2 font-medium text-slate-600">
                    {t("Đối tác / Diễn giải")}
                  </th>
                  <th className="px-3 py-2 font-medium text-slate-600 text-right">
                    {t("Số tiền")}
                  </th>
                  <th className="px-3 py-2 font-medium text-slate-600 text-right">
                    {t("Đã cấn trừ")}
                  </th>
                  <th className="px-3 py-2 font-medium text-slate-600 text-right w-20"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {list.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 group"
                  >
                    <td className="px-3 py-2">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200">
                        {MODULE_CONFIG[row.docType]?.label || row.docType}
                      </span>
                    </td>
                    <td className="px-3 py-2 font-mono font-semibold text-slate-900 dark:text-slate-100">
                      {row.restricted ? "***" : row.docNo}
                    </td>
                    <td className="px-3 py-2 text-slate-500 font-sans">
                      {row.date ? formatGMT7(row.date, "date") : "—"}
                    </td>
                    <td className="px-3 py-2 text-slate-600 dark:text-slate-400">
                      {row.restricted ? (
                        <span className="italic text-slate-400">
                          {t("Chứng từ bảo mật")}
                        </span>
                      ) : (
                        row.partnerName || row.title || "—"
                      )}
                    </td>
                    <td className="px-3 py-2 text-right font-mono font-medium">
                      {row.restricted ? "***" : money(row.amount || 0)}
                    </td>
                    <td className="px-3 py-2 text-right font-mono font-semibold text-emerald-700 dark:text-emerald-400">
                      {row.restricted
                        ? "***"
                        : row.netOffAmount
                          ? money(row.netOffAmount)
                          : "—"}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {allowEdit && isDirect && onUnlinkNode && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            className="h-6 w-6 text-slate-400 hover:text-red-600 hover:bg-red-50"
                            onClick={() => onUnlinkNode(row)}
                            title={t("Gỡ liên kết")}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        )}

                        {!row.restricted && row.hasPermission ? (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            className="h-6 w-6 text-slate-400 hover:text-slate-900"
                            onClick={() =>
                              openGlobalErpDocument(row.docType, row.id)
                            }
                            title={t("Mở chi tiết")}
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Button>
                        ) : (
                          <Lock className="w-3.5 h-3.5 text-slate-300" />
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-5">
      {editMode && editActionsSlot && (
        <div className="p-3 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 rounded-lg">
          {editActionsSlot}
        </div>
      )}

      {renderTableSection(
        t("Chứng từ liên kết trực tiếp (1-hop)"),
        directNodes,
        true,
      )}
      {renderTableSection(
        t("Chứng từ liên kết trung gian / gián tiếp (Multi-hops)"),
        transitiveNodes,
        false,
      )}
    </div>
  );
}

// ─── Main DrawerDocumentTraceability Component ────────────────────────────────

export interface DrawerDocumentTraceabilityProps {
  rootId: string;
  rootType?: TraceabilityNodeType;
  fetchGraph: (id: string) => Promise<TraceabilityGraphData>;
  editMode?: boolean;
  allowEdit?: boolean;
  editActionsSlot?: React.ReactNode;
  onAddLink?: (stageKey?: BusinessStageKey) => void;
  onCreateNewDoc?: (stageKey?: BusinessStageKey) => void;
  onUnlinkNode?: (node: TraceabilityNode) => Promise<void> | void;
  className?: string;
}

export function DrawerDocumentTraceability({
  rootId,
  fetchGraph,
  editMode = false,
  editActionsSlot,
  onAddLink,
  onCreateNewDoc,
  onUnlinkNode,
  className,
}: DrawerDocumentTraceabilityProps) {
  const t = useT();
  const [viewMode, setViewMode] = useState<"canvas" | "pipeline" | "table">(
    "canvas",
  );
  const [canvasDirection, setCanvasDirection] = useState<
    "horizontal" | "vertical"
  >("horizontal");
  const [graphData, setGraphData] = useState<TraceabilityGraphData | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Unlink Confirm State
  const [unlinkingNode, setUnlinkingNode] = useState<TraceabilityNode | null>(
    null,
  );
  const [unlinkingLoading, setUnlinkingLoading] = useState(false);

  // Strict Edit Mode enforcement: Only enable adding, linking or deleting when in editMode
  const effectiveAllowEdit = Boolean(editMode);

  const loadData = useCallback(async () => {
    if (!rootId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchGraph(rootId);
      setGraphData(data);
    } catch (err: any) {
      setError(err?.message || "Không thể tải đồ thị chứng từ liên đới");
    } finally {
      setLoading(false);
    }
  }, [rootId, fetchGraph]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRequestUnlink = (node: TraceabilityNode) => {
    setUnlinkingNode(node);
  };

  const handleConfirmUnlink = async () => {
    if (!unlinkingNode || !onUnlinkNode) return;
    setUnlinkingLoading(true);
    try {
      await onUnlinkNode(unlinkingNode);
      setUnlinkingNode(null);
      await loadData();
    } catch (err: any) {
      console.error(err);
    } finally {
      setUnlinkingLoading(false);
    }
  };

  return (
    <div className={cn("w-full flex flex-col gap-3 py-1", className)}>
      {/* Top Header Bar: Statistics & View Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3 text-xs flex-wrap">
          <span className="text-slate-500">
            {t("Tổng chứng từ:")}{" "}
            <strong className="font-mono text-slate-800 dark:text-slate-200">
              {graphData ? graphData.nodes.length - 1 : 0}
            </strong>
          </span>

          {graphData && graphData.summary?.totalNetOffAmount > 0 && (
            <span className="text-slate-500">
              {t("Đã cấn trừ:")}{" "}
              <strong className="font-mono text-emerald-700 dark:text-emerald-400">
                {money(graphData.summary.totalNetOffAmount)}
              </strong>{" "}
              <span className="text-[10px] text-slate-400">
                ({graphData.summary.matchRatio}%)
              </span>
            </span>
          )}
        </div>

        {/* Action Controls & View Switcher Tabs */}
        <div className="flex items-center gap-2 flex-wrap">
          {effectiveAllowEdit &&
            (onAddLink || onCreateNewDoc) &&
            (onAddLink && onCreateNewDoc ? (
              <ActionDropdown
                items={[
                  {
                    groupLabel: t("THAO TÁC CHỨNG TỪ"),
                    items: [
                      {
                        label: t("Ghép nối chứng từ có sẵn..."),
                        icon: <Link2 className="w-4 h-4" />,
                        onClick: () => onAddLink?.(),
                      },
                      {
                        label: t("Tạo mới chứng từ liên quan..."),
                        icon: <FilePlus className="w-4 h-4" />,
                        onClick: () => onCreateNewDoc?.(),
                      },
                    ],
                  },
                ]}
                customTrigger={
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs gap-1.5 text-primary border-primary/30 bg-primary/5 hover:bg-primary/10 font-medium"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{t("Thêm chứng từ")}</span>
                    <ChevronDown className="w-3 h-3 ml-0.5 opacity-70" />
                  </Button>
                }
              />
            ) : (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onAddLink?.()}
                className="h-7 text-xs gap-1.5 text-primary border-primary/30 bg-primary/5 hover:bg-primary/10 font-medium"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t("Ghép nối chứng từ")}</span>
              </Button>
            ))}

          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200/80">
            <button
              type="button"
              onClick={() => setViewMode("canvas")}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all",
                viewMode === "canvas"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs font-semibold"
                  : "text-slate-500 hover:text-slate-900",
              )}
            >
              <Network className="w-3.5 h-3.5" />
              <span>{t("Canvas")}</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode("pipeline")}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all",
                viewMode === "pipeline"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs font-semibold"
                  : "text-slate-500 hover:text-slate-900",
              )}
            >
              <GitCommit className="w-3.5 h-3.5" />
              <span>{t("Quy trình")}</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all",
                viewMode === "table"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs font-semibold"
                  : "text-slate-500 hover:text-slate-900",
              )}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>{t("Bảng kê")}</span>
            </button>

            {viewMode === "canvas" && (
              <div className="flex items-center pl-1 border-l border-slate-200 dark:border-slate-700 ml-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="h-6 w-6 text-slate-500 hover:text-slate-900"
                  onClick={() =>
                    setCanvasDirection((d) =>
                      d === "horizontal" ? "vertical" : "horizontal",
                    )
                  }
                  title={t("Đổi hướng bố cục Ngang/Dọc")}
                >
                  <RotateCcw className="w-3 h-3" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Viewport Content */}
      {loading ? (
        <div className="h-[380px] flex flex-col items-center justify-center gap-2 text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin text-slate-500" />
          <span className="text-xs">{t("Đang tải mạng lưới chứng từ...")}</span>
        </div>
      ) : error ? (
        <div className="h-[200px] flex flex-col items-center justify-center gap-2 text-rose-500 bg-rose-50/50 rounded-xl border border-rose-200 p-4 text-center">
          <ShieldAlert className="w-6 h-6" />
          <span className="text-xs font-medium">{error}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            className="mt-2 text-xs"
          >
            {t("Thử lại")}
          </Button>
        </div>
      ) : !graphData || graphData.nodes.length <= 1 ? (
        <div className="h-[240px] flex flex-col items-center justify-center gap-3 text-slate-400 border border-dashed rounded-xl bg-slate-50/40 p-4">
          <Network className="w-7 h-7 opacity-40" />
          <span className="text-xs text-center">
            {t("Chưa có chứng từ liên kết trực tiếp hay gián tiếp nào.")}
          </span>
          {effectiveAllowEdit && onAddLink && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onAddLink()}
              className="gap-1.5 text-xs text-primary border-primary/30"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t("Ghép nối chứng từ đầu tiên")}</span>
            </Button>
          )}
        </div>
      ) : (
        <div className="w-full">
          {viewMode === "canvas" && (
            <div className="w-full h-[500px] rounded-xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-950 overflow-hidden relative shadow-2xs">
              <ReactFlowProvider>
                <CanvasFlowInner
                  graphData={graphData}
                  direction={canvasDirection}
                  allowEdit={effectiveAllowEdit}
                  onAddLink={onAddLink}
                  onUnlinkNode={handleRequestUnlink}
                />
              </ReactFlowProvider>
            </div>
          )}

          {viewMode === "pipeline" && (
            <TraceabilityPipelineView
              graphData={graphData}
              allowEdit={effectiveAllowEdit}
              onAddLink={onAddLink}
              onUnlinkNode={handleRequestUnlink}
            />
          )}

          {viewMode === "table" && (
            <TraceabilityTableView
              graphData={graphData}
              editMode={editMode}
              editActionsSlot={editActionsSlot}
              allowEdit={effectiveAllowEdit}
              onUnlinkNode={handleRequestUnlink}
            />
          )}
        </div>
      )}

      {/* Unlink Confirmation Modal */}
      <ConfirmModal
        open={!!unlinkingNode}
        title={t("Gỡ liên kết chứng từ")}
        message={
          unlinkingNode
            ? `${t("Bạn có chắc chắn muốn gỡ liên kết chứng từ")} "${unlinkingNode.docNo}" (${unlinkingNode.partnerName || unlinkingNode.title || ""}) ${t("khỏi chuỗi chứng từ này không?")}`
            : ""
        }
        confirmLabel={t("Gỡ liên kết")}
        danger
        loading={unlinkingLoading}
        onConfirm={handleConfirmUnlink}
        onCancel={() => setUnlinkingNode(null)}
      />
    </div>
  );
}
