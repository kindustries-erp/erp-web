import {
  resolveLinkTargetDocType,
  type TraceabilityNodeType,
} from "@/v2/shared/components/organisms/v2-document-traceability";

export type InvoiceAddLinkAction =
  | "OPEN_NETOFF"
  | "OPEN_PO"
  | "OPEN_SO"
  | "OPEN_GARAGE_CASE";

/** Loại chứng từ khi gỡ liên kết khỏi hóa đơn (khớp `pendingDocumentChanges` của API) */
export type InvoiceDocumentChangeType = "BANK" | "PO" | "CASE" | "SO";

export interface InvoicePendingDocumentChange {
  type: InvoiceDocumentChangeType;
  action: "REMOVE";
  refId: string;
}

const CHANGE_TYPE_BY_DOC_TYPE: Partial<
  Record<TraceabilityNodeType, InvoiceDocumentChangeType>
> = {
  BANK_TXN: "BANK",
  PURCHASE_ORDER: "PO",
  GARAGE_CASE: "CASE",
  SALES_ORDER: "SO",
};

/** Chọn modal mở khi bấm "thêm liên kết"; không rõ loại thì mở modal cấn trừ */
export function resolveInvoiceAddLink(
  stageKey?: string,
  docType?: TraceabilityNodeType,
): InvoiceAddLinkAction {
  switch (resolveLinkTargetDocType(stageKey, docType)) {
    case "PURCHASE_ORDER":
      return "OPEN_PO";
    case "SALES_ORDER":
      return "OPEN_SO";
    case "GARAGE_CASE":
      return "OPEN_GARAGE_CASE";
    default:
      return "OPEN_NETOFF";
  }
}

/** Thay đổi chờ lưu khi gỡ node; null nếu loại chứng từ không gỡ được khỏi hóa đơn */
export function toPendingDocumentChange(node: {
  id: string;
  docType: TraceabilityNodeType;
}): InvoicePendingDocumentChange | null {
  const type = CHANGE_TYPE_BY_DOC_TYPE[node.docType];
  return type ? { type, action: "REMOVE", refId: node.id } : null;
}
