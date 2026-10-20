import type { TableViewPreset } from "@/shared/hooks/useUserPreferences";

export interface ColumnGroupDef {
  groupKey: "general" | "tax" | "amount";
  titleKey: string;
  columns: Array<{
    key: string;
    labelKey: string;
    defaultVisible?: boolean;
  }>;
}

export const DEFAULT_INVOICE_COLUMN_VISIBILITY: Record<string, boolean> = {
  invoiceDate: true,
  invoiceNo: true,
  partner: true,
  branchId: true,
  description: true,
  invoiceCategory: false,
  attachments: false,
  notes: false,
  taxInvoiceType: false,
  taxInvoiceStatus: true,
  taxProcessStatus: false,
  isValid: false,
  licensePlate: true,
  settlementOrder: true,
  vinfastPartsCount: true,
  preVatAmount: true,
  vatRate: true,
  vatAmount: true,
  discountAmount: true,
  totalAmount: true,
  netOffAmount: true,
  remainingAmount: true,
  postingStatus: false,
};

export const AUDIT_INVOICE_COLUMN_VISIBILITY: Record<string, boolean> = {
  invoiceDate: true,
  invoiceNo: true,
  partner: true,
  branchId: true,
  description: false,
  invoiceCategory: false,
  attachments: false,
  notes: false,
  taxInvoiceType: true,
  taxInvoiceStatus: true,
  taxProcessStatus: true,
  isValid: true,
  licensePlate: true,
  settlementOrder: true,
  vinfastPartsCount: true,
  preVatAmount: false,
  vatRate: false,
  vatAmount: false,
  discountAmount: false,
  totalAmount: true,
  netOffAmount: true,
  remainingAmount: true,
  postingStatus: true,
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
      ...AUDIT_INVOICE_COLUMN_VISIBILITY,
    },
    isCustom: false,
  },
];

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
