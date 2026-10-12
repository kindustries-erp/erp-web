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
}

export const PAYMENT_METHOD_OPTIONS = [
  { label: "Tiền mặt", value: "Tiền mặt" },
  { label: "Chuyển khoản", value: "Chuyển khoản" },
  { label: "Ứng trước", value: "Ứng trước" },
  { label: "Thẻ tín dụng", value: "Thẻ tín dụng" },
  { label: "Cấn trừ", value: "Cấn trừ" },
  { label: "Khác", value: "Khác" },
];
