import React, { useEffect, useState } from "react";
import type { NodeProps } from "@xyflow/react";
import { Lock } from "lucide-react";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { cn } from "@/v2/shared/utils/cn";
import type { TraceDocFlowNode } from "../../types/traceability.flow.type";
import {
  getTraceabilityVisualMeta,
  isManualSettlementNode,
} from "../../utils/traceability.visual";
import { copyText } from "../../utils/traceability.copy";
import {
  formatTraceAmount,
  formatTraceDate,
} from "../../utils/traceability.format";
import { V2TraceNodeHandles } from "./V2TraceNodeHandles";
import { V2TraceNodeHeader } from "./V2TraceNodeHeader";

const COPIED_MS = 1500;

/** Thẻ một chứng từ: nhãn loại, số chứng từ, đối tác, ngày và số tiền */
export function V2TraceNode({ data, selected }: NodeProps<TraceDocFlowNode>) {
  const { t } = useV2Translation();
  const { node, allowEdit, actions } = data;
  const meta = getTraceabilityVisualMeta(node);
  const isJournal = node.docType === "JOURNAL_ENTRY";
  const isManual = isManualSettlementNode(node);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), COPIED_MS);
    return () => clearTimeout(timer);
  }, [copied]);

  // Mở được khi có quyền; giao dịch nhập tay chỉ mở để sửa khi đang ở chế độ sửa
  const canOpen =
    !node.restricted &&
    node.hasPermission !== false &&
    !isJournal &&
    (!isManual || allowEdit);
  const canUnlink =
    allowEdit &&
    !node.isCurrent &&
    !node.restricted &&
    node.depth === 1 &&
    Boolean(actions.onUnlinkNode);

  const handleOpen = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (!canOpen) return;
    if (isManual) actions.onEditManualSettlement?.(node);
    else actions.onOpenDocument?.(node);
  };

  const handleCopy = async (event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    if (await copyText(node.docNo)) setCopied(true);
  };

  const handleUnlink = (event: React.MouseEvent) => {
    event.stopPropagation();
    actions.onUnlinkNode?.(node);
  };

  const amount = Number(node.netOffAmount || node.amount || 0);
  const amountText = `${meta.amountPrefix ?? ""}${formatTraceAmount(amount)}`;
  const amountCls =
    meta.amountCls ??
    (node.netOffAmount
      ? "text-emerald-700 dark:text-emerald-400 font-semibold"
      : "text-slate-800 dark:text-slate-200 font-semibold");

  const partner = node.partnerName || node.title || "—";
  const subtitle =
    meta.isInvoiceIn && node.partnerName
      ? `${t("v2.traceability.node.supplierPrefix")} ${partner}`
      : meta.isInvoiceOut && node.partnerName
        ? `${t("v2.traceability.node.customerPrefix")} ${partner}`
        : partner;

  return (
    <div
      onDoubleClick={handleOpen}
      className={cn(
        "group relative z-10 w-[290px] cursor-pointer overflow-hidden rounded-xl bg-white text-left transition-all duration-200 dark:bg-slate-900",
        meta.cardBorderCls,
        node.isCurrent
          ? "border-2 border-slate-700 shadow-md ring-2 ring-slate-900 dark:border-slate-300 dark:ring-slate-100"
          : selected
            ? "border-2 border-slate-800 shadow-md ring-2 ring-slate-800/15 dark:border-slate-200 dark:ring-slate-200/15"
            : "border border-slate-200/90 shadow-2xs hover:border-slate-400 hover:shadow-sm dark:border-slate-800 dark:hover:border-slate-600",
        node.restricted &&
          "cursor-default border-dashed border-slate-300 bg-slate-50/70 opacity-80 dark:bg-slate-900/50",
      )}
    >
      <V2TraceNodeHandles />
      <V2TraceNodeHeader
        meta={meta}
        docNo={node.docNo}
        copied={copied}
        isCurrent={Boolean(node.isCurrent)}
        restricted={Boolean(node.restricted)}
        requiredResource={node.requiredResource}
        canUnlink={canUnlink}
        canOpen={canOpen}
        isManual={isManual}
        statusLabel={meta.statusLabelKey ? t(meta.statusLabelKey) : undefined}
        onCopy={handleCopy}
        onUnlink={handleUnlink}
        onOpen={handleOpen}
        t={t}
      />

      <div className="space-y-2 p-3">
        <div className="line-clamp-1 text-[11px] text-slate-500 dark:text-slate-400">
          {node.restricted ? (
            <span className="flex items-center gap-1 italic text-slate-400">
              <Lock className="h-3 w-3" />{" "}
              {t("v2.traceability.node.restricted")}
            </span>
          ) : (
            subtitle
          )}
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 pt-1 font-mono text-xs dark:border-slate-800/60">
          <span className="font-sans text-[11px] text-slate-400">
            {formatTraceDate(node.date)}
          </span>
          {node.restricted ? (
            <span className="font-normal text-slate-400">***</span>
          ) : (
            <span className={amountCls} title={t(meta.fullTitleKey)}>
              {amountText}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
