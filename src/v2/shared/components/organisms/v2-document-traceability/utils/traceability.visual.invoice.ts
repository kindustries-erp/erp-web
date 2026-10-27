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
    cls: "bg-warning-bg text-warning border-warning/30   ",
  },
  2: {
    key: "v2.traceability.taxStatus.replacing",
    cls: "bg-primary/10 text-primary border-primary/30   ",
  },
  5: {
    key: "v2.traceability.taxStatus.adjustedByOther",
    cls: "bg-muted text-muted-fg border-border   ",
  },
  4: {
    key: "v2.traceability.taxStatus.replacedByOther",
    cls: "bg-muted text-muted-fg border-border   ",
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
