import type { InvoiceFileV2 } from "@/modules/erp-invoices-core/api/invoiceFilesV2Api";
import type {
  NormalizedInvoiceDocument,
  PendingAttachment,
} from "./InvoiceDocumentWorkspace.type";

/**
 * Chuẩn hóa danh sách tài liệu từ API V2 (đã gồm dữ liệu cũ được backfill) cộng tệp chờ lưu.
 * `isLegacy` giữ tên cũ để hiện nhãn "PDF gốc", nay lấy từ `isOriginal` của V2.
 * File XML thuần không hiện (giữ hành vi cũ); gói zip của nhà cung cấp vẫn hiện.
 */
export function normalizeInvoiceDocuments(
  files: InvoiceFileV2[] = [],
  pendingAddedAttachments: PendingAttachment[] = [],
  pendingDeletedPdfs: string[] = [],
): NormalizedInvoiceDocument[] {
  const list: NormalizedInvoiceDocument[] = files
    .filter((f) => !/\.xml$/i.test(f.fileName))
    .map((f) => ({
      id: f.id,
      name: f.fileName,
      mimeType: f.mimeType ?? undefined,
      documentType: f.category,
      size: f.fileSize > 0 ? f.fileSize : undefined,
      isLegacy: f.isOriginal,
      uploadedAt: f.createdAt,
      attachmentId: f.id,
    }));

  pendingAddedAttachments.forEach((p, i) => {
    list.push({
      id: `pending-${i}-${p.file.name}`,
      name: p.file.name,
      mimeType: p.file.type,
      documentType: p.documentType,
      size: p.file.size,
      isPending: true,
      fileObj: p.file,
    });
  });

  return list.filter((doc) => !pendingDeletedPdfs.includes(doc.id));
}
