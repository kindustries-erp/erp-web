import type {
  AttachmentType,
  CounterpartyRole,
  CounterpartySource,
  VoucherStatus,
  CashBankRelatedDocumentInput,
} from "@/modules/finance/api/financeApi";

// ── Voucher form shape ────────────────────────────────────────────────────────

export interface CashVoucherForm {
  voucher_no: string;
  voucher_type: "CASH_RECEIPT" | "CASH_PAYMENT" | "CUSTOMER_ADVANCE_RECEIPT";
  document_date: string;
  posting_date: string;
  cash_fund_id: string;
  counterparty_source: CounterpartySource;
  counterparty_id: string;
  employee_id: string;
  counterparty_name_snapshot: string;
  counterparty_tax_code_snapshot: string;
  counterparty_address_snapshot: string;
  counterparty_phone_snapshot: string;
  counterparty_identity_no_snapshot: string;
  counterparty_role: string;
  debit_account_id: string;
  credit_account_id: string;
  amount: string;
  amount_in_words: string;
  description: string;
  cancel_reason: string;
  cash_bank_tag_preset_id: string;
  related_documents: CashBankRelatedDocumentInput[];
}

export interface BankVoucherForm {
  voucher_no: string;
  voucher_type: "BANK_RECEIPT" | "BANK_PAYMENT" | "CUSTOMER_ADVANCE_RECEIPT";
  document_date: string;
  posting_date: string;
  company_bank_account_id: string;
  counterparty_source: CounterpartySource;
  counterparty_id: string;
  employee_id: string;
  counterparty_name_snapshot: string;
  counterparty_tax_code_snapshot: string;
  counterparty_address_snapshot: string;
  counterparty_phone_snapshot: string;
  counterparty_identity_no_snapshot: string;
  counterparty_role: string;
  beneficiary_bank_account_id: string;
  debit_account_id: string;
  credit_account_id: string;
  amount: string;
  amount_in_words: string;
  description: string;
  cancel_reason: string;
  cash_bank_tag_preset_id: string;
  related_documents: CashBankRelatedDocumentInput[];
}

// ── Shared option lists ───────────────────────────────────────────────────────

export const STATUS_FILTER_OPTS: { value: VoucherStatus; label: string }[] = [
  { value: "DRAFT", label: "Nháp" },
  { value: "PENDING_APPROVAL", label: "Chờ duyệt" },
  { value: "APPROVED", label: "Đã duyệt" },
  { value: "POSTED", label: "Đã hạch toán" },
  { value: "REJECTED", label: "Từ chối" },
  { value: "CANCELLED", label: "Đã hủy" },
];

export const STATUS_LABELS: Record<VoucherStatus, string> = {
  DRAFT: "Nháp",
  PENDING_APPROVAL: "Chờ duyệt",
  APPROVED: "Đã duyệt",
  POSTED: "Đã hạch toán",
  REJECTED: "Từ chối",
  CANCELLED: "Đã hủy",
};

export const ATTACHMENT_TYPE_OPTS: { value: AttachmentType; label: string }[] = [
  { value: "INVOICE", label: "Hóa đơn" },
  { value: "RECEIPT", label: "Biên lai" },
  { value: "CONTRACT", label: "Hợp đồng" },
  { value: "PAYMENT_REQUEST", label: "Đề nghị thanh toán" },
  { value: "BANK_STATEMENT", label: "Sao kê ngân hàng" },
  { value: "OTHER", label: "Khác" },
];

export const COUNTERPARTY_ROLE_OPTS: { value: CounterpartyRole; label: string }[] = [
  { value: "CUSTOMER", label: "Khách hàng" },
  { value: "VENDOR", label: "Nhà cung cấp" },
  { value: "EMPLOYEE", label: "Nhân viên" },
  { value: "BANK", label: "Ngân hàng" },
  { value: "GOVERNMENT", label: "Cơ quan nhà nước" },
  { value: "INTERNAL", label: "Nội bộ" },
  { value: "SHAREHOLDER", label: "Cổ đông" },
  { value: "OTHER", label: "Khác" },
];

export const COUNTERPARTY_SOURCE_OPTS: { value: CounterpartySource; label: string }[] = [
  { value: "EXTERNAL", label: "Bên ngoài (đối tác)" },
  { value: "INTERNAL", label: "Nội bộ (nhân viên)" },
];
