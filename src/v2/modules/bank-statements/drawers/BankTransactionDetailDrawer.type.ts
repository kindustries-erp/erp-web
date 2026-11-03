import type { V2TabItemData } from "@/v2/shared/components";

/** 3 Top tab chính của drawer giao dịch ngân hàng */
export type BankTopTabKey = "details" | "partner" | "history";

/** Sub-tabs trong tab Chi tiết: Chi tiết giao dịch, Hạch toán kế toán, Chứng từ liên kết */
export type BankDetailsSubTabKey = "details" | "accounting" | "traceability";

/** Sub-tabs trong tab Theo đối tác: Chi tiết theo đối tượng, Biến động & Phân tích */
export type BankPartnerSubTabKey = "list" | "analytics";

/** Khóa tab tương thích */
export type BankDetailTab = BankTopTabKey;

export interface BankTransactionDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  transactionId: string | null;
  onSaved?: () => void;
  /** Khóa tab ban đầu (`details`, `partner`, `history` hoặc legacy `accounting`, `traceability`, `txn_details`) */
  defaultTabKey?: string;
  initialMode?: "view" | "edit";
  /** Cho phép click sang giao dịch khác từ bảng kê đối tác */
  onSelectTransaction?: (id: string) => void;
  /** Custom tabs (nếu có từ caller cũ) */
  customTabs?: V2TabItemData[];
}
