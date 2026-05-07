# Task 02 — Form Types + Mappers

## Dependency

Phải hoàn thành **Task 01** trước. Task này import `CounterpartySource` từ financeApi.ts.

## Scope

Hai file cần sửa:

1. `src/modules/finance/types/voucherForm.ts`
2. `src/modules/finance/utils/financeHelpers.ts`

---

## File 1: `src/modules/finance/types/voucherForm.ts`

### 1a. Thêm import `CounterpartySource`

```ts
// BEFORE (dòng 1):
import type { AttachmentType, CounterpartyRole, VoucherStatus } from "@/modules/finance/api/financeApi";

// AFTER:
import type {
  AttachmentType,
  CounterpartyRole,
  CounterpartySource,
  VoucherStatus,
} from "@/modules/finance/api/financeApi";
```

### 1b. Mở rộng `CashVoucherForm`

```ts
// BEFORE — interface hiện tại:
export interface CashVoucherForm {
  voucher_no: string;
  voucher_type: "CASH_RECEIPT" | "CASH_PAYMENT";
  document_date: string;
  posting_date: string;
  cash_fund_id: string;
  counterparty_id: string;
  counterparty_name_snapshot: string;
  counterparty_tax_code_snapshot: string;
  counterparty_address_snapshot: string;
  counterparty_role: string;
  debit_account_id: string;
  credit_account_id: string;
  amount: string;
  amount_in_words: string;
  description: string;
  cancel_reason: string;
}

// AFTER — thêm 4 field mới:
export interface CashVoucherForm {
  voucher_no: string;
  voucher_type: "CASH_RECEIPT" | "CASH_PAYMENT";
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
}
```

### 1c. Mở rộng `BankVoucherForm`

```ts
// BEFORE — interface hiện tại:
export interface BankVoucherForm {
  voucher_no: string;
  voucher_type: "BANK_RECEIPT" | "BANK_PAYMENT";
  document_date: string;
  posting_date: string;
  company_bank_account_id: string;
  counterparty_id: string;
  counterparty_name_snapshot: string;
  counterparty_tax_code_snapshot: string;
  counterparty_address_snapshot: string;
  counterparty_role: string;
  beneficiary_bank_account_id: string;
  debit_account_id: string;
  credit_account_id: string;
  amount: string;
  amount_in_words: string;
  description: string;
}

// AFTER — thêm 4 field mới:
export interface BankVoucherForm {
  voucher_no: string;
  voucher_type: "BANK_RECEIPT" | "BANK_PAYMENT";
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
}
```

### 1d. Thêm option list `COUNTERPARTY_SOURCE_OPTS`

Thêm vào cuối file, sau `COUNTERPARTY_ROLE_OPTS`:

```ts
export const COUNTERPARTY_SOURCE_OPTS: { value: CounterpartySource; label: string }[] = [
  { value: "EXTERNAL", label: "Bên ngoài (đối tác)" },
  { value: "INTERNAL", label: "Nội bộ (nhân viên)" },
];
```

---

## File 2: `src/modules/finance/utils/financeHelpers.ts`

### 2a. Cập nhật `emptyForm` (CASH)

```ts
// BEFORE:
export function emptyForm(vtype: "CASH_RECEIPT" | "CASH_PAYMENT"): CashVoucherForm {
  return {
    voucher_no: "",
    voucher_type: vtype,
    document_date: TODAY,
    posting_date: TODAY,
    cash_fund_id: "",
    counterparty_id: "",
    counterparty_name_snapshot: "",
    counterparty_tax_code_snapshot: "",
    counterparty_address_snapshot: "",
    counterparty_role: "",
    debit_account_id: "",
    credit_account_id: "",
    amount: "",
    amount_in_words: "",
    description: "",
    cancel_reason: "",
  };
}

// AFTER — thêm 4 field mới với default EXTERNAL:
export function emptyForm(vtype: "CASH_RECEIPT" | "CASH_PAYMENT"): CashVoucherForm {
  return {
    voucher_no: "",
    voucher_type: vtype,
    document_date: TODAY,
    posting_date: TODAY,
    cash_fund_id: "",
    counterparty_source: "EXTERNAL",
    counterparty_id: "",
    employee_id: "",
    counterparty_name_snapshot: "",
    counterparty_tax_code_snapshot: "",
    counterparty_address_snapshot: "",
    counterparty_phone_snapshot: "",
    counterparty_identity_no_snapshot: "",
    counterparty_role: "",
    debit_account_id: "",
    credit_account_id: "",
    amount: "",
    amount_in_words: "",
    description: "",
    cancel_reason: "",
  };
}
```

