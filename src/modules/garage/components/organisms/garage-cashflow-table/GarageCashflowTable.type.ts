import type { TabItem } from "@/shared/components/PageLayout";
import type { GarageCashflowVoucher } from "../../../api/garageCashflowApi";

export enum GarageCashflowTabType {
  VOUCHERS = "vouchers",
  FORECAST = "forecast",
}

export enum GarageCashflowVoucherType {
  RECEIPT = "RECEIPT",
  PAYMENT = "PAYMENT",
}

export enum GarageCashflowPaymentStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  PAID = "PAID",
  EXPECTED = "EXPECTED",
  CANCELLED = "CANCELLED",
}

export enum GarageCashflowLedgerType {
  ACTUAL = "ACTUAL",
  FORECAST = "FORECAST",
  ALL = "ALL",
}

export interface GarageCashflowTableProps {
  tabs?: TabItem[];
  activeTab?: string;
  onTabChange?: (val: string) => void;
  tabKey?: GarageCashflowTabType | "vouchers" | "forecast";
  onCreate?: () => void;
  onView?: (row: GarageCashflowVoucher) => void;
  onEdit?: (row: GarageCashflowVoucher) => void;
  onDelete?: (row: GarageCashflowVoucher) => void;
  onPrint?: (row: GarageCashflowVoucher) => void;
  onOpenCaseDetail?: (caseCode: string) => void;
  canDelete?: boolean;
  onExportExcel?: (filterState: any) => void;
}
