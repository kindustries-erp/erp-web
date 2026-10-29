import type { FileEntry, FilePreviewStatus } from "./invoiceXmlUpload.type";

export function createClientId(): string {
  const maybeCrypto = (globalThis as any)?.crypto;
  if (maybeCrypto && typeof maybeCrypto.randomUUID === "function") {
    return maybeCrypto.randomUUID();
  }
  return `tmp-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function getBaseName(fileName: string): string {
  return fileName.substring(0, fileName.lastIndexOf(".")).toLowerCase();
}

/** Phân loại file ở bước preview (client-side, trước API).
 *  PDF (cả standalone lẫn paired) đều là "attach-pdf" — server mới biết có ghép được không. */
export function getFilePreviewStatus(entry: FileEntry): FilePreviewStatus {
  if (entry.type === "zip") return "extract-zip";
  if (entry.type === "pdf") return "attach-pdf";
  return "new-invoice";
}

/** Ghép mỗi XML với PDF cùng tên gốc (không phân biệt hoa thường). Chạy lại toàn bộ danh sách sau mỗi thay đổi. */
export function pairXmlWithPdf(entries: FileEntry[]): FileEntry[] {
  const pdfByBaseName = new Map<string, string>();
  for (const entry of entries) {
    if (entry.type === "pdf") {
      pdfByBaseName.set(getBaseName(entry.file.name), entry.file.name);
    }
  }
  return entries.map((entry) =>
    entry.type === "xml"
      ? {
          ...entry,
          pairedPdf: pdfByBaseName.get(getBaseName(entry.file.name)),
        }
      : entry,
  );
}

/** Tách file đã chọn ghép tay (PDF có hóa đơn đích) khỏi file import tự động */
export function splitManualMatches(
  targetFiles: FileEntry[],
  manualMatches?: Record<string, string>,
) {
  const autoFiles: File[] = [];
  const manualFiles = new Map<string, File[]>();

  for (const entry of targetFiles) {
    const invoiceId =
      entry.type === "pdf" ? manualMatches?.[entry.id] : undefined;
    if (invoiceId) {
      const list = manualFiles.get(invoiceId) ?? [];
      list.push(entry.file);
      manualFiles.set(invoiceId, list);
    } else {
      autoFiles.push(entry.file);
    }
  }

  return { autoFiles, manualFiles };
}
