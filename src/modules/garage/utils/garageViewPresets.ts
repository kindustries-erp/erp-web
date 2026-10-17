import { type TableViewPreset } from "@/shared/hooks/useUserPreferences";
import type { ViewModeFilterItem } from "@/shared/components/ViewModeCombobox";

// ==========================================
// 1. GARAGE OPEX (Chi phí vận hành)
// ==========================================

export const DEFAULT_GARAGE_OPEX_COLUMN_VISIBILITY: Record<string, boolean> = {
  index: true,
  period: true,
  categoryKey: true,
  costGroup: false,
  description: true,
  amount: true,
  ojAmount: true,
  recurrenceType: true,
  note: false,
  actions: true,
};

export const ALL_GARAGE_OPEX_COLUMN_VISIBILITY: Record<string, boolean> = {
  index: true,
  period: true,
  categoryKey: true,
  costGroup: true,
  description: true,
  amount: true,
  ojAmount: true,
  recurrenceType: true,
  note: true,
  actions: true,
};

export const GARAGE_OPEX_COLUMN_VIEW_PRESETS: TableViewPreset[] = [
  {
    key: "overview",
    label: "Tổng quan",
    filters: {},
    columnFilters: {},
    columnVisibility: { ...DEFAULT_GARAGE_OPEX_COLUMN_VISIBILITY },
    isCustom: false,
    isDefault: true,
  },
  {
    key: "all_columns",
    label: "Đầy đủ",
    filters: {},
    columnFilters: {},
    columnVisibility: { ...ALL_GARAGE_OPEX_COLUMN_VISIBILITY },
    isCustom: false,
    isDefault: false,
  },
];

export const GARAGE_OPEX_FILTER_ITEMS: ViewModeFilterItem<string>[] = [
  { value: "ALL", label: "Tất cả" },
  { value: "OPEX", label: "CP Vận hành", dotColor: "slate" },
  { value: "COGS", label: "Giá vốn (COGS)", dotColor: "amber" },
  { value: "COMMISSION", label: "Hoa hồng", dotColor: "blue" },
];

// ==========================================
// 2. GARAGE CASHFLOW (Thu chi garage)
// ==========================================

export const DEFAULT_GARAGE_CASHFLOW_COLUMN_VISIBILITY: Record<
  string,
  boolean
> = {
  stt: true,
  transDate: true,
  createdAt: false,
  voucherCode: true,
  thu: true,
  chi: true,
  paymentStatus: true,
  paymentMethod: true,
  paymentContent: true,
  caseCode: true,
  licensePlate: true,
  partnerName: true,
  note: false,
};

export const RECONCILIATION_GARAGE_CASHFLOW_COLUMN_VISIBILITY: Record<
  string,
  boolean
> = {
  stt: true,
  transDate: true,
  createdAt: false,
  voucherCode: true,
  thu: true,
  chi: true,
  paymentStatus: false,
  paymentMethod: false,
  paymentContent: true,
  caseCode: true,
  licensePlate: true,
  partnerName: true,
  note: true,
};

export const ALL_GARAGE_CASHFLOW_COLUMN_VISIBILITY: Record<string, boolean> = {
  stt: true,
  transDate: true,
  createdAt: true,
  voucherCode: true,
  thu: true,
  chi: true,
  paymentStatus: true,
  paymentMethod: true,
  paymentContent: true,
  caseCode: true,
  licensePlate: true,
  partnerName: true,
  note: true,
};

export const GARAGE_CASHFLOW_COLUMN_VIEW_PRESETS: TableViewPreset[] = [
  {
    key: "overview",
    label: "Tổng quan",
    filters: {},
    columnFilters: {},
    columnVisibility: { ...DEFAULT_GARAGE_CASHFLOW_COLUMN_VISIBILITY },
    isCustom: false,
    isDefault: true,
  },
  {
    key: "reconciliation",
    label: "Đối soát",
    filters: {},
    columnFilters: {},
    columnVisibility: { ...RECONCILIATION_GARAGE_CASHFLOW_COLUMN_VISIBILITY },
    isCustom: false,
    isDefault: false,
  },
  {
    key: "all_columns",
    label: "Đầy đủ",
    filters: {},
    columnFilters: {},
    columnVisibility: { ...ALL_GARAGE_CASHFLOW_COLUMN_VISIBILITY },
    isCustom: false,
    isDefault: false,
  },
];

export const GARAGE_CASHFLOW_FILTER_ITEMS: ViewModeFilterItem<string>[] = [
  { value: "ALL", label: "Tất cả" },
  { value: "RECEIPT", label: "Phiếu thu (Tiền vào)", dotColor: "emerald" },
  { value: "PAYMENT", label: "Phiếu chi (Tiền ra)", dotColor: "rose" },
];

// ==========================================
// 3. GARAGE DEBTS (Công nợ garage)
// ==========================================

export const DEFAULT_GARAGE_RECEIVABLES_COLUMN_VISIBILITY: Record<
  string,
  boolean
