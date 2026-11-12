export type AiInvoiceMatchStatus = "MATCHED" | "NEW";

export interface AiInvoiceHeader {
  sellerName: string | null;
  sellerTaxCode: string | null;
  invoiceNo: string | null;
  invoiceDate: string | null;
  total: number | null;
}

export interface AiInvoicePreviewLine {
  itemName: string;
  /** Mã đã khớp hoặc mã đề xuất; `null` nghĩa là server sinh mã khi tạo */
  itemCode: string | null;
  unit: string | null;
  qtyRequested: number;
  estUnitPrice: number | null;
  itemType: string;
  lineType: "GOODS" | "SERVICE";
  match: {
    status: AiInvoiceMatchStatus;
    matchedBy?: "CODE" | "NAME";
    itemId?: string;
    catalogItemName?: string;
  };
}

export interface AiInvoicePreview {
  invoice: AiInvoiceHeader;
  lines: AiInvoicePreviewLine[];
  /** Mã cảnh báo, dịch qua `v2.aiHub.warning.<mã>` */
  warnings: string[];
  ai: { tier: string; model: string; latencyMs: number };
}

/** Dòng người dùng đang rà soát trong khung chat (sửa được mã và số lượng). */
export interface AiInvoiceDraftLine extends Omit<
  AiInvoicePreviewLine,
  "itemCode" | "qtyRequested"
> {
  key: string;
  itemCode: string;
  qtyRequested: number | null;
}

export interface AiCreateRequestPayload {
  branchId?: string;
  branchName?: string;
  requestDate: string;
  invoiceNo?: string;
  sellerName?: string;
  lines: Array<{
    itemName: string;
    itemCode?: string;
    unit?: string;
    itemType?: string;
    qtyRequested: number;
    estUnitPrice?: number;
  }>;
}

export interface AiCreateRequestResult {
  requestId: string;
  requestNo: string;
  createdItems: Array<{ id: string; itemCode: string; itemName: string }>;
}

/** Cổng gọi API trợ lý hóa đơn; module truyền bản đã gắn đường dẫn của mình. */
export interface AiInvoiceApi {
  previewInvoice: (
    file: File,
    signal?: AbortSignal,
  ) => Promise<AiInvoicePreview>;
  createRequest: (
    payload: AiCreateRequestPayload,
  ) => Promise<AiCreateRequestResult>;
}

export type AiInvoiceStep = "idle" | "reading" | "review" | "creating" | "done";
