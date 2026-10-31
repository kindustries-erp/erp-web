/**
 * Enums tập trung cho GarageCashflowDrawer nhằm đảm bảo type-safety
 * và loại bỏ hoàn toàn magic strings theo chuẩn /erp-web-v2-refactor.
 */

export enum GarageCashflowFieldKey {
  TRANS_DATE = "transDate",
  VOUCHER_CODE = "voucherCode",
  VOUCHER_TYPE = "voucherType",
  PAYMENT_STATUS = "paymentStatus",
  PAYMENT_METHOD = "paymentMethod",
  PAYMENT_CONTENT = "paymentContent",
  AMOUNT = "amount",
  CASE_ID = "caseId",
  PARTNER_NAME = "partnerName",
  LICENSE_PLATE = "licensePlate",
  NOTE = "note",
  ERP_BANK_TRANSACTION_ID = "erpBankTransactionId",
  ERP_CASH_VOUCHER_ID = "erpCashVoucherId",
}

export enum GarageVoucherType {
  RECEIPT = "RECEIPT",
  PAYMENT = "PAYMENT",
}

export enum GaragePaymentStatus {
  EXPECTED = "EXPECTED",
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  PAID = "PAID",
}
