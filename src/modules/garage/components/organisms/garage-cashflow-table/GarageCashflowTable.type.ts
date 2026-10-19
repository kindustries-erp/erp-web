import type { TabItem } from "@/shared/components/PageLayout";
import type { GarageCashflowVoucher } from "../../../api/garageCashflowApi";

export interface GarageCashflowTableProps {
  tabs?: TabItem[];
  activeTab?: string;
  onTabChange?: (val: string) => void;
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
