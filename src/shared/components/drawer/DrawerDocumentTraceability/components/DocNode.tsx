import React, { useState } from "react";
import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import { cn } from "@/shared/utils";
import { useT } from "@/core/i18n";
import {
  ExternalLink,
  Lock,
  Copy,
  Check,
  Trash2,
  Edit3,
  ArrowDownLeft,
  ArrowUpRight,
} from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { money, formatGMT7 } from "@/shared/utils/format";
import {
  getNodeVisualMeta,
  isManualSettlementNode,
  openGlobalErpDocument,
} from "../constants";
import type { NodeCardCustomData } from "../types";

export { isManualSettlementNode };

async function copyToClipboard(text: string): Promise<boolean> {
  if (!text) return false;
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fallback below
  }

  try {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.top = "0";
    textArea.style.left = "-999999px";
    textArea.style.opacity = "0";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand("copy");
    document.body.removeChild(textArea);
    return successful;
  } catch {
    return false;
  }
}

export function TraceabilityNodeCard({
  data,
  selected,
}: NodeProps<Node<NodeCardCustomData>>) {
  const t = useT();
  const node = data as NodeCardCustomData;
  const visualMeta = getNodeVisualMeta(node);

  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (node.docNo && node.docNo !== "***") {
      const ok = await copyToClipboard(node.docNo);
      if (ok) {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }
    }
  };

  const isJournalEntry = node.docType === "JOURNAL_ENTRY";
  const isManual = isManualSettlementNode(node);

  const handleOpenDetail = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (node.restricted || node.hasPermission === false) return;

    if (isJournalEntry) {
      // Sổ kế toán chưa làm tới, không mở drawer
      return;
    }

    if (isManual) {
      // Chỉ mở modal chỉnh sửa thu chi ngoài khi ở chế độ Edit
      if (!node.allowEdit) return;

      if (node.onEditManualSettlement) {
        node.onEditManualSettlement(node);
      } else {
        window.dispatchEvent(
          new CustomEvent("open_manual_settlement_editor", {
            detail: { node },
          }),
        );
      }
      return;
    }

    // Các chứng từ khác mở qua Global Drawer
    openGlobalErpDocument(node.docType, node.id);
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

  // Determine amount string & style
  const amtNumber = Number(node.netOffAmount || node.amount || 0);
  const formattedAmt = money(amtNumber);

  let amountDisplay = formattedAmt;
  let amountClassName = "text-slate-800 dark:text-slate-200 font-semibold";

  if (visualMeta.isReceipt) {
    amountDisplay = `+${formattedAmt}`;
    amountClassName = "text-emerald-600 dark:text-emerald-400 font-bold";
  } else if (visualMeta.isPayment) {
    amountDisplay = `-${formattedAmt}`;
    amountClassName = "text-[#ea580c] dark:text-orange-400 font-bold";
  } else if (node.netOffAmount) {
    amountClassName = "text-emerald-700 dark:text-emerald-400 font-semibold";
  }

  // Display subtitle / partner
  let subtitleText = node.partnerName || node.title || "—";
  if (visualMeta.isInvoiceIn && node.partnerName) {
    subtitleText = `NCC: ${node.partnerName}`;
  } else if (visualMeta.isInvoiceOut && node.partnerName) {
    subtitleText = `KH: ${node.partnerName}`;
  }

  return (
    <div
      onDoubleClick={handleOpenDetail}
      className={cn(
        "w-[290px] rounded-xl bg-white dark:bg-slate-900 transition-all duration-200 group text-left relative z-10 cursor-pointer overflow-hidden",
        visualMeta.cardBorderCls,
        node.isCurrent
          ? "ring-2 ring-slate-900 dark:ring-slate-100 border-2 border-slate-700 dark:border-slate-300 shadow-md"
          : selected
            ? "border-2 border-slate-800 dark:border-slate-200 shadow-md ring-2 ring-slate-800/15 dark:ring-slate-200/15"
            : "border border-slate-200/90 dark:border-slate-800 shadow-2xs hover:border-slate-400 dark:hover:border-slate-600 hover:shadow-sm",
        node.restricted &&
          "border-dashed border-slate-300 bg-slate-50/70 dark:bg-slate-900/50 opacity-80 cursor-default",
      )}
    >
      {/* Directional Connection Handles */}
      <Handle
        type="target"
        id="left"
        position={Position.Left}
        className="w-3 h-3 !bg-slate-400 border-2 border-white opacity-0 group-hover:opacity-100 transition-opacity z-30 cursor-crosshair"
      />
      <Handle
        type="source"
        id="right"
        position={Position.Right}
        className="w-3 h-3 !bg-slate-400 border-2 border-white opacity-0 group-hover:opacity-100 transition-opacity z-30 cursor-crosshair"
      />
      <Handle
        type="target"
        id="top"
        position={Position.Top}
        className="w-3 h-3 !bg-slate-400 border-2 border-white opacity-0 group-hover:opacity-100 transition-opacity z-30 cursor-crosshair"
      />
      <Handle
        type="source"
        id="bottom"
        position={Position.Bottom}
        className="w-3 h-3 !bg-slate-400 border-2 border-white opacity-0 group-hover:opacity-100 transition-opacity z-30 cursor-crosshair"
      />

      {/* Top Header Row */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100 dark:border-slate-800/80 gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <span
            className={cn(
              "px-1.5 py-0.5 rounded text-[10px] font-bold border font-mono tracking-wider flex items-center gap-1",
              visualMeta.badgeCls,
            )}
            title={visualMeta.fullTitle}
          >
            {visualMeta.isInvoiceIn && (
              <ArrowDownLeft className="w-2.5 h-2.5 opacity-80" />
            )}
            {visualMeta.isInvoiceOut && (
              <ArrowUpRight className="w-2.5 h-2.5 opacity-80" />
            )}
            {visualMeta.label}
          </span>
          <span className="font-mono text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
            {node.docNo}
          </span>
          {node.docNo !== "***" && (
            <button
              type="button"
              onClick={handleCopy}
              onPointerDown={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              className="nodrag nopan text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded transition-colors"
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
              className="h-6 w-6 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors nodrag nopan"
              title={t("Gỡ liên kết chứng từ này")}
              onClick={handleUnlink}
              onPointerDown={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
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
          ) : !node.isCurrent &&
            !isJournalEntry &&
            (!isManual || node.allowEdit) ? (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="h-6 w-6 text-slate-400 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors nodrag nopan"
              title={
                isManual
                  ? t("Chỉnh sửa thu / chi ngoài")
                  : t("Mở chi tiết chứng từ")
              }
              onClick={handleOpenDetail}
              onPointerDown={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
            >
              {isManual ? (
                <Edit3 className="w-3.5 h-3.5 text-primary" />
              ) : (
                <ExternalLink className="w-3.5 h-3.5" />
              )}
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
            subtitleText
          )}
        </div>

        <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 dark:border-slate-800/60 font-mono">
          <span className="text-[11px] text-slate-400 font-sans">
            {node.date ? formatGMT7(node.date, "date") : "—"}
          </span>

          <div className="flex items-center gap-1.5 font-mono">
            {node.restricted ? (
              <span className="text-slate-400 font-normal">***</span>
            ) : (
              <span className={amountClassName} title={visualMeta.fullTitle}>
                {amountDisplay}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