### 2b. Cập nhật `buildForm` (CASH — từ PaymentVoucher về form)

```ts
// BEFORE:
export function buildForm(v: PaymentVoucher): CashVoucherForm {
  return {
    voucher_no: v.voucher_no,
    voucher_type: v.voucher_type as "CASH_RECEIPT" | "CASH_PAYMENT",
    document_date: v.document_date,
    posting_date: v.posting_date,
    cash_fund_id: v.cash_fund_id ?? "",
    counterparty_id: v.counterparty_id ?? "",
    counterparty_name_snapshot: v.counterparty_name_snapshot,
    counterparty_tax_code_snapshot: v.counterparty_tax_code_snapshot ?? "",
    counterparty_address_snapshot: v.counterparty_address_snapshot ?? "",
    counterparty_role: v.counterparty_role ?? "",
    debit_account_id: v.debit_account_id,
    credit_account_id: v.credit_account_id,
    amount: formatMoneyInput(v.amount),
    amount_in_words: v.amount_in_words ?? "",
    description: v.description,
    cancel_reason: v.cancel_reason ?? "",
  };
}

// AFTER — thêm 4 field mới, resolve employee_id an toàn:
export function buildForm(v: PaymentVoucher): CashVoucherForm {
  const employeeId =
    typeof v.employee_id === "object" && v.employee_id !== null
      ? v.employee_id.id ?? ""
      : (v.employee_id ?? "");
  return {
    voucher_no: v.voucher_no,
    voucher_type: v.voucher_type as "CASH_RECEIPT" | "CASH_PAYMENT",
    document_date: v.document_date,
    posting_date: v.posting_date,
    cash_fund_id: v.cash_fund_id ?? "",
    counterparty_source: v.counterparty_source ?? "EXTERNAL",
    counterparty_id: v.counterparty_id ?? "",
    employee_id: employeeId,
    counterparty_name_snapshot: v.counterparty_name_snapshot,
    counterparty_tax_code_snapshot: v.counterparty_tax_code_snapshot ?? "",
    counterparty_address_snapshot: v.counterparty_address_snapshot ?? "",
    counterparty_phone_snapshot: v.counterparty_phone_snapshot ?? "",
    counterparty_identity_no_snapshot: v.counterparty_identity_no_snapshot ?? "",
    counterparty_role: v.counterparty_role ?? "",
    debit_account_id: v.debit_account_id,
    credit_account_id: v.credit_account_id,
    amount: formatMoneyInput(v.amount),
    amount_in_words: v.amount_in_words ?? "",
    description: v.description,
    cancel_reason: v.cancel_reason ?? "",
  };
}
```

### 2c. Cập nhật `emptyBankForm` (BANK)

```ts
// BEFORE:
export function emptyBankForm(
  vtype: "BANK_RECEIPT" | "BANK_PAYMENT",
): BankVoucherForm {
  return {
    voucher_no: "",
    voucher_type: vtype,
    document_date: TODAY,
    posting_date: TODAY,
    company_bank_account_id: "",
    counterparty_id: "",
    counterparty_name_snapshot: "",
    counterparty_tax_code_snapshot: "",
    counterparty_address_snapshot: "",
    counterparty_role: "",
    beneficiary_bank_account_id: "",
    debit_account_id: "",
    credit_account_id: "",
    amount: "",
    amount_in_words: "",
    description: "",
  };
}

// AFTER:
export function emptyBankForm(
  vtype: "BANK_RECEIPT" | "BANK_PAYMENT",
): BankVoucherForm {
  return {
    voucher_no: "",
    voucher_type: vtype,
    document_date: TODAY,
    posting_date: TODAY,
    company_bank_account_id: "",
    counterparty_source: "EXTERNAL",
    counterparty_id: "",
    employee_id: "",
    counterparty_name_snapshot: "",
    counterparty_tax_code_snapshot: "",
    counterparty_address_snapshot: "",
    counterparty_phone_snapshot: "",
    counterparty_identity_no_snapshot: "",
    counterparty_role: "",
    beneficiary_bank_account_id: "",
    debit_account_id: "",
    credit_account_id: "",
    amount: "",
    amount_in_words: "",
    description: "",
    cancel_reason: "",
  };
}
```

