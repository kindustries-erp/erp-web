import { erpInvoicesCoreApi } from "../api/erpInvoicesCoreApi";
import { invoiceFilesV2Api } from "../api/invoiceFilesV2Api";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface PendingUpload {
  file: File;
  documentType: string;
}

/**
 * Áp dụng thay đổi file chờ lưu của form hóa đơn V1 qua API V2.
 * Xóa: id UUID → xóa mềm V2; khóa cũ (không phải UUID) → V1 deletePdf (registrar phản chiếu sang V2).
 * Thêm: gom theo loại tài liệu, mỗi loại một lần upload V2.
 */
export async function flushInvoiceFileChanges(
  invoiceId: string,
  pendingDeleted: string[],
  pendingAdded: PendingUpload[],
): Promise<void> {
  for (const id of pendingDeleted) {
    try {
      if (UUID_RE.test(id)) {
        await invoiceFilesV2Api.remove(invoiceId, id);
      } else {
        await erpInvoicesCoreApi.deletePdf(invoiceId, id);
      }
    } catch (err) {
      console.error("Failed to delete invoice file", id, err);
    }
  }

  const byType = new Map<string, File[]>();
  for (const att of pendingAdded) {
    byType.set(att.documentType, [
      ...(byType.get(att.documentType) ?? []),
      att.file,
    ]);
  }
  for (const [category, files] of byType) {
    try {
      await invoiceFilesV2Api.upload(invoiceId, files, category);
    } catch (err) {
      console.error("Failed to upload invoice files", category, err);
    }
  }
}
