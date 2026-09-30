import type { ErpInvoice } from "@/modules/erp-invoices-core/api/erpInvoicesCoreApi";
import type { NormalizedInvoiceDocument, PendingAttachment } from "../types";

export function normalizeInvoiceDocuments(
  detailInvoice: ErpInvoice | null,
  pendingAddedAttachments: PendingAttachment[] = [],
  pendingDeletedPdfs: string[] = [],
): NormalizedInvoiceDocument[] {
  const list: NormalizedInvoiceDocument[] = [];

  if (detailInvoice?.pdfFileKey) {
    list.push({
      id: detailInvoice.pdfFileKey,
      name: detailInvoice.pdfFileKey.split("/").pop() || "Hóa đơn PDF",
      fileKey: detailInvoice.pdfFileKey,
      mimeType: "application/pdf",
      documentType: "HOA_DON",
      isLegacy: true,
    });
  }

  if (detailInvoice?.pdfFiles && detailInvoice.pdfFiles.length > 0) {
    for (const f of detailInvoice.pdfFiles) {
      if (f.key && !list.some((item) => item.id === f.key)) {
        list.push({
          id: f.key,
          name: f.filename || f.key.split("/").pop() || "Hóa đơn PDF",
          fileKey: f.key,
          mimeType: "application/pdf",
          documentType: "HOA_DON",
          isLegacy: true,
          uploadedAt: f.uploadedAt,
        });
      }
    }
  }

  if (detailInvoice?.attachments && detailInvoice.attachments.length > 0) {
    for (const item of detailInvoice.attachments) {
      const att = item.attachment;
      if (att && !list.some((existing) => existing.id === att.id)) {
        list.push({
          id: att.id,
          name: att.fileName || "Tài liệu đính kèm",
          fileKey: att.fileKey,
          mimeType: att.mimeType,
          documentType: att.documentType || "HOA_DON",
          size: att.fileSize,
          isLegacy: false,
          attachmentId: att.id,
        });
      }
    }
  }

  for (let i = 0; i < pendingAddedAttachments.length; i++) {
    const p = pendingAddedAttachments[i];
    list.push({
      id: `pending-${i}-${p.file.name}`,
      name: p.file.name,
      mimeType: p.file.type,
      documentType: p.documentType,
      size: p.file.size,
      isPending: true,
      fileObj: p.file,
    });
  }

  return list.filter((doc) => !pendingDeletedPdfs.includes(doc.id));
}
