import {
  invoiceFilesV2Api,
  type InvoiceFileV2,
} from "../api/invoiceFilesV2Api";

export interface InvoiceFileMatch {
  /** Tên file cần tìm (hàng bảng V1 chỉ biết tên/khóa cũ, không biết id V2) */
  fileName?: string;
  /** Lấy PDF gốc (isOriginal) khi không biết tên */
  original?: boolean;
}

/** Chọn file V2 khớp: ưu tiên tên, rồi PDF gốc, cuối cùng là file đầu tiên. */
export function pickInvoiceFileV2(
  files: InvoiceFileV2[],
  match: InvoiceFileMatch,
): InvoiceFileV2 | null {
  if (files.length === 0) return null;
  if (match.fileName) {
    const byName = files.find((f) => f.fileName === match.fileName);
    if (byName) return byName;
  }
  if (match.original) {
    const original = files.find((f) => f.isOriginal);
    if (original) return original;
  }
  return files[0];
}

/** Tìm file của hóa đơn trên API V2 rồi lấy URL ký sẵn (xem trước hoặc tải). */
export async function resolveInvoiceFileUrl(
  invoiceId: string,
  match: InvoiceFileMatch,
  inline: boolean,
): Promise<{ id: string; fileName: string; url: string }> {
  const { items } = await invoiceFilesV2Api.list(invoiceId);
  const file = pickInvoiceFileV2(items, match);
  if (!file) throw new Error("Hóa đơn chưa có tài liệu");
  const { url } = await invoiceFilesV2Api.downloadUrl(
    invoiceId,
    file.id,
    inline,
  );
  return { id: file.id, fileName: file.fileName, url };
}

/** Lưu blob thành file tải về ở trình duyệt. */
export function saveBlobAs(blob: Blob, fileName: string): void {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}
