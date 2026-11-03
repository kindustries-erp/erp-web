import type { TFunction } from "i18next";
import type { FileEntry } from "@/modules/erp-invoices-core/hooks/useInvoiceXmlUpload";

export interface InvoiceOptionSource {
  id: string;
  invoiceNo: string;
  serialNo?: string | null;
  totalAmount?: string | number | null;
}

export function formatInvoiceAmount(
  amount: string | number | null | undefined,
): string {
  return `${Number(amount).toLocaleString("vi-VN")}đ`;
}

/** Nhãn hóa đơn trong danh sách ghép thủ công: `[ký hiệu] HĐ: số - số tiền` */
export function toInvoiceOption(inv: InvoiceOptionSource, t: TFunction) {
  return {
    value: inv.id,
    label: t("xmlInvoiceOptionLabel", {
      defaultValue: "[{{serial}}] HĐ: {{invoiceNo}} - {{amount}}",
      serial: inv.serialNo || "N/A",
      invoiceNo: inv.invoiceNo,
      amount: formatInvoiceAmount(inv.totalAmount),
    }),
  };
}

export function buildInitialSelection(
  files: FileEntry[],
): Record<string, boolean> {
  const selection: Record<string, boolean> = {};
  files.forEach((f) => (selection[f.id] = true));
  return selection;
}

/** Danh sách id đang được chọn, theo thứ tự file */
export function selectedIdsOf(
  files: FileEntry[],
  selection: Record<string, boolean>,
): string[] {
  return files.filter((f) => selection[f.id]).map((f) => f.id);
}

/** Số file theo loại (xml/pdf/zip) để hiển thị tóm tắt */
export function countFilesByType(files: FileEntry[]): Record<string, number> {
  return files.reduce(
    (acc, f) => {
      acc[f.type] = (acc[f.type] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );
}

/** Chuyển danh sách id đã chọn về bản đồ chọn cho cả danh sách file */
export function buildSelectionFrom(
  files: FileEntry[],
  ids: string[],
): Record<string, boolean> {
  const set = new Set(ids);
  return Object.fromEntries(files.map((f) => [f.id, set.has(f.id)]));
}
