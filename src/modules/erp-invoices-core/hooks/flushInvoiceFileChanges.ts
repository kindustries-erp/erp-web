import { invoiceFilesV2Api } from "../api/invoiceFilesV2Api";

export interface PendingUpload {
  file: File;
  documentType: string;
}

/**
 * Áp dụng thay đổi file chờ lưu của form hóa đơn V1 qua API V2.
 * Xóa: id file V2 → xóa mềm V2.
 * Thêm: gom theo loại tài liệu, mỗi loại một lần upload V2.
 */
export async function flushInvoiceFileChanges(
  invoiceId: string,
  pendingDeleted: string[],
  pendingAdded: PendingUpload[],
): Promise<void> {
  for (const id of pendingDeleted) {
    try {
      await invoiceFilesV2Api.remove(invoiceId, id);
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
