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
} from "lucide-react";

import { Button } from "@/shared/components/ui/Button";
import { money, formatGMT7 } from "@/shared/utils/format";
import type {
  TraceabilityGraphData,
  TraceabilityNode,
  TraceabilityNodeType,
} from "@/shared/types/traceability";

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

// ─── Custom Canvas Node Card (Business Neutral Standard) ──────────────────────

function TraceabilityNodeCard({ data }: NodeProps<Node<TraceabilityNode>>) {
  const t = useT();
  const node = data as TraceabilityNode;
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

  return (
    <div
      className={cn(
        "w-[290px] rounded-xl border bg-white dark:bg-slate-900 transition-all duration-200 group text-left relative",
        node.isCurrent
          ? "ring-1.5 ring-slate-800 dark:ring-slate-200 border-slate-400 shadow-sm"
          : "border-slate-200/90 dark:border-slate-800 shadow-2xs hover:border-slate-400 dark:hover:border-slate-600 hover:shadow-xs",
        node.restricted &&
          "border-dashed border-slate-300 bg-slate-50/70 dark:bg-slate-900/50 opacity-80",
      )}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="w-2.5 h-2.5 !bg-slate-400 border border-white opacity-0 group-hover:opacity-100 transition-opacity z-10"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-2.5 h-2.5 !bg-slate-400 border border-white opacity-0 group-hover:opacity-100 transition-opacity z-10"
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

          {node.restricted ? (
            <div
              className="p-1 rounded text-slate-400 cursor-not-allowed"
              title={`${t("Bạn không có quyền truy cập module này")} (${node.requiredResource})`}
            >
              <Lock className="w-3.5 h-3.5 text-slate-400" />
            </div>
          ) : (
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
          )}
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
};

// ─── Graph Layout Auto-Arranger (DAG / Column-based) ──────────────────────────

const COL_GAP = 340;
const ROW_GAP = 120;

function computeLayout(
  graphData: TraceabilityGraphData,
  direction: "horizontal" | "vertical" = "horizontal",
): { nodes: Node<TraceabilityNode>[]; edges: Edge[] } {
  const nodes: Node<TraceabilityNode>[] = [];
  const edges: Edge[] = [];

  // Group nodes by depth / column
  const depthGroups = new Map<number, TraceabilityNode[]>();
  graphData.nodes.forEach((n) => {
    const list = depthGroups.get(n.depth) || [];
    list.push(n);
    depthGroups.set(n.depth, list);
  });

  depthGroups.forEach((groupNodes, depth) => {
    const totalInCol = groupNodes.length;
    const offset = -((totalInCol - 1) * ROW_GAP) / 2;

    groupNodes.forEach((n, idx) => {
      let x = depth * COL_GAP;
      let y = offset + idx * ROW_GAP;

      if (direction === "vertical") {
        const vOffset = -((totalInCol - 1) * COL_GAP) / 2;
        x = vOffset + idx * COL_GAP;
        y = depth * ROW_GAP * 1.5;
      }

      nodes.push({
        id: n.id,
        type: "traceabilityNode",
        position: { x, y },
        data: n,
      });
    });
  });

  graphData.edges.forEach((e) => {
    edges.push({
      id: e.id,
      source: e.source,
      target: e.target,
      type: "smoothstep",
      label: e.label || undefined,
      labelStyle: {
        fontSize: 10,
        fontFamily: "monospace",
        fill: "#475569",
      },
      labelBgStyle: {
        fill: "#f8fafc",
        fillOpacity: 0.95,
        rx: 4,
        ry: 4,
      },
      labelBgBorderRadius: 4,
      labelBgPadding: [6, 2],
      style: {
        stroke: "#cbd5e1",
        strokeWidth: 1.5,
        strokeDasharray: e.isTransitive ? "4 4" : undefined,
      },
    });
  });

  return { nodes, edges };
}

function CanvasFlowInner({
  graphData,
  direction,
}: {
  graphData: TraceabilityGraphData;
  direction: "horizontal" | "vertical";
}) {
  const { fitView } = useReactFlow();
  const { nodes: initialNodes, edges: initialEdges } = useMemo(
    () => computeLayout(graphData, direction),
    [graphData, direction],
  );

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    const t = setTimeout(() => {
      fitView({ duration: 400, padding: 0.25 });
    }, 50);
    return () => clearTimeout(t);
  }, [graphData, direction, fitView]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      nodeTypes={NODE_TYPES}
      fitView
      fitViewOptions={{ padding: 0.25 }}
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
}: {
  graphData: TraceabilityGraphData;
}) {
  const t = useT();

  const stages: { title: string; types: TraceabilityNodeType[] }[] = [
    {
      title: t("1. Mua / Bán hàng"),
      types: ["PURCHASE_ORDER", "SALES_ORDER", "GARAGE_CASE"],
    },
    { title: t("2. Nhập / Xuất kho"), types: ["GOODS_RECEIPT", "GOODS_ISSUE"] },
    { title: t("3. Hóa đơn VAT"), types: ["INVOICE"] },
    { title: t("4. Dòng tiền / Sao kê"), types: ["BANK_TXN"] },
    { title: t("5. Sổ cái Kế toán"), types: ["JOURNAL_ENTRY"] },
  ];

  return (
    <div className="flex items-start gap-4 overflow-x-auto p-4 min-h-[360px] bg-slate-50/50 dark:bg-slate-950/40 rounded-xl border border-slate-200/80">
      {stages.map((stage, sIdx) => {
        const stageNodes = graphData.nodes.filter((n) =>
          stage.types.includes(n.docType),
        );

        return (
          <React.Fragment key={stage.title}>
            <div className="flex-1 min-w-[240px] max-w-[300px] flex flex-col gap-2.5">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-200 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <span>{stage.title}</span>
                <span className="text-[11px] font-mono px-1.5 py-0.2 rounded bg-slate-200/60 dark:bg-slate-800 text-slate-600">
                  {stageNodes.length}
                </span>
              </div>

              {stageNodes.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400 border border-dashed rounded-lg border-slate-200">
                  {t("Không có chứng từ")}
                </div>
              ) : (
                <div className="space-y-2.5">
                  {stageNodes.map((n) => (
                    <div
                      key={n.id}
                      className={cn(
                        "p-3 rounded-lg border bg-white dark:bg-slate-900 transition-all",
                        n.isCurrent
                          ? "ring-1.5 ring-slate-800 dark:ring-slate-200 border-slate-400 shadow-xs"
                          : "border-slate-200/90 shadow-2xs hover:border-slate-400",
                        n.restricted && "border-dashed bg-slate-50 opacity-80",
                      )}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1.5">
                        <span className="font-mono text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                          {n.docNo}
                        </span>
                        {!n.restricted && n.hasPermission ? (
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
                        ) : (
                          <Lock className="w-3 h-3 text-slate-400" />
                        )}
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

            {sIdx < stages.length - 1 && (
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
}: {
  graphData: TraceabilityGraphData;
  editMode?: boolean;
  editActionsSlot?: React.ReactNode;
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

  const renderTableSection = (title: string, list: TraceabilityNode[]) => {
    return (
      <div className="space-y-2">
        <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
          <span>{title}</span>
          <span className="font-mono text-[11px] text-slate-500">
            {list.length} bản ghi
          </span>
        </div>

        {list.length === 0 ? (
          <div className="py-4 text-center text-xs text-slate-400 border border-dashed rounded-lg">
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
                  <th className="px-3 py-2 font-medium text-slate-600 text-right w-12"></th>
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
      )}
      {renderTableSection(
        t("Chứng từ liên kết trung gian / gián tiếp (Multi-hops)"),
        transitiveNodes,
      )}
    </div>
  );
}

// ─── Main DrawerDocumentTraceability Component ────────────────────────────────

export interface DrawerDocumentTraceabilityProps {
  rootId: string;
  rootType: TraceabilityNodeType;
  fetchGraph: (id: string) => Promise<TraceabilityGraphData>;
  editMode?: boolean;
  editActionsSlot?: React.ReactNode;
  className?: string;
}

export function DrawerDocumentTraceability({
  rootId,
  fetchGraph,
  editMode = false,
  editActionsSlot,
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

  return (
    <div className={cn("w-full flex flex-col gap-3 py-1", className)}>
      {/* Top Header Bar: Statistics & View Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3 text-xs">
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

        {/* View Switcher Tabs */}
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
        <div className="h-[220px] flex flex-col items-center justify-center gap-2 text-slate-400 border border-dashed rounded-xl bg-slate-50/40">
          <Network className="w-6 h-6 opacity-40" />
          <span className="text-xs">
            {t("Chưa có chứng từ liên kết trực tiếp hay gián tiếp nào.")}
          </span>
        </div>
      ) : (
        <div className="w-full">
          {viewMode === "canvas" && (
            <div className="w-full h-[460px] rounded-xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-950 overflow-hidden relative shadow-2xs">
              <ReactFlowProvider>
                <CanvasFlowInner
                  graphData={graphData}
                  direction={canvasDirection}
                />
              </ReactFlowProvider>
            </div>
          )}

          {viewMode === "pipeline" && (
            <TraceabilityPipelineView graphData={graphData} />
          )}

          {viewMode === "table" && (
            <TraceabilityTableView
              graphData={graphData}
              editMode={editMode}
              editActionsSlot={editActionsSlot}
            />
          )}
        </div>
      )}
    </div>
  );
}
