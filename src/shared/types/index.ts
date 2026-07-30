export type PageKey =
  | "dashboard"
  | "cashflow"
  | "cashflow-dashboard"
  | "cashflow-vouchers"
  | "cash-fund"
  | "bank-deposit"
  | "attachments"
  | "email-inbox"
  | "settings-cash-fund"
  | "settings-bank"
  | "settings-accounts"
  | "receivables"
  | "payables"
  | "ledger"
  | "journal"
  | "journal-entry"
  | "employees"
  | "departments"
  | "positions"
  | "customers"
  | "purchasing"
  | "operating-expenses"
  | "erp-inventory-stock"
  | "erp-inventory-tracking"
  | "erp-inventory-tracking-parts"
  | "erp-inventory-vouchers"
  | "suppliers"
  | "activity-log"
  | "partners"
  | "permissions"
  | "e-invoice"
  | "workflow"
  | "settings-branch"
  | "mfg-items"
  | "mfg-purchase-orders"
  | "mfg-vehicles"
  | "erp-bom"
  | "erp-production"
  | "erp-sales-orders"
  | "sales-report-dashboard"
  | "erp-goods-issues"
  | "erp-inventory-items"
  | "erp-inventory-uom"
  | "erp-inventory-item-types"
  | "erp-inventory-tracking-categories"
  | "erp-suppliers"
  | "erp-customers"
  | "erp-employees"
  | "erp-users"
  | "erp-activity-logs"
  | "erp-permissions-core"
  | "sys-tags"
  | "erp-invoices-in"
  | "erp-invoices-out"
  | "erp-invoices-draft"
  | "invoice-dashboard"
  | "purchasing-report-dashboard"
  | "bank-statement"
  | "cash-statement"
  | "garage-dashboard"
  | "garage-cases"
  | "garage-gross-profit"
  | "garage-receivables"
  | "garage-payables"
  | "after-sales"
  | "vinfast-parts"
  | "vinfast-parts-dashboard"
  | "vinfast-parts-oto"
  | "vinfast-parts-xemay"
  | "vinfast-invoice-settlement"
  | "inventory-dashboard";
export type TxSource = "cash-fund" | "bank-deposit";

export interface Transaction {
  id: number;
  date: string;
  code: string;
  type: "thu" | "chi";
  loai: string;
  doituong: string;
  mst: string;
  diachi: string;
  dienGiai: string;
  amount: number;
  tknNo: string;
  tknCo: string;
  nguoiLap: string;
  nguoiDuyet: string;
  trangThai: "da-duyet" | "cho-duyet";
  nguonQuy: string;
}

export interface Quy {
  ma: string;
  ten: string;
  tk: string;
  ptr: string;
  isDefault: boolean;
  active: boolean;
}

export interface NganHang {
  bank: string;
  stk: string;
  chu: string;
  cn: string;
  tk: string;
  loai: string;
  isDefault: boolean;
  active: boolean;
}

export interface TaiKhoan {
  so: string;
  ten: string;
  loai: string;
  cha: string;
  chuan: string;
  active: boolean;
}

export interface PaginationState {
  page: number;
  size: number;
}

export type PanelContent =
  | { kind: "newTx"; txType: "thu" | "chi"; src: TxSource }
  | { kind: "detail"; src: TxSource; id: number };

export interface TabInfo {
  labelKey: string;
  closable: boolean;
}

export interface SectionRoot {
  labelKey: string;
  group: string;
}
