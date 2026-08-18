import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { createPortal } from "react-dom";
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
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  type Node,
  type Edge,
  type NodeProps,
  type EdgeProps,
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
  Link2,
  Maximize2,
  Minimize2,
} from "lucide-react";

import { Button } from "@/shared/components/ui/Button";
import { Popover } from "@/core/components/ui/Popover";
import { ConfirmModal } from "@/shared/components/ConfirmModal";
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
    title: "3. Dòng tiền",
    shortTitle: "DÒNG TIỀN",
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

export const DOC_TYPE_META: Record<
  TraceabilityNodeType,
  { label: string; fullTitle: string; badgeCls: string }
> = {
  INVOICE: {
    label: "HĐ",
    fullTitle: "Hóa đơn VAT",
    badgeCls:
      "bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700",
  },
  BANK_TXN: {
    label: "UNC / GBC",
    fullTitle: "Sao kê / Sổ quỹ",
    badgeCls:
      "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
  },
  PURCHASE_ORDER: {
    label: "PO",
    fullTitle: "Đơn mua hàng (PO)",
    badgeCls:
      "bg-zinc-100 text-zinc-800 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-700",
  },
  SALES_ORDER: {
    label: "SO",
    fullTitle: "Đơn bán hàng (SO)",
    badgeCls:
      "bg-zinc-100 text-zinc-800 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-700",
  },
  GOODS_RECEIPT: {
    label: "NK",
    fullTitle: "Phiếu nhập kho (NK)",
    badgeCls:
      "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
  },
  GOODS_ISSUE: {
    label: "XK",
    fullTitle: "Phiếu xuất kho (XK)",
    badgeCls:
      "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
  },
  JOURNAL_ENTRY: {
    label: "GL",
    fullTitle: "Bút toán sổ cái (GL)",
    badgeCls:
      "bg-neutral-100 text-neutral-800 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-200 dark:border-neutral-700",
  },
  GARAGE_CASE: {
    label: "RO / QTO",
    fullTitle: "Phiếu dịch vụ Garage (RO)",
    badgeCls:
      "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
  },
};

const MODULE_CONFIG = DOC_TYPE_META;

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
  onAddLink?: (
    stageKey: BusinessStageKey,
    docType?: TraceabilityNodeType,
  ) => void;
  allowedDocTypes?: TraceabilityNodeType[];
}

