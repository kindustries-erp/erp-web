import {
  PAYMENT_BADGE,
  PAYMENT_BORDER,
  RECEIPT_BADGE,
  RECEIPT_BORDER,
  type TraceabilityVisualInput,
  type TraceabilityVisualMeta,
} from "./traceability.visual.tokens";

const TAX_STATUS_VISUAL: Record<number, { key: string; cls: string }> = {
  3: {
    key: "v2.traceability.taxStatus.adjusted",
    cls: "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-700",
  },
  2: {
    key: "v2.traceability.taxStatus.replacing",
    cls: "bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-700",
  },
  5: {
    key: "v2.traceability.taxStatus.adjustedByOther",
    cls: "bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
  },
  4: {
    key: "v2.traceability.taxStatus.replacedByOther",
    cls: "bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
  },
};

export function getInvoiceVisualMeta(
  node: TraceabilityVisualInput,
): TraceabilityVisualMeta {
  const title = (node.title || "").toLowerCase();
  const isOut =
    node.metadata?.direction === "OUT" ||
    node.metadata?.linkType === "OUT" ||
    title.includes("đầu ra") ||
    title.includes("bán");
  const taxStatus = TAX_STATUS_VISUAL[Number(node.metadata?.taxInvoiceStatus)];
  const statusVisual = taxStatus
    ? { statusLabelKey: taxStatus.key, statusBadgeCls: taxStatus.cls }
    : {};

  if (isOut) {
    return {
      label: "HĐ BÁN",
      subLabelKey: "v2.traceability.visual.outbound",
      fullTitleKey: "v2.traceability.visual.invoiceOut",
      badgeCls: RECEIPT_BADGE,
      cardBorderCls: RECEIPT_BORDER,
      isInvoiceOut: true,
      ...statusVisual,
    };
  }
  return {
    label: "HĐ MUA",
    subLabelKey: "v2.traceability.visual.inbound",
    fullTitleKey: "v2.traceability.visual.invoiceIn",
    badgeCls: PAYMENT_BADGE,
    cardBorderCls: PAYMENT_BORDER,
    isInvoiceIn: true,
    ...statusVisual,
  };
}
