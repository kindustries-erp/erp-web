/**
 * Lỗi lưu giao dịch theo từng bước. UI map `step` sang khóa i18n
 * (`v2.bankStatements.cashDetail.error.*`); `serverMessage` chỉ là thông điệp gốc của API.
 * Bước `POST` nghĩa là thông tin đã được lưu nhưng hạch toán chưa lưu (R6).
 */
export type CashSaveStep = "UPDATE_INFO" | "POST" | "UNPOST";

export class CashTransactionSaveError extends Error {
  readonly step: CashSaveStep;
  readonly serverMessage?: string;
  readonly cause?: unknown;

  constructor(step: CashSaveStep, serverMessage?: string, cause?: unknown) {
    super(serverMessage ?? step);
    this.name = "CashTransactionSaveError";
    this.step = step;
    this.serverMessage = serverMessage;
    this.cause = cause;
  }
}
