import React from "react";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { V2TableText } from "@/v2/shared/components/molecules/v2-table-text";
import type { V2Column } from "@/v2/shared/components/organisms/v2-standard-table";
import { TableColumnAlign } from "@/v2/shared/types/v2-table";
import { cn } from "@/v2/shared/utils/cn";
import type { TranslateFn } from "../../types/traceability.flow.type";
import type { TraceabilityNode } from "../../types/traceability.type";
import { canOpenTraceNode } from "../../utils/traceability.access";
import {
  formatTraceAmount,
  formatTraceDate,
} from "../../utils/traceability.format";
import { getTraceabilityVisualMeta } from "../../utils/traceability.visual";

export interface TraceTableColumnOptions {
  t: TranslateFn;
  allowEdit: boolean;
  onOpen: (node: TraceabilityNode) => void;
}

/** Số tiền có dấu theo chiều thu/chi; `value` là số đã chọn (gốc hoặc đã cấn trừ) */
function renderSignedAmount(node: TraceabilityNode, value: number) {
  if (node.restricted)
    return <span className="font-mono text-xs text-slate-400">***</span>;
  if (!value) return <span className="text-xs text-slate-400">—</span>;
  const meta = getTraceabilityVisualMeta(node);
  const text = `${meta.amountPrefix ?? ""}${formatTraceAmount(value)}`;
  return (
    <span
      className={cn(
        "font-mono text-xs",
        meta.amountCls ?? "font-semibold text-slate-900 dark:text-slate-100",
      )}
    >
      {text}
    </span>
  );
}

/** Cột của bảng kê chứng từ liên kết (STT do V2StandardTable tự thêm) */
export function buildTraceTableColumns({
  t,
  allowEdit,
  onOpen,
}: TraceTableColumnOptions): V2Column<TraceabilityNode>[] {
  const amountOf = (node: TraceabilityNode) =>
    node.restricted ? 0 : Number(node.amount || 0);
  const netOffOf = (node: TraceabilityNode) =>
    node.restricted ? 0 : Number(node.netOffAmount || 0);

  return [
    {
      key: "docType",
      label: t("v2.traceability.table.col.type"),
      size: 110,
      cell: (node) => {
        const meta = getTraceabilityVisualMeta(node);
        return (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded border px-1.5 py-0.5 font-mono text-[10px] font-semibold",
              meta.badgeCls,
            )}
            title={t(meta.fullTitleKey)}
          >
            {meta.isInvoiceIn && (
              <ArrowDownLeft className="h-2.5 w-2.5 opacity-70" />
            )}
            {meta.isInvoiceOut && (
              <ArrowUpRight className="h-2.5 w-2.5 opacity-70" />
            )}
            {meta.label}
          </span>
        );
      },
    },
    {
      key: "date",
      label: t("v2.traceability.table.col.date"),
      size: 110,
      align: TableColumnAlign.RIGHT,
      cell: (node) => (
        <span className="font-mono text-xs text-slate-500">
          {formatTraceDate(node.date)}
        </span>
      ),
    },
    {
      key: "docNo",
      label: t("v2.traceability.table.col.docNo"),
      size: 160,
      cell: (node) => {
        const canOpen = canOpenTraceNode(node, allowEdit);
        return (
          <V2TableText
            text={node.docNo || "—"}
            enableCopy
            tooltip
            onDetailClick={canOpen ? () => onOpen(node) : undefined}
            className={cn(
              "font-mono text-xs font-medium",
              canOpen ? "text-primary" : "text-slate-900 dark:text-slate-100",
            )}
          />
        );
      },
    },
    {
      key: "partner",
      label: t("v2.traceability.table.col.partner"),
      size: 260,
      accessor: (node) => node.partnerName || node.title || "",
      cell: (node) =>
        node.restricted ? (
          <span className="text-xs italic text-slate-400">
            {t("v2.traceability.node.restricted")}
          </span>
        ) : (
          <V2TableText
            text={node.partnerName || node.title || "—"}
            enableCopy
            tooltip
            className="text-xs text-slate-700 dark:text-slate-300"
          />
        ),
    },
    {
      key: "amount",
      label: t("v2.traceability.table.col.amount"),
      size: 140,
      align: TableColumnAlign.RIGHT,
      summary: {
        variant: "amount",
        label: t("v2.traceability.table.totalLabel"),
        accessor: amountOf,
      },
      cell: (node) => renderSignedAmount(node, amountOf(node)),
    },
    {
      key: "netOffAmount",
      label: t("v2.traceability.table.col.netOff"),
      size: 140,
      align: TableColumnAlign.RIGHT,
      summary: { variant: "amount", accessor: netOffOf },
      cell: (node) => renderSignedAmount(node, netOffOf(node)),
    },
  ];
}