> = {
  index: true,
  licensePlate: true,
  customer: true,
  caseCount: true,
  paymentProgress: true,
  balanceAmount: true,
  latestDate: true,
  oldestDate: false,
  maxAgingDays: true,
  aging0_30: false,
  aging31_60: false,
  aging61_90: false,
  agingOver90: false,
};

export const AGING_GARAGE_RECEIVABLES_COLUMN_VISIBILITY: Record<
  string,
  boolean
> = {
  index: true,
  licensePlate: true,
  customer: true,
  caseCount: false,
  paymentProgress: false,
  balanceAmount: true,
  latestDate: true,
  oldestDate: false,
  maxAgingDays: true,
  aging0_30: true,
  aging31_60: true,
  aging61_90: true,
  agingOver90: true,
};

export const ALL_GARAGE_RECEIVABLES_COLUMN_VISIBILITY: Record<string, boolean> =
  {
    index: true,
    licensePlate: true,
    customer: true,
    caseCount: true,
    paymentProgress: true,
    balanceAmount: true,
    latestDate: true,
    oldestDate: true,
    maxAgingDays: true,
    aging0_30: true,
    aging31_60: true,
    aging61_90: true,
    agingOver90: true,
  };

export const GARAGE_RECEIVABLES_COLUMN_VIEW_PRESETS: TableViewPreset[] = [
  {
    key: "overview",
    label: "Tổng quan",
    filters: {},
    columnFilters: {},
    columnVisibility: { ...DEFAULT_GARAGE_RECEIVABLES_COLUMN_VISIBILITY },
    isCustom: false,
    isDefault: true,
  },
  {
    key: "aging",
    label: "Chi tiết tuổi nợ",
    filters: {},
    columnFilters: {},
    columnVisibility: { ...AGING_GARAGE_RECEIVABLES_COLUMN_VISIBILITY },
    isCustom: false,
    isDefault: false,
  },
  {
    key: "all_columns",
    label: "Đầy đủ",
    filters: {},
    columnFilters: {},
    columnVisibility: { ...ALL_GARAGE_RECEIVABLES_COLUMN_VISIBILITY },
    isCustom: false,
    isDefault: false,
  },
];

export const DEFAULT_GARAGE_PAYABLES_COLUMN_VISIBILITY: Record<
  string,
  boolean
> = {
  index: true,
  licensePlate: true,
  customer: true,
  caseCount: true,
  totalCost: true,
  paid: true,
  balance: true,
  latestDate: true,
  oldestDate: false,
  maxAgingDays: true,
  aging0_30: false,
  aging31_60: false,
  aging61_90: false,
  agingOver90: false,
};

export const AGING_GARAGE_PAYABLES_COLUMN_VISIBILITY: Record<string, boolean> =
  {
    index: true,
    licensePlate: true,
    customer: true,
    caseCount: false,
    totalCost: false,
    paid: false,
    balance: true,
    latestDate: true,
    oldestDate: false,
    maxAgingDays: true,
    aging0_30: true,
    aging31_60: true,
    aging61_90: true,
    agingOver90: true,
  };

export const ALL_GARAGE_PAYABLES_COLUMN_VISIBILITY: Record<string, boolean> = {
  index: true,
  licensePlate: true,
  customer: true,
  caseCount: true,
  totalCost: true,
  paid: true,
  balance: true,
  latestDate: true,
  oldestDate: true,
  maxAgingDays: true,
  aging0_30: true,
  aging31_60: true,
  aging61_90: true,
  agingOver90: true,
};

export const GARAGE_PAYABLES_COLUMN_VIEW_PRESETS: TableViewPreset[] = [
  {
    key: "overview",
    label: "Tổng quan",
    filters: {},
    columnFilters: {},
    columnVisibility: { ...DEFAULT_GARAGE_PAYABLES_COLUMN_VISIBILITY },
    isCustom: false,
    isDefault: true,
  },
  {
    key: "aging",
    label: "Chi tiết tuổi nợ",
    filters: {},
    columnFilters: {},
    columnVisibility: { ...AGING_GARAGE_PAYABLES_COLUMN_VISIBILITY },
    isCustom: false,
    isDefault: false,
  },
  {
    key: "all_columns",
    label: "Đầy đủ",
    filters: {},
    columnFilters: {},
    columnVisibility: { ...ALL_GARAGE_PAYABLES_COLUMN_VISIBILITY },
    isCustom: false,
    isDefault: false,
  },
];

export const GARAGE_DEBT_FILTER_ITEMS: ViewModeFilterItem<string>[] = [
  { value: "ALL", label: "Tất cả" },
  { value: "HAS_DEBT", label: "Còn nợ", dotColor: "amber" },
  { value: "0-30", label: "0 - 30 ngày (Trong hạn)", dotColor: "emerald" },
  { value: "31-60", label: "31 - 60 ngày", dotColor: "amber" },
  { value: "61-90", label: "61 - 90 ngày (Quá hạn)", dotColor: "rose" },
  { value: ">90", label: "> 90 ngày (Khó đòi)", dotColor: "rose" },
];
