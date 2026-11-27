import {
  TransferQrMode,
  TransferQrDrawerTab,
  TransferQrBatchColumn,
  TransferQrCardVariant,
} from "./transferQr.enum";

export {
  TransferQrMode,
  TransferQrDrawerTab,
  TransferQrBatchColumn,
  TransferQrCardVariant,
};

/** Nhãn i18n của từng chế độ; một nguồn duy nhất cho tab trái của drawer. */
export const TRANSFER_QR_MODE_LABEL_KEY: Record<TransferQrMode, string> = {
  [TransferQrMode.PAY_TO_SUPPLIER]: "v2.transferQr.modes.pay",
  [TransferQrMode.RECEIVE_FROM_CUSTOMER]: "v2.transferQr.modes.receive",
};

/**
 * Tài khoản đưa vào lõi. Lõi không biết dữ liệu ERP:
 * module là nơi map dữ liệu gốc sang kiểu này.
 */
export interface TransferQrAccountOption {
  id: string;
  /** Nhãn hiển thị trong danh sách chọn */
  label: string;
  /** Mã viết tắt hiển thị và dùng cho tên file, ví dụ VCB */
  bankCode: string;
  /** Mã BIN Napas; null khi module không khớp được ngân hàng */
  bin: string | null;
  accountNumber: string;
  accountName: string;
  /** Link ảnh logo ngân hàng */
  logoUrl?: string | null;
}

export interface TransferQrFormState {
  mode: TransferQrMode;
  /** Chế độ nhận tiền: tài khoản công ty đã chọn */
  accountId: string | null;
  /** Mã BIN chọn tay khi tài khoản không tự khớp được ngân hàng */
  bin: string | null;
  /** Chế độ trả tiền: số tài khoản người nhận */
  accountNumber: string;
  /** Chế độ trả tiền: tên chủ tài khoản (chỉ để đối chiếu, không nằm trong QR) */
  accountName: string;
  /** Số tiền nhập tay, null = QR tĩnh */
  amount: number | null;
  content: string;
}

export type TransferQrErrorField =
  | "account"
  | "bin"
  | "accountNumber"
  | "accountName"
  | "amount";

export type TransferQrErrorCode =
  | "required"
  | "invalidAccountNumber"
  | "invalidAmount";

export type TransferQrErrors = Partial<
  Record<TransferQrErrorField, TransferQrErrorCode>
>;

/**
 * Thông tin doanh nghiệp hiển thị trên Thẻ thanh toán (Card).
 * Nhận từ module ERP (ví dụ qua useCompanyProfile).
 */
export interface TransferQrCompanyInfo {
  companyName?: string;
  taxCode?: string;
  logo?: string;
}
