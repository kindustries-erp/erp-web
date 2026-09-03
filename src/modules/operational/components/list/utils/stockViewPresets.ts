import { type TableViewPreset } from "@/shared/hooks/useUserPreferences";

export const DEFAULT_STOCK_COLUMN_VISIBILITY: Record<string, boolean> = {
  item_code: true,
  item_name: true,
  received_qty: true,
  issued_qty: true,
  adjusted_qty: true,
  on_hand_qty: true,
  reserved_qty: true,
  unit: true,
  last: false,
  item_type: true,
  status: true,
};

export const AUDIT_STOCK_COLUMN_VISIBILITY: Record<string, boolean> = {
  item_code: true,
  item_name: true,
  received_qty: true,
  issued_qty: true,
  adjusted_qty: true,
  on_hand_qty: true,
  reserved_qty: true,
  unit: true,
  last: true,
  item_type: true,
  status: true,
};

export const STOCK_COLUMN_VIEW_PRESETS: TableViewPreset[] = [
  {
    key: "overview",
    label: "Tổng quan",
    filters: {},
    columnFilters: {},
    columnVisibility: {
      ...DEFAULT_STOCK_COLUMN_VISIBILITY,
    },
    isCustom: false,
  },
  {
    key: "audit",
    label: "Kiểm toán / Đối soát",
    filters: {},
    columnFilters: {},
    columnVisibility: {
      ...AUDIT_STOCK_COLUMN_VISIBILITY,
    },
    isCustom: false,
  },
];

export interface ColumnGroupDef {
  groupKey: "general" | "stock" | "tracking";
  titleKey: string;
  columns: Array<{
    key: string;
    labelKey: string;
    defaultVisible?: boolean;
  }>;
}

export const STOCK_COLUMN_GROUPS: ColumnGroupDef[] = [
  {
    groupKey: "general",
    titleKey: "viewConfigGroupGeneral",
    columns: [
      {
        key: "item_code",
        labelKey: "inventoryMasters.columns.sku",
        defaultVisible: true,
      },
      {
        key: "item_name",
        labelKey: "inventoryMasters.columns.itemName",
        defaultVisible: true,
      },
      {
        key: "unit",
        labelKey: "inventory.table.columns.unit",
        defaultVisible: true,
      },
      {
        key: "item_type",
        labelKey: "inventory.table.columns.type",
        defaultVisible: true,
      },
      {
        key: "status",
        labelKey: "inventory.table.columns.status",
        defaultVisible: true,
      },
    ],
  },
  {
    groupKey: "stock",
    titleKey: "viewConfigGroupStock",
    columns: [
      {
        key: "received_qty",
        labelKey: "inventory.table.columns.in",
        defaultVisible: true,
      },
      {
        key: "issued_qty",
        labelKey: "inventory.table.columns.out",
        defaultVisible: true,
      },
      {
        key: "adjusted_qty",
        labelKey: "inventory.table.columns.adjusted",
        defaultVisible: true,
      },
      {
        key: "on_hand_qty",
        labelKey: "inventory.table.columns.onHand",
        defaultVisible: true,
      },
      {
        key: "reserved_qty",
        labelKey: "inventory.table.columns.reserved",
        defaultVisible: true,
      },
    ],
  },
  {
    groupKey: "tracking",
    titleKey: "viewConfigGroupTracking",
    columns: [
      {
        key: "last",
        labelKey: "inventory.table.columns.lastTx",
        defaultVisible: false,
      },
    ],
  },
];
