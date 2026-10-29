import type { NetOffPayloadItem } from "./useCashInvoiceNetOffPicker";

export interface CashInvoiceNetOffModalProps {
  open: boolean;
  onClose: () => void;
  /** Trả về các khoản cấn trừ đã nhập số tiền hợp lệ */
  onSelect: (items: NetOffPayloadItem[]) => void;
  direction: "IN" | "OUT";
  existingInvoiceIds: string[];
  /** Số tiền còn có thể cấn trừ của giao dịch */
  maxAvailableAmount: number;
}
