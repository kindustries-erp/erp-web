import { type TableViewPreset } from "@/shared/hooks/useUserPreferences";

export const DEFAULT_WAREHOUSE_COLUMN_VISIBILITY: Record<string, boolean> = {
  date: true,
  type: true,
  categoryName: true,
  voucherNo: true,
  qtyReceipt: true,
  qtyIssue: true,
  qtyAdjustment: true,
  poNo: true,
  partnerName: true,
  remarks: false,
  status: true,
};

export const AUDIT_WAREHOUSE_COLUMN_VISIBILITY: Record<string, boolean> = {
  date: true,
  type: true,
  categoryName: true,
  voucherNo: true,
  qtyReceipt: true,
  qtyIssue: true,
  qtyAdjustment: true,
  poNo: true,
  partnerName: true,
  remarks: true,
  status: true,
};

export const WAREHOUSE_COLUMN_VIEW_PRESETS: TableViewPreset[] = [
  {
    key: "overview",
    label: "Tổng quan",
    filters: {},
    columnFilters: {},
    columnVisibility: {
      ...DEFAULT_WAREHOUSE_COLUMN_VISIBILITY,
    },
    isCustom: false,
  },
  {
    key: "audit",
    label: "Kiểm toán / Đối soát",
    filters: {},
    columnFilters: {},
    columnVisibility: {
      ...AUDIT_WAREHOUSE_COLUMN_VISIBILITY,
    },
    isCustom: false,
  },
];

export interface ColumnGroupDef {
  groupKey: "general" | "quantity";
  titleKey: string;
  columns: Array<{
    key: string;
    labelKey: string;
    defaultVisible?: boolean;
  }>;
}

export const WAREHOUSE_COLUMN_GROUPS: ColumnGroupDef[] = [
  {
    groupKey: "general",
    titleKey: "viewConfigGroupGeneral",
    columns: [
      { key: "date", labelKey: "table.date", defaultVisible: true },
      { key: "type", labelKey: "inventory.voucherType", defaultVisible: true },
      {
        key: "categoryName",
        labelKey: "inventory.category",
        defaultVisible: true,
      },
      {
        key: "voucherNo",
        labelKey: "inventory.voucherNo",
        defaultVisible: true,
      },
      { key: "poNo", labelKey: "inventory.document", defaultVisible: true },
      { key: "partnerName", labelKey: "common.partner", defaultVisible: true },
      { key: "remarks", labelKey: "common.remarks", defaultVisible: false },
      { key: "status", labelKey: "common.status", defaultVisible: true },
    ],
  },
  {
    groupKey: "quantity",
    titleKey: "viewConfigGroupQuantity",
    columns: [
      {
        key: "qtyReceipt",
        labelKey: "inventory.qtyReceipt",
        defaultVisible: true,
      },
      { key: "qtyIssue", labelKey: "inventory.qtyIssue", defaultVisible: true },
      {
        key: "qtyAdjustment",
        labelKey: "inventory.qtyAdjustment",
        defaultVisible: true,
      },
    ],
  },
];
