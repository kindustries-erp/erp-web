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
  { label: "Thẻ tín dụng", value: "Thẻ tín dụng" },
  { label: "Khác", value: "Khác" },
];

export const PAYMENT_CONTENT_OPTIONS = [
  { label: "KH thanh toán", value: "KH thanh toán" },
  { label: "Tất toán", value: "Tất toán" },
  { label: "BH thanh toán", value: "BH thanh toán" },
  { label: "HHBH", value: "HHBH" },
  { label: "Ứng trước", value: "Ứng trước" },
  { label: "Cấn trừ", value: "Cấn trừ" },
  { label: "Mua phụ tùng / vật tư", value: "Mua phụ tùng / vật tư" },
  { label: "Chi phí vận hành", value: "Chi phí vận hành" },
  { label: "Hoa hồng / nhân công", value: "Hoa hồng / nhân công" },
  { label: "Hoàn ứng", value: "Hoàn ứng" },
  { label: "Khác", value: "Khác" },
];
