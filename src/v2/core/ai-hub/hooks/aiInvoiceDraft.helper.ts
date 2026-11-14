import type {
  AiCreateRequestPayload,
  AiInvoiceDraftLine,
  AiInvoicePreview,
} from "../aiHub.type";

/** Dòng xem trước của server -> dòng nháp sửa được trong khung chat. */
export function toDraftLines(preview: AiInvoicePreview): AiInvoiceDraftLine[] {
  return preview.lines.map((line, index) => ({
    ...line,
    key: `line-${index}`,
    itemCode: line.itemCode ?? "",
  }));
}

/** Dòng hợp lệ để tạo đề nghị: có tên và số lượng dương. */
export const isValidDraftLine = (line: AiInvoiceDraftLine): boolean =>
  line.itemName.trim().length > 0 &&
  line.qtyRequested !== null &&
  line.qtyRequested > 0;

/** Ngày hôm nay theo giờ máy, dạng YYYY-MM-DD. */
export function todayIso(now: Date = new Date()): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

export interface AiRequestContext {
  branchId?: string;
  branchName?: string;
  requestDate?: string;
}

/** Gom dòng nháp hợp lệ thành payload tạo đề nghị mua. */
export function toCreateRequestPayload(
  preview: AiInvoicePreview,
  lines: AiInvoiceDraftLine[],
  context: AiRequestContext = {},
): AiCreateRequestPayload {
  return {
    ...(context.branchId ? { branchId: context.branchId } : {}),
    ...(context.branchName ? { branchName: context.branchName } : {}),
    requestDate: context.requestDate ?? todayIso(),
    ...(preview.invoice.invoiceNo
      ? { invoiceNo: preview.invoice.invoiceNo }
      : {}),
    ...(preview.invoice.sellerName
      ? { sellerName: preview.invoice.sellerName }
      : {}),
    lines: lines.filter(isValidDraftLine).map((line) => ({
      itemName: line.itemName.trim(),
      ...(line.itemCode.trim() ? { itemCode: line.itemCode.trim() } : {}),
      ...(line.unit ? { unit: line.unit } : {}),
      itemType: line.itemType,
      qtyRequested: line.qtyRequested as number,
      ...(line.estUnitPrice !== null
        ? { estUnitPrice: line.estUnitPrice }
        : {}),
    })),
  };
}
