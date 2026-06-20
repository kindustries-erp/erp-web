# Task 01 — API Contract: Types + DTO + Transition Endpoints

## Scope

File duy nhất cần sửa: `src/modules/finance/api/financeApi.ts`

Không tạo file mới. Không sửa file khác.

---

## 1. Thêm type `CounterpartySource`

Thêm ngay sau dòng `export type CounterpartyRole = ...` (khoảng line 252):

```ts
// BEFORE (không có type này)

// AFTER — thêm dưới dòng khai báo CounterpartyRole
export type CounterpartySource = "INTERNAL" | "EXTERNAL";
```

---

## 2. Mở rộng interface `PaymentVoucher`

Interface hiện tại (`export interface PaymentVoucher`) bắt đầu tại line ~258, **thiếu** các field sau. Thêm vào cuối block, trước dấu `}` đóng:

```ts
// Thêm vào cuối interface PaymentVoucher, trước dấu }

  // --- Fields mới từ backend counterparty redesign ---
  counterparty_source: CounterpartySource | null;
  employee_id:
    | string
    | {
        id: string;
        employee_code?: string | null;
        full_name?: string | null;
        phone?: string | null;
        identity_no?: string | null;
      }
    | null;
  counterparty_phone_snapshot: string | null;
  counterparty_identity_no_snapshot: string | null;
  beneficiary_bank_name_snapshot: string | null;
  beneficiary_bank_account_snapshot: string | null;
  beneficiary_account_holder_snapshot: string | null;
```

**Lưu ý quan trọng**: `employee_id` phải là union type (string | object | null) vì Directus/backend có thể populate object thay vì chỉ ID string. Không dùng `employee_id: string | null` thuần túy.

---

## 3. Mở rộng `CreatePaymentVoucherDto`

Interface hiện tại bắt đầu line ~294. Thêm các field sau vào cuối (trước dấu `}`):

```ts
// Thêm vào cuối CreatePaymentVoucherDto, trước dấu }

  // --- Fields mới ---
  counterparty_source?: CounterpartySource;
  employee_id?: string;                       // chỉ gửi ID string, không gửi object
  counterparty_phone_snapshot?: string;
  counterparty_identity_no_snapshot?: string;
  beneficiary_bank_name_snapshot?: string;
  beneficiary_bank_account_snapshot?: string;
  beneficiary_account_holder_snapshot?: string;
```

Sửa dòng `counterparty_id: string;` thành `counterparty_id?: string;` (optional vì INTERNAL không cần).

---

## 4. Mở rộng params `getPaymentVouchersPagedApi`

Hàm hiện tại ở line ~325. Thêm 2 param filter vào type params object:

```ts
// Tìm đoạn:
  } = {},
): Promise<PaginatedResponse<PaymentVoucher>> {

// Trong type params, thêm sau dòng `amount_max?: number;`:
    counterparty_source?: CounterpartySource;
    employee_id?: string;
```

Trong body hàm, thêm 2 dòng vào spread params (theo pattern hiện có):

```ts
// Trong phần ...params truyền vào axiosInstance.get, thêm sau amount_max:
          ...(params.counterparty_source ? { counterparty_source: params.counterparty_source } : {}),
          ...(params.employee_id ? { employee_id: params.employee_id } : {}),
```

Cũng thêm 2 key vào cache key array (sau `params.amount_max ?? ""`):

```ts
    params.counterparty_source ?? "",
    params.employee_id ?? "",
```

---

## 5. Thêm 5 transition API functions

Thêm sau hàm `deletePaymentVoucherApi` (cuối block PaymentVoucher, trước block `PaymentVoucherAttachment`):

```ts
// ─── PaymentVoucher Status Transitions ───────────────────────────────────────

export async function submitPaymentVoucherApi(
  id: string,
): Promise<PaymentVoucher> {
  const { data } = await axiosInstance.post<{
    message: string;
    data: PaymentVoucher;
  }>(`/api/v1/payment-vouchers/${id}/submit`);
  return data.data;
}

export async function approvePaymentVoucherApi(
  id: string,
): Promise<PaymentVoucher> {
  const { data } = await axiosInstance.post<{
    message: string;
    data: PaymentVoucher;
  }>(`/api/v1/payment-vouchers/${id}/approve`);
  return data.data;
}

export async function rejectPaymentVoucherApi(
  id: string,
  note?: string,
): Promise<PaymentVoucher> {
  const { data } = await axiosInstance.post<{
    message: string;
    data: PaymentVoucher;
  }>(`/api/v1/payment-vouchers/${id}/reject`, note ? { note } : undefined);
  return data.data;
}

export async function postPaymentVoucherApi(
  id: string,
): Promise<PaymentVoucher> {
  const { data } = await axiosInstance.post<{
    message: string;
    data: PaymentVoucher;
  }>(`/api/v1/payment-vouchers/${id}/post`);
  return data.data;
}

export async function cancelPaymentVoucherApi(
  id: string,
  cancel_reason?: string,
): Promise<PaymentVoucher> {
  const { data } = await axiosInstance.post<{
    message: string;
    data: PaymentVoucher;
  }>(
    `/api/v1/payment-vouchers/${id}/cancel`,
    cancel_reason ? { cancel_reason } : undefined,
  );
  return data.data;
}
```

---

## Acceptance Criteria

- [ ] TypeScript compile không lỗi (`tsc --noEmit`).
- [ ] `CounterpartySource` được export và có thể import ở module khác.
- [ ] `PaymentVoucher.employee_id` có type union (string | object | null).
- [ ] `CreatePaymentVoucherDto.counterparty_id` là optional.
- [ ] 5 hàm transition được export đủ tên.
- [ ] `getPaymentVouchersPagedApi` chấp nhận `counterparty_source` và `employee_id` trong params.
