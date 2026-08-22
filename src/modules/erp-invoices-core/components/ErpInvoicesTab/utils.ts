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
  invoiceCategory: false,
  notes: false,
};

export const INVOICE_COLUMN_VIEW_PRESETS: TableViewPreset[] = [
  {
    key: "overview",
    label: "Tổng quan",
    filters: {},
    columnFilters: {},
    columnVisibility: {
      ...DEFAULT_INVOICE_COLUMN_VISIBILITY,
    },
    isCustom: false,
  },
  {
    key: "audit",
    label: "Kiểm toán / Đối soát",
    filters: {},
    columnFilters: {},
    columnVisibility: {
      preVatAmount: false,
      vatRate: false,
      vatAmount: false,
      discountAmount: false,
      description: false,
      invoiceCategory: false,
      attachments: false,
      notes: false,
      taxInvoiceType: true,
      taxInvoiceStatus: true,
      taxProcessStatus: true,
      postingStatus: true,
      isValid: true,
      totalAmount: true,
      netOffAmount: true,
      remainingAmount: true,
    },
    isCustom: false,
  },
];

export interface ColumnGroupDef {
  groupKey: "general" | "tax" | "amount";
  titleKey: string;
  columns: Array<{
    key: string;
    labelKey: string;
    defaultVisible?: boolean;
  }>;
}

export const INVOICE_COLUMN_GROUPS: ColumnGroupDef[] = [
  {
    groupKey: "general",
    titleKey: "viewConfigGroupGeneral",
    columns: [
      { key: "invoiceDate", labelKey: "invoiceDate", defaultVisible: true },
      { key: "invoiceNo", labelKey: "invoiceNo", defaultVisible: true },
      { key: "partner", labelKey: "partner", defaultVisible: true },
      { key: "branchId", labelKey: "branch", defaultVisible: true },
      { key: "description", labelKey: "description", defaultVisible: true },
      {
        key: "invoiceCategory",
        labelKey: "invoiceCategory",
        defaultVisible: false,
      },
      { key: "attachments", labelKey: "attachments", defaultVisible: false },
      {
        key: "notes",
        labelKey: "invoice.columns.notes",
        defaultVisible: false,
      },
    ],
  },
  {
    groupKey: "tax",
    titleKey: "viewConfigGroupTax",
    columns: [
      {
        key: "taxInvoiceType",
        labelKey: "taxInvoiceType",
        defaultVisible: false,
      },
      {
        key: "taxInvoiceStatus",
        labelKey: "taxInvoiceStatus",
        defaultVisible: true,
      },
      {
        key: "taxProcessStatus",
        labelKey: "taxProcessStatus",
        defaultVisible: false,
      },
      {
        key: "isValid",
        labelKey: "invoice.columns.isValid",
        defaultVisible: false,
      },
      { key: "licensePlate", labelKey: "licensePlate", defaultVisible: true },
      {
        key: "settlementOrder",
        labelKey: "settlementOrder",
        defaultVisible: true,
      },
    ],
  },
  {
    groupKey: "amount",
    titleKey: "viewConfigGroupAmount",
    columns: [
      { key: "preVatAmount", labelKey: "preVatAmount", defaultVisible: true },
      { key: "vatRate", labelKey: "vatRate", defaultVisible: true },
      { key: "vatAmount", labelKey: "vatAmount", defaultVisible: true },
      {
        key: "discountAmount",
        labelKey: "discountAmount",
        defaultVisible: true,
      },
      { key: "totalAmount", labelKey: "totalAmount", defaultVisible: true },
      { key: "netOffAmount", labelKey: "netOffAmount", defaultVisible: true },
      {
        key: "remainingAmount",
        labelKey: "invoice.columns.remainingAmount",
        defaultVisible: true,
      },
      {
        key: "postingStatus",
        labelKey: "postingStatus",
        defaultVisible: false,
      },
    ],
  },
];

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
  // Trạng thái 'Thay thế' (2): Luôn giữ độ rõ 100%, không bị mờ (kể cả khi status = CANCELLED)
  if (inv.taxInvoiceStatus === 2) {
    return "bg-amber-50/40 dark:bg-amber-950/15 hover:bg-amber-100/40 dark:hover:bg-amber-900/15";
  }

  // Trạng thái 'Điều chỉnh' (3) hoặc 'Bị điều chỉnh' (5): Không mờ, highlight màu amber
  if (inv.taxInvoiceStatus === 3 || inv.taxInvoiceStatus === 5) {
    return "bg-amber-50/40 dark:bg-amber-950/15 hover:bg-amber-100/40 dark:hover:bg-amber-900/15";
  }

  // Chỉ mờ khi 'Bị thay thế' (4), 'Bị hủy' (6) hoặc status CANCELLED (mà không phải Thay thế)
  if (
    inv.taxInvoiceStatus === 4 ||
    inv.taxInvoiceStatus === 6 ||
    inv.status === "CANCELLED"
  ) {
    return "opacity-40 text-muted-foreground";
  }

  return undefined;
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
