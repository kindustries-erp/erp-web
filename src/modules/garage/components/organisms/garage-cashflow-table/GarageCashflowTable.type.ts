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
  onOpenCaseDetail?: (caseCode: string) => void;
  canDelete?: boolean;
  onExportExcel?: (filterState: any) => void;
}

export const PAYMENT_METHOD_OPTIONS = [
  { label: "Tiền mặt", value: "Tiền mặt" },
  { label: "Chuyển khoản", value: "Chuyển khoản" },
  { label: "Thẻ tín dụng", value: "Thẻ tín dụng" },
  { label: "Khác", value: "Khác" },
];

export const PAYMENT_STATUS_OPTIONS = [
  { label: "Dự thu", value: "EXPECTED" },
  { label: "Đã thu / Đã chi", value: "PAID" },
  { label: "Dự chi", value: "PENDING" },
  { label: "Đã duyệt", value: "APPROVED" },
];

export { PAYMENT_CONTENT_OPTIONS } from "../../molecules/payment-content-combobox";
