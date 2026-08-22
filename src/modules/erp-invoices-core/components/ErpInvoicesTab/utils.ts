import { type ErpInvoice } from "@/modules/erp-invoices-core/api/erpInvoicesCoreApi";
import { type TableViewPreset } from "@/shared/hooks/useUserPreferences";

export const INVOICE_TYPE_MAP: Record<string, string> = {
  CHI_NHANH: "Hóa đơn chi nhánh",
  CHIET_KHAU: "Hóa đơn chiết khấu",
  DICH_VU_CUU_HO: "Hóa đơn cứu hộ",
  HANG_HOA: "Hàng hóa / Vật tư",
  DICH_VU: "Dịch vụ",
  PHI_THUE: "Phí & Thuế",
  CUU_HO: "Cứu hộ",
  KHAC: "Khác",
};

export const DEFAULT_INVOICE_PRESETS: TableViewPreset[] = [
  {
    key: "all",
    label: "Tất cả",
    filters: {},
    columnFilters: {},
  },
  {
    key: "new",
    label: "Mới",
    filters: {},
    columnFilters: { taxInvoiceStatus: ["1"] },
  },
  {
    key: "replacement",
    label: "Thay thế",
    filters: {},
    columnFilters: { taxInvoiceStatus: ["2", "4"] },
  },
  {
    key: "adjustment",
    label: "Điều chỉnh",
    filters: {},
    columnFilters: { taxInvoiceStatus: ["3", "5"] },
  },
];

export const DEFAULT_INVOICE_COLUMN_VISIBILITY: Record<string, boolean> = {
  taxInvoiceType: false,
  taxProcessStatus: false,
  attachments: false,
  isValid: false,
  postingStatus: false,
};

export function getPdfAttachments(attachments: any[]) {
  return (attachments ?? []).filter(
    (a) => a.attachment?.mimeType === "application/pdf",
  );
}

export function formatTaxInvoiceType(type?: string | null) {
  if (type === "CASH_REGISTER") return "HĐ Máy tính tiền";
  if (type === "STANDARD") return "HĐ Điện tử";
  return type || "—";
}

export function formatTaxInvoiceStatus(val?: number | null) {
  switch (val) {
    case 1:
      return "Mới";
    case 2:
      return "Thay thế";
    case 3:
      return "Điều chỉnh";
    case 4:
      return "Bị thay thế";
    case 5:
      return "Bị điều chỉnh";
    case 6:
      return "Bị hủy";
    default:
      return val?.toString() || "—";
  }
}

export function getInvoiceRowClassName(inv: ErpInvoice): string | undefined {
  if (
    inv.status === "CANCELLED" ||
    inv.taxInvoiceStatus === 4 ||
    inv.taxInvoiceStatus === 6
  ) {
    return "opacity-40 text-muted-foreground";
  }

  switch (inv.taxInvoiceStatus) {
    case 2: // Thay thế
    case 3: // Điều chỉnh
    case 5: // Bị điều chỉnh
      return "bg-amber-50/40 dark:bg-amber-950/15 hover:bg-amber-100/40 dark:hover:bg-amber-900/15";
    default:
      return undefined;
  }
}

export function formatTaxProcessStatus(val?: number | null) {
  switch (val) {
    case 0:
      return "Cục Thuế đã nhận";
    case 1:
      return "Đang tiến hành kiểm tra điều kiện cấp mã";
    case 2:
      return "CQT từ chối hóa đơn theo từng lần phát sinh";
    case 3:
      return "Hóa đơn đủ điều kiện cấp mã";
    case 4:
      return "Hóa đơn không đủ điều kiện cấp mã";
    case 5:
      return "Đã cấp mã hóa đơn";
    case 6:
      return "Cục Thuế đã nhận không mã";
    case 7:
      return "Đã kiểm tra định kỳ HĐĐT không có mã";
    case 8:
      return "Cục Thuế đã nhận hóa đơn có mã khởi tạo từ máy tính tiền";
    default:
      return val?.toString() || "—";
  }
}

export function fmtAmt(val: string | null | undefined) {
  if (val == null) return "—";
  const n = Number(val);
  if (isNaN(n)) return "—";
  return (
    n.toLocaleString("vi-VN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + " đ"
  );
}

export function formatAmtOption(val: string | number) {
  const n = Number(val || 0);
  if (isNaN(n)) return String(val);
  return n.toLocaleString("vi-VN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
