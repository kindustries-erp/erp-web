import {
  PAYMENT_AMOUNT,
  PAYMENT_BADGE,
  PAYMENT_BORDER,
  RECEIPT_AMOUNT,
  RECEIPT_BADGE,
  RECEIPT_BORDER,
  type TraceabilityVisualInput,
  type TraceabilityVisualMeta,
} from "./traceability.visual.tokens";

/** Giao dịch ngoài ERP (nhập tay), nhận diện theo id, nguồn, số chứng từ hoặc nội dung */
export function isManualSettlementNode(node: TraceabilityVisualInput): boolean {
  if (node.docType !== "BANK_TXN") return false;
  if (node.id?.startsWith("manual-")) return true;
  if (node.sourceChannel === "OFF_SYSTEM_MANUAL") return true;
  if (node.docNo?.includes("NGOAI")) return true;
  const text = `${node.title || ""} ${node.partnerName || ""}`.toLowerCase();
  return (
    text.includes("ngoài sổ sách") ||
    text.includes("ngoài erp") ||
    text.includes("tiền ngoài")
  );
}

export function getBankVisualMeta(
  node: TraceabilityVisualInput,
): TraceabilityVisualMeta {
  const title = (node.title || "").toLowerCase();
  const docNo = (node.docNo || "").toUpperCase();
  const isReceipt =
    node.metadata?.isCredit === true ||
    node.metadata?.settlementType === "RECEIPT" ||
    docNo.startsWith("GBC") ||
    docNo.includes("THU") ||
    title.includes("báo có") ||
    title.includes("thu") ||
    title.includes("khoản thu");

  if (isManualSettlementNode(node)) {
    return isReceipt
      ? {
          label: "THU NGOÀI",
          subLabelKey: "v2.traceability.visual.offBook",
          fullTitleKey: "v2.traceability.visual.manualReceipt",
          badgeCls: RECEIPT_BADGE,
          cardBorderCls: RECEIPT_BORDER,
          isReceipt: true,
          amountCls: RECEIPT_AMOUNT,
          amountPrefix: "+",
        }
      : {
          label: "CHI NGOÀI",
          subLabelKey: "v2.traceability.visual.offBook",
          fullTitleKey: "v2.traceability.visual.manualPayment",
          badgeCls: PAYMENT_BADGE,
          cardBorderCls: PAYMENT_BORDER,
          isPayment: true,
          amountCls: PAYMENT_AMOUNT,
          amountPrefix: "-",
        };
  }

  const isCash =
    node.metadata?.sourceType === "CASH" ||
    title.includes("sổ quỹ") ||
    title.includes("phiếu");

  if (isReceipt) {
    return {
      label: isCash ? "PHIẾU THU" : "GBC",
      subLabelKey: isCash
        ? "v2.traceability.visual.cash"
        : "v2.traceability.visual.creditAdvice",
      fullTitleKey: isCash
        ? "v2.traceability.visual.cashReceipt"
        : "v2.traceability.visual.bankCredit",
      badgeCls: RECEIPT_BADGE,
      cardBorderCls: RECEIPT_BORDER,
      isReceipt: true,
      amountCls: RECEIPT_AMOUNT,
      amountPrefix: "+",
    };
  }
  return {
    label: isCash ? "PHIẾU CHI" : "UNC",
    subLabelKey: isCash
      ? "v2.traceability.visual.cash"
      : "v2.traceability.visual.paymentOrder",
    fullTitleKey: isCash
      ? "v2.traceability.visual.cashPayment"
      : "v2.traceability.visual.bankPayment",
    badgeCls: PAYMENT_BADGE,
    cardBorderCls: PAYMENT_BORDER,
    isPayment: true,
    amountCls: PAYMENT_AMOUNT,
    amountPrefix: "-",
  };
}
