import { type ReactNode } from "react";
import { type ErpInvoice } from "../../api/erpInvoicesCoreApi";

/**
 * Chiều đối soát dòng tiền:
 * - RECEIPT: Thu tiền (HĐ bán ra, phiếu thu, giấy báo có)
 * - PAYMENT: Chi tiền (HĐ mua vào, phiếu chi, ủy nhiệm chi)
 */
export type SettlementType = "RECEIPT" | "PAYMENT";

/**
 * Phân loại hình thức dòng tiền ngoài sổ sách
 */
export type ManualSettlementCategory =
  | "TIEN_MAT_NGOAI"
  | "CHUYEN_KHOAN_CA_NHAN"
  | "CHI_PHI_KHAC"
  | "VI_DIEN_TU"
  | "DAT_COC"
  | "THU_KHAC"
  | "HOAN_UNG"
  | "CHI_KHAC";

/**
 * Key các tab điều hướng trong ngữ cảnh Hóa đơn ERP
 */
export type InvoiceNetOffTabKey = "bank_statement" | "cash_book";

/**
 * Key các tab điều hướng trong ngữ cảnh Garage Case / Generic
 */
export type GarageNetOffTabKey = "ON_SYSTEM" | "OFF_SYSTEM_MANUAL";

/**
 * Dữ liệu 1 dòng cấn trừ được submit
 */
export interface SettlementSubmissionItem {
  id?: string;
  bankTransactionId?: string;
  amount: number;
  maxAmount?: number;
  txn?: any;
  sourceChannel?: "ON_SYSTEM" | "OFF_SYSTEM_MANUAL";
  category?: ManualSettlementCategory;
  note?: string;
  transDate?: string;
  partner?: string;
  settlementType?: SettlementType;
}

/**
 * Payload tổng hợp khi submit nhiều dòng hoặc ghi nhận ngoài sổ sách
 */
export interface SettlementSubmission {
  sourceChannel: "ON_SYSTEM" | "OFF_SYSTEM_MANUAL";
  items?: SettlementSubmissionItem[];
  amount?: number;
  note?: string;
  transDate?: string;
  partner?: string;
  category?: ManualSettlementCategory;
  settlementType?: SettlementType;
}

/**
 * Props của component VoucherNetoffSelectionModal
 */
export interface VoucherNetoffSelectionModalProps {
  open: boolean;
  onClose: () => void;
  onSelect?: (
    selected: {
      id: string;
      amount: number;
      maxAmount?: number;
      txn?: any;
    }[],
  ) => void | Promise<void>;
  onSubmitItems?: (items: SettlementSubmissionItem[]) => Promise<void> | void;
  onSubmitManual?: (item: SettlementSubmissionItem) => Promise<void> | void;
  invoiceId?: string;
  invoice?: ErpInvoice | Partial<ErpInvoice> | any | null;
  invoiceDirection?: "IN" | "OUT";
  defaultType?: SettlementType;
  isSubmitting?: boolean;
  isTabsMode?: boolean;
  caseId?: string;
  caseCode?: string;
  caseRemainingDebt?: number;
  initialType?: SettlementType;
  title?: string;
  existingVoucherIds?: string[];
  existingCaseSettlements?: any[];
  headerSlot?: ReactNode;
}

/**
 * Model cho bảng giao dịch đã chọn
 */
export interface SelectedVoucherItem {
  id: string;
  txn: any;
  amount: number;
}
