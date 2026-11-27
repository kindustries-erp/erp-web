/**
 * Enum dùng chung cho họ core transfer-qr-core theo chuẩn Phần D /erp-ui-structure.
 * Đảm bảo các key field, tab và cột bảng không dùng chuỗi cứng.
 */

/** Hai luồng QR: trả tiền nhà cung cấp, hoặc nhận tiền từ khách vào tài khoản công ty. */
export enum TransferQrMode {
  PAY_TO_SUPPLIER = "payToSupplier",
  RECEIVE_FROM_CUSTOMER = "receiveFromCustomer",
}

/** Hai tab đầu drawer: một mã QR hoặc nhiều lệnh thanh toán. */
export enum TransferQrDrawerTab {
  SINGLE = "single",
  BATCH = "batch",
}

/** Khóa các cột trong bảng biên tập lệnh thanh toán hàng loạt (TransferQrBatchEditor). */
export enum TransferQrBatchColumn {
  INDEX = "index",
  BANK = "bank",
  ACCOUNT_NUMBER = "accountNumber",
  ACCOUNT_NAME = "accountName",
  AMOUNT = "amount",
  CONTENT = "content",
  REMOVE = "remove",
}

/** Biến thể hiển thị Thẻ mã QR thanh toán. */
export enum TransferQrCardVariant {
  FULL = "full",
  COMPACT = "compact",
  HORIZONTAL = "horizontal",
}
