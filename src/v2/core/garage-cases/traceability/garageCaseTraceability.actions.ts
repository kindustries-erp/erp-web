import {
  resolveLinkTargetDocType,
  type TraceabilityNode,
  type TraceabilityNodeType,
  type TraceabilityStageKey,
} from "@/v2/shared/components/organisms/v2-document-traceability";
import type {
  GarageAddLinkAction,
  GarageCaseLinkedInvoice,
  GarageCaseSettlement,
  GarageUnlinkTarget,
} from "./garageCaseTraceability.type";

/** Chọn hành động khi bấm "thêm liên kết": mặc định (không rõ loại) là thêm khoản thu/chi */
export function resolveGarageAddLink(
  stageKey?: TraceabilityStageKey,
  docType?: TraceabilityNodeType,
): GarageAddLinkAction {
  const target = resolveLinkTargetDocType(stageKey, docType);
  if (target === "INVOICE") return "ADD_INVOICE";
  if (target === "PURCHASE_ORDER") return "PO_UNSUPPORTED";
  if (target === "SALES_ORDER") return "SO_UNSUPPORTED";
  return "ADD_SETTLEMENT";
}

const invoiceIdOf = (inv: GarageCaseLinkedInvoice): string | undefined =>
  inv.invoiceId || inv.id || inv.invoice?.id;

/** Tìm đối tượng cần gỡ ứng với node bị gỡ; null nếu node không gỡ được ở phiếu này */
export function resolveGarageUnlink(
  node: TraceabilityNode,
  settlements: GarageCaseSettlement[],
  invoices: GarageCaseLinkedInvoice[],
): GarageUnlinkTarget | null {
  if (node.docType === "INVOICE") {
    const found = invoices.find((inv) => invoiceIdOf(inv) === node.id);
    return found ? { kind: "INVOICE", id: node.id } : null;
  }
  if (node.docType === "BANK_TXN") {
    const found = settlements.find((s) =>
      [
        s.id,
        s.tempId,
        s.id && `manual-${s.id}`,
        s.tempId && `manual-${s.tempId}`,
        s.bank_transaction_id,
        s.bankTransactionId,
      ].includes(node.id),
    );
    const id = found?.id ?? found?.tempId;
    return id ? { kind: "SETTLEMENT", id } : null;
  }
  return null;
}
