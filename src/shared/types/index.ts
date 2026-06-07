export type PageKey =
  | "dashboard"
  | "cashflow"
  | "cashflow-vouchers"
  | "cash-fund"
  | "bank-deposit"
  | "attachments"
  | "settings-cash-fund"
  | "settings-bank"
  | "settings-accounts"
  | "receivables"
  | "payables"
  | "ledger"
  | "journal"
  | "employees"
  | "departments"
  | "positions"
  | "sales"
  | "customers"
  | "purchasing"
  | "operating-expenses"
  | "inventory"
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
  | "erp-goods-receipts"
  | "erp-production"
  | "erp-sales-orders"
  | "erp-goods-issues";
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