### 2d. Cập nhật `buildBankForm` (BANK)

```ts
// BEFORE:
export function buildBankForm(v: PaymentVoucher): BankVoucherForm {
  return {
    voucher_no: v.voucher_no,
    voucher_type: v.voucher_type as "BANK_RECEIPT" | "BANK_PAYMENT",
    document_date: v.document_date,
    posting_date: v.posting_date,
    company_bank_account_id: v.company_bank_account_id ?? "",
    counterparty_id: v.counterparty_id ?? "",
    counterparty_name_snapshot: v.counterparty_name_snapshot,
    counterparty_tax_code_snapshot: v.counterparty_tax_code_snapshot ?? "",
    counterparty_address_snapshot: v.counterparty_address_snapshot ?? "",
    counterparty_role: v.counterparty_role ?? "",
    beneficiary_bank_account_id: v.beneficiary_bank_account_id ?? "",
    debit_account_id: v.debit_account_id,
    credit_account_id: v.credit_account_id,
    amount: formatMoneyInput(v.amount),
    amount_in_words: v.amount_in_words ?? "",
    description: v.description,
  };
}

// AFTER:
export function buildBankForm(v: PaymentVoucher): BankVoucherForm {
  const employeeId =
    typeof v.employee_id === "object" && v.employee_id !== null
      ? v.employee_id.id ?? ""
      : (v.employee_id ?? "");
  return {
    voucher_no: v.voucher_no,
    voucher_type: v.voucher_type as "BANK_RECEIPT" | "BANK_PAYMENT",
    document_date: v.document_date,
    posting_date: v.posting_date,
    company_bank_account_id: v.company_bank_account_id ?? "",
    counterparty_source: v.counterparty_source ?? "EXTERNAL",
    counterparty_id: v.counterparty_id ?? "",
    employee_id: employeeId,
    counterparty_name_snapshot: v.counterparty_name_snapshot,
    counterparty_tax_code_snapshot: v.counterparty_tax_code_snapshot ?? "",
    counterparty_address_snapshot: v.counterparty_address_snapshot ?? "",
    counterparty_phone_snapshot: v.counterparty_phone_snapshot ?? "",
    counterparty_identity_no_snapshot: v.counterparty_identity_no_snapshot ?? "",
    counterparty_role: v.counterparty_role ?? "",
    beneficiary_bank_account_id: v.beneficiary_bank_account_id ?? "",
    debit_account_id: v.debit_account_id,
    credit_account_id: v.credit_account_id,
    amount: formatMoneyInput(v.amount),
    amount_in_words: v.amount_in_words ?? "",
    description: v.description,
    cancel_reason: v.cancel_reason ?? "",
  };
}
```

---

## Acceptance Criteria

- [ ] TypeScript compile không lỗi.
- [ ] `CashVoucherForm` có `counterparty_source`, `employee_id`, `counterparty_phone_snapshot`, `counterparty_identity_no_snapshot`.
- [ ] `BankVoucherForm` có các field tương tự và thêm `cancel_reason`.
- [ ] `emptyForm` và `emptyBankForm` default `counterparty_source = "EXTERNAL"`.
- [ ] `buildForm` và `buildBankForm` resolve `employee_id` an toàn khi API trả về object.
- [ ] `COUNTERPARTY_SOURCE_OPTS` được export từ `voucherForm.ts`.