function StageGroupNodeCard({ data }: NodeProps<Node<StageGroupData>>) {
  const t = useT();
  const group = data as StageGroupData;
  const { stage, count, width, height, allowEdit, onAddLink, allowedDocTypes } =
    group;

  const validStageTypes = useMemo(() => {
    if (!allowedDocTypes) return stage.types;
    return stage.types.filter((t) => allowedDocTypes.includes(t));
  }, [stage.types, allowedDocTypes]);

  const canAddInThisStage = Boolean(
    allowEdit && onAddLink && validStageTypes.length > 0,
  );

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
            ({count})
          </span>
        </div>

        {canAddInThisStage && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-[11px] text-slate-500 hover:text-slate-900 bg-white/80 dark:bg-slate-800 hover:bg-white border border-slate-200 dark:border-slate-700 shadow-2xs gap-1"
            onClick={() =>
              onAddLink?.(
                stage.key,
                validStageTypes.length === 1 ? validStageTypes[0] : undefined,
              )
            }
            title={`${t("Ghép nối chứng từ vào")} ${stage.title}`}
          >
            <Plus className="w-3 h-3" />
            <span>{t("Thêm liên kết")}</span>
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
    if (!node.restricted && node.hasPermission !== false) {
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
      onDoubleClick={handleOpenDetail}
      className={cn(
        "w-[290px] rounded-xl border bg-white dark:bg-slate-900 transition-all duration-200 group text-left relative z-10 cursor-pointer",
        node.isCurrent
          ? "ring-2 ring-slate-900 dark:ring-slate-100 border-slate-500 shadow-md"
          : "border-slate-200/90 dark:border-slate-800 shadow-2xs hover:border-slate-400 dark:hover:border-slate-600 hover:shadow-sm",
        node.restricted &&
          "border-dashed border-slate-300 bg-slate-50/70 dark:bg-slate-900/50 opacity-80 cursor-default",
      )}
    >
      {/* Directional Connection Handles */}
      <Handle
        type="target"
        id="left"
        position={Position.Left}
        className="w-2.5 h-2.5 !bg-slate-400 border border-white opacity-0 group-hover:opacity-100 transition-opacity z-20"
      />
      <Handle
        type="source"
        id="right"
        position={Position.Right}
        className="w-2.5 h-2.5 !bg-slate-400 border border-white opacity-0 group-hover:opacity-100 transition-opacity z-20"
      />
      <Handle
        type="target"
        id="top"
        position={Position.Top}
        className="w-2.5 h-2.5 !bg-slate-400 border border-white opacity-0 group-hover:opacity-100 transition-opacity z-20"
      />
      <Handle
        type="source"
        id="bottom"
        position={Position.Bottom}
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

function renderEdgeLabelContent(rawLabel: any) {
  if (!rawLabel) return null;
  const str = String(rawLabel).trim();

  // 1. Phân tách theo dấu hai chấm ":" (vd: "Thu trực tiếp: 2.160.000 đ" -> dòng 1: "Thu trực tiếp", dòng 2: "2.160.000 đ")
  if (str.includes(":")) {
    const parts = str.split(":");
    const title = parts[0]?.trim();
    const value = parts.slice(1).join(":").trim();
    return (
      <div className="flex flex-col items-center justify-center text-center leading-tight py-0.5 px-1 max-w-[130px]">
        <span className="text-[9px] text-slate-500 dark:text-slate-400 font-medium tracking-tight whitespace-nowrap">
          {title}
        </span>
        {value && (
          <span className="text-[10px] font-mono font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">
            {value}
          </span>
        )}
      </div>
    );
  }

  // 2. Phân tách theo dấu ngoặc đơn "(...)" (vd: "Doanh thu dịch vụ (HĐ bán)" -> dòng 1: "Doanh thu dịch vụ", dòng 2: "(HĐ bán)")
  if (str.includes("(") && str.includes(")")) {
    const match = str.match(/^(.*?)\s*(\(.*?\))$/);
    if (match) {
      return (
        <div className="flex flex-col items-center justify-center text-center leading-tight py-0.5 px-1 max-w-[130px]">
          <span className="text-[9px] text-slate-700 dark:text-slate-300 font-medium tracking-tight whitespace-nowrap">
            {match[1]?.trim()}
          </span>
          <span className="text-[9px] text-slate-500 dark:text-slate-400 italic whitespace-nowrap">
            {match[2]?.trim()}
          </span>
        </div>
      );
    }
  }

  // 3. Chuỗi bình thường (tự động xuống dòng nếu dài)
  return (
    <div className="text-[10px] font-medium text-slate-800 dark:text-slate-200 text-center py-0.5 px-1 max-w-[130px] leading-tight break-words">
      {str}
    </div>
  );
}

function LabeledSmoothStepEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  label,
}: EdgeProps) {
  let edgePath: string;
  let finalLabelX: number;
  let finalLabelY: number;

  if (targetPosition === Position.Top) {
    // ─── Chiều dọc (Top -> Bottom) ───
    const deltaY = targetY - sourceY;
    const isSkippingStage = deltaY > 360;

    if (isSkippingStage) {
      // Đi đường vòng bên phải ngoài swimlanes
      const bypassX = Math.max(sourceX, targetX) + 180;
      const r = 16;
      const midY1 = sourceY + 45;
      const midY2 = targetY - 45;

      edgePath = `M ${sourceX} ${sourceY} L ${sourceX} ${midY1 - r} Q ${sourceX} ${midY1} ${sourceX + (bypassX > sourceX ? r : -r)} ${midY1} L ${bypassX - (bypassX > sourceX ? r : -r)} ${midY1} Q ${bypassX} ${midY1} ${bypassX} ${midY1 + r} L ${bypassX} ${midY2 - r} Q ${bypassX} ${midY2} ${bypassX + (targetX > bypassX ? r : -r)} ${midY2} L ${targetX - (targetX > bypassX ? r : -r)} ${midY2} Q ${targetX} ${midY2} ${targetX} ${midY2 + r} L ${targetX} ${targetY}`;

      finalLabelX = bypassX;
      finalLabelY = (midY1 + midY2) / 2;
    } else {
      const [path] = getSmoothStepPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
        borderRadius: 16,
      });
      edgePath = path;

      const isStraight = Math.abs(targetX - sourceX) < 10;
      const centerY = (sourceY + targetY) / 2;

      if (isStraight) {
        finalLabelX = targetX;
        finalLabelY = centerY;
      } else {
        // Đặt nhãn tại đoạn dây dọc tiến vào node đích
        finalLabelX = targetX;
        finalLabelY = (centerY + targetY) / 2;
      }
    }
  } else {
    // ─── Chiều ngang (Left -> Right) ───
    const deltaX = targetX - sourceX;
    const isSkippingStage = deltaX > 450;

    if (isSkippingStage) {
      // Đi đường vòng bên dưới ngoài swimlanes
      const bypassLevelY = Math.max(sourceY, targetY) + 65;
      const r = 16;
      const midX1 = sourceX + 60;
      const midX2 = targetX - 60;

      edgePath = `M ${sourceX} ${sourceY} L ${midX1 - r} ${sourceY} Q ${midX1} ${sourceY} ${midX1} ${sourceY + (bypassLevelY > sourceY ? r : -r)} L ${midX1} ${bypassLevelY - (bypassLevelY > sourceY ? r : -r)} Q ${midX1} ${bypassLevelY} ${midX1 + r} ${bypassLevelY} L ${midX2 - r} ${bypassLevelY} Q ${midX2} ${bypassLevelY} ${midX2} ${bypassLevelY + (targetY > bypassLevelY ? r : -r)} L ${midX2} ${targetY - (targetY > bypassLevelY ? r : -r)} Q ${midX2} ${targetY} ${midX2 + r} ${targetY} L ${targetX} ${targetY}`;

      finalLabelX = (midX1 + midX2) / 2;
      finalLabelY = bypassLevelY;
    } else {
      const [path] = getSmoothStepPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
        borderRadius: 16,
      });
      edgePath = path;

      const isStraight = Math.abs(targetY - sourceY) < 10;
      const centerX = (sourceX + targetX) / 2;

      if (isStraight) {
        finalLabelX = centerX;
        finalLabelY = targetY;
      } else {
        // Đặt nhãn tại đoạn dây ngang tiến vào node đích
        finalLabelX = (centerX + targetX) / 2;
        finalLabelY = targetY;
      }
    }
  }

  return (
    <>
      <BaseEdge id={id} path={edgePath} style={style} markerEnd={markerEnd} />
      {label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${finalLabelX}px,${finalLabelY}px)`,
              pointerEvents: "all",
              zIndex: 1000,
            }}
            className="nodrag nopan select-none px-2 py-0.5 rounded-lg bg-white/95 dark:bg-slate-900/95 border border-slate-200/90 dark:border-slate-700 shadow-sm text-slate-800 dark:text-slate-200 backdrop-blur-xs transition-all hover:border-primary/50"
          >
            {renderEdgeLabelContent(label)}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

const NODE_TYPES = {
  traceabilityNode: TraceabilityNodeCard,
  stageGroupNode: StageGroupNodeCard,
};

const EDGE_TYPES = {
  labeledSmoothStep: LabeledSmoothStepEdge,
};

// ─── Graph Layout Auto-Arranger with Stage Swimlanes ──────────────────────────

const CARD_WIDTH = 290;
const STAGE_COL_WIDTH = 330;
const STAGE_HEADER_HEIGHT = 48;
const CARD_ROW_GAP = 145;
const STAGE_COL_GAP = 170;

function computeLayout(
  graphData: TraceabilityGraphData,
  direction: "horizontal" | "vertical" = "horizontal",
  allowEdit?: boolean,
  onAddLink?: (
    stageKey: BusinessStageKey,
    docType?: TraceabilityNodeType,
  ) => void,
  onUnlinkNode?: (node: TraceabilityNode) => void,
  allowedDocTypes?: TraceabilityNodeType[],
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
        style: { width: stageWidth, height: stageHeight },
        selectable: false,
        draggable: false,
        data: {
          stage,
          count,
          width: stageWidth,
          height: stageHeight,
          allowEdit,
          onAddLink,
          allowedDocTypes,
        },
        zIndex: -1,
      });

      // Add Document Nodes inside this Stage Column (Bounded by parent stage group)
      stageDocs.forEach((doc, docIdx) => {
        const docX = (stageWidth - CARD_WIDTH) / 2;
        const docY = STAGE_HEADER_HEIGHT + docIdx * CARD_ROW_GAP;

        nodes.push({
          id: doc.id,
          type: "traceabilityNode",
          parentId: `stage-group-${stage.key}`,
          extent: "parent",
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
      // Vertical Stage Rows (Symmetric, well-spaced)
      const maxStageDocs = Math.max(
        ...activeStages.map((s) => (stageGroupsMap.get(s.key) || []).length),
        1,
      );
      const uniformStageWidth = Math.max(
        780,
        maxStageDocs * (CARD_WIDTH + 30) + 30,
      );
      const stageHeight = 190;
      const STAGE_ROW_GAP = 120;
      const stageX = 0;
      const stageY = stageIdx * (stageHeight + STAGE_ROW_GAP);

      nodes.push({
        id: `stage-group-${stage.key}`,
        type: "stageGroupNode",
        position: { x: stageX, y: stageY },
        style: { width: uniformStageWidth, height: stageHeight },
        selectable: false,
        draggable: false,
        data: {
          stage,
          count,
          width: uniformStageWidth,
          height: stageHeight,
          allowEdit,
          onAddLink,
          allowedDocTypes,
        },
        zIndex: -1,
      });

      stageDocs.forEach((doc, docIdx) => {
        const docX = 20 + docIdx * (CARD_WIDTH + 30);
        const docY = STAGE_HEADER_HEIGHT + 8;

        nodes.push({
          id: doc.id,
          type: "traceabilityNode",
          parentId: `stage-group-${stage.key}`,
          extent: "parent",
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

  // 2. Build Edges with Directional Handles & Clean Floating Labels
  graphData.edges.forEach((e) => {
    edges.push({
      id: e.id,
      source: e.source,
      target: e.target,
      sourceHandle: direction === "vertical" ? "bottom" : "right",
      targetHandle: direction === "vertical" ? "top" : "left",
      type: "labeledSmoothStep",
      label: e.label || undefined,
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 14,
        height: 14,
        color: "#94a3b8",
      },
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
  isFullscreen,
  onToggleDirection,
  onToggleFullscreen,
  allowEdit,
  onAddLink,
  onUnlinkNode,
  allowedDocTypes,
}: {
  graphData: TraceabilityGraphData;
  direction: "horizontal" | "vertical";
  isFullscreen?: boolean;
  onToggleDirection?: () => void;
  onToggleFullscreen?: () => void;
  allowEdit?: boolean;
  onAddLink?: (
    stageKey: BusinessStageKey,
    docType?: TraceabilityNodeType,
  ) => void;
  onUnlinkNode?: (node: TraceabilityNode) => void;
  allowedDocTypes?: TraceabilityNodeType[];
}) {
  const { fitView } = useReactFlow();
  const { nodes: initialNodes, edges: initialEdges } = useMemo(
    () =>
      computeLayout(
        graphData,
        direction,
        allowEdit,
        onAddLink,
        onUnlinkNode,
        allowedDocTypes,
      ),
    [graphData, direction, allowEdit, onAddLink, onUnlinkNode, allowedDocTypes],
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
      allowedDocTypes,
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
    allowedDocTypes,
    fitView,
    setNodes,
    setEdges,
  ]);

  // Re-fit view when transitioning between fullscreen and regular drawer mode
  useEffect(() => {
    const t = setTimeout(() => {
      fitView({ duration: 350, padding: 0.2 });
    }, 120);
    return () => clearTimeout(t);
  }, [isFullscreen, fitView]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      nodeTypes={NODE_TYPES}
      edgeTypes={EDGE_TYPES}
      fitView
      fitViewOptions={{ padding: 0.2 }}
      minZoom={0.45}
      maxZoom={1.25}
      nodesDraggable
      nodesConnectable={false}
      elementsSelectable
      proOptions={{ hideAttribution: true }}
    >
      <Background color="#cbd5e1" gap={20} size={1} />
      <Controls
        showInteractive={false}
        className="!border-slate-200 dark:!border-slate-700 !bg-white dark:!bg-slate-900 !shadow-sm !rounded-lg overflow-hidden !m-3.5"
      >
        {onToggleDirection && (
          <button
            type="button"
            onClick={onToggleDirection}
            className="react-flow__controls-button !flex !items-center !justify-center hover:!bg-slate-100 dark:hover:!bg-slate-800"
            title="Đổi hướng bố cục Ngang/Dọc"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
          </button>
        )}
        {onToggleFullscreen && (
          <button
            type="button"
            onClick={onToggleFullscreen}
            className="react-flow__controls-button !flex !items-center !justify-center hover:!bg-slate-100 dark:hover:!bg-slate-800"
            title={
              isFullscreen ? "Thu nhỏ Canvas (Esc)" : "Toàn màn hình Canvas"
            }
          >
            {isFullscreen ? (
              <Minimize2 className="w-3.5 h-3.5 text-primary" />
            ) : (
              <Maximize2 className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
            )}
          </button>
        )}
      </Controls>
    </ReactFlow>
  );
}

// ─── Pipeline View (Sequential Column Flow) ───────────────────────────────────

function TraceabilityPipelineView({
  graphData,
  allowEdit,
  onAddLink,
  onUnlinkNode,
  allowedDocTypes,
}: {
  graphData: TraceabilityGraphData;
  allowEdit?: boolean;
  onAddLink?: (
    stageKey: BusinessStageKey,
    docType?: TraceabilityNodeType,
  ) => void;
  onUnlinkNode?: (node: TraceabilityNode) => void;
  allowedDocTypes?: TraceabilityNodeType[];
}) {
  const t = useT();

  return (
    <div className="flex items-start gap-4 overflow-x-auto p-4 min-h-[360px] bg-slate-50/50 dark:bg-slate-950/40 rounded-xl border border-slate-200/80">
      {STAGES_CONFIG.map((stage, sIdx) => {
        const stageNodes = graphData.nodes.filter((n) =>
          stage.types.includes(n.docType),
        );

        const validStageTypes = allowedDocTypes
          ? stage.types.filter((t) => allowedDocTypes.includes(t))
          : stage.types;

        const canAddInThisStage = Boolean(
          allowEdit && onAddLink && validStageTypes.length > 0,
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
                  {canAddInThisStage && (
                    <button
                      type="button"
                      onClick={() =>
                        onAddLink?.(
                          stage.key,
                          validStageTypes.length === 1
                            ? validStageTypes[0]
                            : undefined,
                        )
                      }
                      className="text-slate-400 hover:text-slate-700 p-0.5 rounded transition-colors"
                      title={`${t("Ghép nối chứng từ vào")} ${stage.title}`}
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
  allowEdit,
  onUnlinkNode,
}: {
  graphData: TraceabilityGraphData;
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
  allowedDocTypes?: TraceabilityNodeType[];
  onAddLink?: (
    stageKey?: BusinessStageKey,
    docType?: TraceabilityNodeType,
  ) => void;
  onUnlinkNode?: (node: TraceabilityNode) => Promise<void> | void;
  className?: string;
}

export function DrawerDocumentTraceability({
  rootId,
  rootType,
  fetchGraph,
  editMode = false,
  allowedDocTypes,
  onAddLink,
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
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [graphData, setGraphData] = useState<TraceabilityGraphData | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      if (!rootId) return;
      if (!silent) {
        setLoading(!graphData);
      }
      setError(null);
      try {
        const data = await fetchGraphRef.current(rootId);
        setGraphData(data);
      } catch (err: any) {
        setError(err?.message || "Không thể tải đồ thị chứng từ liên đới");
      } finally {
        setLoading(false);
      }
    },
    [rootId, graphData],
  );

  useEffect(() => {
    loadData();
  }, [rootId]);

  useEffect(() => {
    if (!editMode) {
      loadData(true);
    }
  }, [editMode]);

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

      if (editMode) {
        // In editMode, do not reload from BE because changes are client-side only!
        // Optimistically update local graphData
        setGraphData((prev) => {
          if (!prev) return prev;
          const filteredNodes = prev.nodes.filter((n) => n.id !== unlinkedId);
          const filteredEdges = prev.edges.filter(
            (e) => e.source !== unlinkedId && e.target !== unlinkedId,
          );
          return {
            ...prev,
            nodes: filteredNodes,
            edges: filteredEdges,
            summary: {
              ...prev.summary,
              directCount: Math.max(0, (prev.summary?.directCount || 1) - 1),
            },
          };
        });
      } else {
        await loadData(true);
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

  const linkPopoverContent = (
    <div className="p-2.5 min-w-[260px]">
      <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-1 pb-1.5 mb-1 border-b border-slate-100 dark:border-slate-800 font-mono">
        {t("Chọn loại để ghép nối")}
      </div>
      <div className="flex flex-col gap-1 max-h-64 overflow-y-auto">
        {selectableDocTypes.map((type) => {
          const meta = DOC_TYPE_META[type] || {
            label: type,
            fullTitle: type,
            badgeCls: "bg-slate-100 text-slate-700",
          };
          return (
            <button
              key={type}
              type="button"
              onClick={() => {
                setLinkSelectorOpen(false);
                onAddLink?.(undefined, type);
              }}
              className="flex items-center justify-between w-full px-2 py-1.5 rounded-lg text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-colors group"
            >
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border",
                    meta.badgeCls,
                  )}
                >
                  {meta.label}
                </span>
                <span className="text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white">
                  {t(meta.fullTitle)}
                </span>
              </div>
              <Plus className="w-3.5 h-3.5 text-slate-400 group-hover:text-primary transition-colors" />
            </button>
          );
        })}
      </div>
    </div>
  );

  const renderContent = (fullscreen: boolean) => (
    <div
      className={cn(
        "w-full flex flex-col gap-3 transition-all",
        fullscreen
          ? "fixed inset-0 z-[420] bg-white dark:bg-slate-950 p-4 sm:p-6 shadow-2xl overflow-hidden animate-in fade-in duration-200"
          : "py-1",
      )}
    >
      {/* Top Header Bar: Statistics & View Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
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
            onAddLink &&
            (selectableDocTypes.length === 1 ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onAddLink?.(undefined, selectableDocTypes[0])}
                className="h-8 text-xs gap-1.5 text-primary border-primary/30 bg-primary/5 hover:bg-primary/10 font-medium"
                title={t("Ghép nối chứng từ có sẵn")}
              >
                <Link2 className="w-3.5 h-3.5" />
                <span>{t("Ghép nối chứng từ")}</span>
              </Button>
            ) : (
              <Popover
                open={linkSelectorOpen}
                onOpenChange={setLinkSelectorOpen}
                side="bottom"
                align="end"
                content={linkPopoverContent}
              >
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs gap-1.5 text-primary border-primary/30 bg-primary/5 hover:bg-primary/10 font-medium"
                  title={t("Ghép nối chứng từ có sẵn")}
                >
                  <Link2 className="w-3.5 h-3.5" />
                  <span>{t("Ghép nối chứng từ")}</span>
                  <ChevronDown className="w-3 h-3 ml-0.5 opacity-70" />
                </Button>
              </Popover>
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

            {fullscreen && (
              <div className="flex items-center pl-1 border-l border-slate-200 dark:border-slate-700 ml-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="h-6 w-6 text-slate-500 hover:text-slate-900"
                  onClick={() => setIsFullscreen(false)}
                  title={t("Thu nhỏ Canvas (Esc)")}
                >
                  <Minimize2 className="w-3.5 h-3.5 text-primary" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Viewport Content */}
      {loading ? (
        <div
          className={cn(
            "flex flex-col items-center justify-center gap-2 text-slate-400",
            fullscreen ? "flex-1 min-h-[400px]" : "h-[380px]",
          )}
        >
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
            onClick={() => loadData()}
            className="mt-2 text-xs"
          >
            {t("Thử lại")}
          </Button>
        </div>
      ) : !graphData || graphData.nodes.length <= 1 ? (
        <div className="h-[240px] flex flex-col items-center justify-center gap-3 text-slate-400 border border-dashed rounded-xl bg-slate-50/40 p-6 text-center">
          <Network className="w-7 h-7 opacity-40" />
          <span className="text-xs max-w-md text-slate-600 dark:text-slate-400 leading-relaxed">
            {rootType === "INVOICE"
              ? t(
                  "Chưa có chứng từ ghép nối. Hóa đơn là nguồn đối soát chính và có thể ghép nối với sao kê ngân hàng, đơn mua/bán hàng hoặc phiếu dịch vụ.",
                )
              : t("Chưa có chứng từ liên kết trực tiếp hay gián tiếp nào.")}
          </span>
          {effectiveAllowEdit &&
            onAddLink &&
            (selectableDocTypes.length === 1 ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onAddLink?.(undefined, selectableDocTypes[0])}
                className="gap-1.5 text-xs text-primary border-primary/30"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t("Ghép nối chứng từ đầu tiên")}</span>
              </Button>
            ) : (
              <Popover
                open={linkSelectorOpen}
                onOpenChange={setLinkSelectorOpen}
                side="bottom"
                align="center"
                content={linkPopoverContent}
              >
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-xs text-primary border-primary/30"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{t("Ghép nối chứng từ đầu tiên")}</span>
                </Button>
              </Popover>
            ))}
        </div>
      ) : (
        <div
          className={cn(
            "w-full transition-all",
            fullscreen && "flex-1 flex flex-col min-h-0",
          )}
        >
          {viewMode === "canvas" && (
            <div
              className={cn(
                "w-full rounded-xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-950 overflow-hidden relative shadow-2xs transition-all",
                fullscreen
                  ? "flex-1 h-[calc(100vh-110px)] min-h-[500px]"
                  : "h-[500px]",
              )}
            >
              <ReactFlowProvider>
                <CanvasFlowInner
                  graphData={graphData}
                  direction={canvasDirection}
                  isFullscreen={fullscreen}
                  onToggleDirection={() =>
                    setCanvasDirection((d) =>
                      d === "horizontal" ? "vertical" : "horizontal",
                    )
                  }
                  onToggleFullscreen={() => setIsFullscreen((f) => !f)}
                  allowEdit={effectiveAllowEdit}
                  onAddLink={onAddLink}
                  onUnlinkNode={handleRequestUnlink}
                  allowedDocTypes={allowedDocTypes}
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
              allowedDocTypes={allowedDocTypes}
            />
          )}

          {viewMode === "table" && (
            <TraceabilityTableView
              graphData={graphData}
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

  return (
    <>
      <div className={cn("w-full flex flex-col gap-3 py-1", className)}>
        {isFullscreen ? (
          <div className="h-[220px] flex flex-col items-center justify-center gap-3 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-6 text-slate-500 bg-slate-50/50 dark:bg-slate-900/50 text-center">
            <Network className="w-8 h-8 text-primary animate-pulse" />
            <div className="text-xs font-medium text-slate-700 dark:text-slate-200">
              {t("Canvas đang được mở ở chế độ Toàn màn hình.")}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsFullscreen(false)}
              className="text-xs gap-1.5"
            >
              <Minimize2 className="w-3.5 h-3.5" />
              <span>{t("Thu nhỏ lại (Esc)")}</span>
            </Button>
          </div>
        ) : (
          renderContent(false)
        )}
      </div>

      {isFullscreen &&
        typeof document !== "undefined" &&
        createPortal(renderContent(true), document.body)}
    </>
  );
}
