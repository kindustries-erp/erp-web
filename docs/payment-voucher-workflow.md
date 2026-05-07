# Payment Voucher — Workflow Chi Tiết

Tài liệu này mô tả toàn bộ luồng hoạt động của module phiếu thu/chi (TienMat) và lệnh chuyển tiền (TienGui) sau khi hoàn thành 5 task refactor.

---

## 1. Kiến trúc tổng quan

```
TienMat.tsx / TienGui.tsx          ← Page (UI + state orchestration)
    │
    ├── useVoucherList              ← Fetch + phân trang + sort danh sách
    ├── useVoucherDashboard         ← KPI, biểu đồ, donut
    ├── useVoucherDrawer            ← Drawer state + status transitions (TienMat)
    ├── useCashVoucherHandlers      ← Form logic CASH (TienMat)
    ├── useBankVoucherHandlers      ← Form logic BANK (TienGui)
    │
    ├── CashVoucherDrawer           ← Drawer UI cho CASH (TienMat)
    ├── DrawerModal (inline)        ← Drawer UI cho BANK (TienGui)
    ├── VoucherTable                ← Bảng danh sách + filter
    └── ApprovalHistory             ← Timeline lịch sử duyệt
```

---

## 2. Data Model — Các type quan trọng

### 2.1 `CounterpartySource`

```ts
type CounterpartySource = "INTERNAL" | "EXTERNAL";
```

- `EXTERNAL` — đối tác bên ngoài (BusinessPartner): khách hàng, nhà cung cấp, v.v.
- `INTERNAL` — nhân viên nội bộ (Employee)

### 2.2 `PaymentVoucher` — các field mới

```ts
interface PaymentVoucher {
  // ... fields cũ ...
  counterparty_source: CounterpartySource | null;
  employee_id: string | { id: string; full_name?; phone?; identity_no?; ... } | null;
  counterparty_phone_snapshot: string | null;
  counterparty_identity_no_snapshot: string | null;
  beneficiary_bank_name_snapshot: string | null;
  beneficiary_bank_account_snapshot: string | null;
  beneficiary_account_holder_snapshot: string | null;
}
```

> **Lưu ý**: `employee_id` là union type vì Directus/backend có thể populate object thay vì chỉ ID string. Khi đọc, luôn dùng `typeof v.employee_id === "object" ? v.employee_id.id : v.employee_id`.

### 2.3 `VoucherStatus` — State Machine

```
DRAFT ──► PENDING_APPROVAL ──► APPROVED ──► POSTED
  │               │                │
  │            CANCEL           CANCEL
  │               │
  └────────► REJECTED ──► (về DRAFT để sửa không còn, chỉ DRAFT mới sửa được)
  │
CANCELLED (từ bất kỳ trạng thái nào trừ POSTED)
```

### 2.4 `CreatePaymentVoucherDto` — các field mới

```ts
interface CreatePaymentVoucherDto {
  counterparty_id?: string; // optional (INTERNAL không cần)
  counterparty_source?: CounterpartySource;
  employee_id?: string; // chỉ gửi khi INTERNAL
  counterparty_phone_snapshot?: string;
  counterparty_identity_no_snapshot?: string;
  beneficiary_bank_name_snapshot?: string;
  beneficiary_bank_account_snapshot?: string;
  beneficiary_account_holder_snapshot?: string;
}
```

---

## 3. API Endpoints

### 3.1 CRUD cơ bản

| Method | Endpoint                           | Mô tả                           |
| ------ | ---------------------------------- | ------------------------------- |
| GET    | `/api/v1/payment-vouchers`         | Danh sách có phân trang, filter |
| POST   | `/api/v1/payment-vouchers`         | Tạo mới                         |
| PATCH  | `/api/v1/payment-vouchers/:id`     | Cập nhật (chỉ DRAFT)            |
| DELETE | `/api/v1/payment-vouchers/:id`     | Xóa                             |
| GET    | `/api/v1/payment-vouchers/:id`     | Chi tiết                        |
| GET    | `/api/v1/payment-vouchers/summary` | KPI tổng hợp                    |

### 3.2 Transition Endpoints (Task 01)

| Action  | Endpoint                             | Điều kiện                          |
| ------- | ------------------------------------ | ---------------------------------- |
| Submit  | `POST /payment-vouchers/:id/submit`  | DRAFT → PENDING_APPROVAL           |
| Approve | `POST /payment-vouchers/:id/approve` | PENDING_APPROVAL → APPROVED        |
| Reject  | `POST /payment-vouchers/:id/reject`  | PENDING_APPROVAL → REJECTED        |
| Post    | `POST /payment-vouchers/:id/post`    | APPROVED → POSTED                  |
| Cancel  | `POST /payment-vouchers/:id/cancel`  | DRAFT/PENDING/APPROVED → CANCELLED |

```ts
// reject và cancel nhận body optional:
rejectPaymentVoucherApi(id, note?)
cancelPaymentVoucherApi(id, cancel_reason?)
```

### 3.3 Filter params mới cho GET list

```
counterparty_source: "INTERNAL" | "EXTERNAL"
employee_id: string
```

---

## 4. Form Types

### 4.1 `CashVoucherForm` — các field mới

```ts
interface CashVoucherForm {
  counterparty_source: CounterpartySource; // default "EXTERNAL"
  employee_id: string; // ID nhân viên (INTERNAL)
  counterparty_phone_snapshot: string;
  counterparty_identity_no_snapshot: string;
  // ... các field cũ ...
}
```

### 4.2 `BankVoucherForm` — các field mới

```ts
interface BankVoucherForm {
  counterparty_source: CounterpartySource; // default "EXTERNAL"
  employee_id: string;
  counterparty_phone_snapshot: string;
  counterparty_identity_no_snapshot: string;
  cancel_reason: string; // (thêm mới so với trước)
  // ... các field cũ ...
}
```

### 4.3 `COUNTERPARTY_SOURCE_OPTS`

```ts
[
  { value: "EXTERNAL", label: "Bên ngoài (đối tác)" },
  { value: "INTERNAL", label: "Nội bộ (nhân viên)" },
];
```

---

## 5. Builder Functions (financeHelpers.ts)

### `emptyForm` / `emptyBankForm`

- Default `counterparty_source = "EXTERNAL"`
- Tất cả snapshot fields = `""`

### `buildForm` / `buildBankForm`

- Map `PaymentVoucher` → form state khi mở drawer để sửa
- `employee_id` được resolve an toàn:
  ```ts
  const employeeId =
    typeof v.employee_id === "object" && v.employee_id !== null
      ? (v.employee_id.id ?? "")
      : (v.employee_id ?? "");
  ```
- `counterparty_source` fallback về `"EXTERNAL"` nếu backend trả `null`

---

## 6. Hook Logic

### 6.1 `useVoucherDrawer` (dùng cho TienMat)

Quản lý: drawer open/close, editing state, attachments, status transitions.

**`handleStatusTransition(action, onSuccess, opts?)`**

```ts
// action: "SUBMIT" | "APPROVE" | "REJECT" | "POST" | "CANCEL"
// opts: { note?: string; cancel_reason?: string }
```

Gọi đúng endpoint transition thay vì PATCH status.

Thêm state: `cancelReason`, `setCancelReason` (dùng khi cần prompt lý do hủy).

### 6.2 `useCashVoucherHandlers`

**Params mới**: `employees: Employee[]`

**`handleEmployeeChange(employeeId)`**

```ts
// Khi chọn nhân viên (INTERNAL):
setForm({
  employee_id: employeeId,
  counterparty_id: "", // clear partner
  counterparty_name_snapshot: emp.full_name,
  counterparty_phone_snapshot: emp.phone ?? "",
  counterparty_identity_no_snapshot: "", // chưa có trên Employee type
  counterparty_tax_code_snapshot: "",
  counterparty_address_snapshot: "",
});
```

**`handlePartnerChange(partnerId)`** — cập nhật thêm:

```ts
// Khi chọn đối tác (EXTERNAL):
setForm({
  counterparty_id: partnerId,
  employee_id: "", // clear employee
  counterparty_phone_snapshot: partner.phone ?? "",
  counterparty_identity_no_snapshot: "",
  // ... name, tax_code, address như cũ
});
```

**Validation trong `handleSave`**:

```ts
if (form.counterparty_source === "INTERNAL" && !form.employee_id) → error
if (form.counterparty_source === "EXTERNAL" && !form.counterparty_id) → error
```

**DTO build**:

```ts
counterparty_source: form.counterparty_source,
...(form.counterparty_source === "INTERNAL"
  ? { employee_id: form.employee_id }
  : { counterparty_id: form.counterparty_id }),
counterparty_name_snapshot: /* resolve từ employees hoặc partners */,
```

### 6.3 `useBankVoucherHandlers`

Áp dụng tất cả logic tương tự `useCashVoucherHandlers`.

`handleEmployeeChange` thêm `beneficiary_bank_account_id: ""` khi chọn nhân viên (vì nhân viên không có tài khoản ngân hàng đối tác).

**`handleStatusTransition` đã bị xóa** — TienGui dùng local function riêng gọi trực tiếp các transition API.

**Expose thêm**: `setSaving`, `setSaveError`, `reloadCurrentData` để TienGui dùng trong local function.

### 6.4 `useVoucherList`

**Params mới**:

```ts
counterpartySourceFilter?: CounterpartySource | "";
employeeIdFilter?: string;
```

Được truyền thẳng vào `getPaymentVouchersPagedApi`.

---

## 7. Drawer UI

### 7.1 Section "Đối tượng" — logic toggle

```
[Loại đối tượng: Combobox COUNTERPARTY_SOURCE_OPTS]

if INTERNAL:
  [Nhân viên: Combobox employeeOpts]

if EXTERNAL:
  [Đối tác: Combobox partnerOpts]
  [Ngân hàng đối tác: Combobox partnerBankOpts]  ← chỉ TienGui
  [Vai trò: Combobox COUNTERPARTY_ROLE_OPTS]
  [MST: input readonly]
  [Địa chỉ: input readonly]

[Snapshot preview] ← hiện khi có counterparty_name/phone/identity_no_snapshot:
  Tên: ...
  SĐT: ...
  CMND/CCCD: ...
```

### 7.2 Action Buttons — theo trạng thái

| Status                        | Buttons                                |
| ----------------------------- | -------------------------------------- |
| Tạo mới / Edit mode           | Hủy bỏ · Lưu nháp · **Gửi duyệt**      |
| DRAFT (view)                  | Đóng · Hủy phiếu · **Gửi duyệt**       |
| PENDING_APPROVAL              | Đóng · Hủy phiếu · Từ chối · **Duyệt** |
| APPROVED                      | Đóng · Hủy phiếu · **Hạch toán**       |
| POSTED / REJECTED / CANCELLED | Đóng                                   |

> `canEdit` (nút Sửa): chỉ hiện khi `editing.status === "DRAFT"`. Không còn cho sửa khi REJECTED.

### 7.3 Section "Lịch sử duyệt"

Hiện bên dưới Section Đính kèm, chỉ khi `editing !== null`.

Render bởi component `ApprovalHistory`.

---

## 8. Component `ApprovalHistory`

File: `src/modules/finance/components/ApprovalHistory/index.tsx`

**Props**: `{ voucherId: string }`

**Behavior**:

- Gọi `getVoucherApprovalLogsApi(voucherId)` khi mount hoặc `voucherId` thay đổi
- Loading state: hiện "Đang tải lịch sử duyệt..." với animation pulse
- Empty state: "Chưa có hoạt động duyệt."
- Render timeline: mỗi log một dòng với badge màu theo action

**Badge màu**:

| Action  | Màu badge  |
| ------- | ---------- |
| SUBMIT  | Xanh dương |
| APPROVE | Xanh lá    |
| REJECT  | Đỏ         |
| POST    | Tím        |
| CANCEL  | Xám        |

**Thông tin mỗi log**:

- Badge action + trạng thái chuyển (`from_status → to_status`)
- Thời gian (`toLocaleString("vi-VN")`) + người thực hiện (`action_by`)
- Ghi chú nếu có (`note`)

---

## 9. VoucherTable — Filter & Badge

### 9.1 Filter mới "Loại đối tượng"

```tsx
<Combobox
  options={[
    { value: "", label: "Tất cả đối tượng" },
    ...COUNTERPARTY_SOURCE_OPTS,
  ]}
  value={counterpartySourceFilter}
  onChange={onCounterpartySourceFilter}
  placeholder="Loại đối tượng"
  className="w-[180px]"
/>
```

Props mới của `VoucherTable`:

```ts
counterpartySourceFilter: CounterpartySource | "";
onCounterpartySourceFilter: (v: CounterpartySource | "") => void;
```

### 9.2 Badge cột Đối tác

```
INTERNAL  → badge xanh dương "Nội bộ"
EXTERNAL  → badge cam "Bên ngoài"
null      → không có badge
```

---

## 10. Load dữ liệu nhân viên

Cả TienMat và TienGui đều load danh sách nhân viên trong `Promise.all` của `useEffect` catalog:

```ts
Promise.all([
  getCompanyBankAccountsApi(), // hoặc getCashFundsApi()
  getChartOfAccountsApi(),
  getBusinessPartnersApi(),
  getEmployeesApi(), // thêm mới
]);
```

`employeeOpts` được build bằng `useMemo`:

```ts
employees.map((e) => ({
  value: e.id,
  label: `${e.employee_code ?? ""} — ${e.full_name}`.trim().replace(/^— /, ""),
}));
```

> `getEmployeesApi()` được đánh dấu deprecated (nên dùng `getEmployeesPagedApi` cho table view), nhưng vẫn dùng ở đây vì cần toàn bộ danh sách để populate Combobox.

---

## 11. Luồng hoàn chỉnh — Tạo phiếu nội bộ (INTERNAL)

```
1. User click "Tạo PT" (TienMat) / "Tạo UNT" (TienGui)
2. openNew() → emptyForm({ counterparty_source: "EXTERNAL" })
3. User đổi "Loại đối tượng" → "Nội bộ (nhân viên)"
   → onSourceChange("INTERNAL") → setField("counterparty_source", "INTERNAL")
4. UI ẩn Combobox đối tác, hiện Combobox nhân viên
5. User chọn nhân viên → handleEmployeeChange(empId)
   → setForm({ employee_id, counterparty_name_snapshot: emp.full_name, ... })
6. Snapshot preview hiện: Tên, SĐT nhân viên
7. User điền số tiền, tài khoản, diễn giải
8. User click "Gửi duyệt"
   → handleStatusTransition("SUBMIT", callback)
   → hoặc handleSave("DRAFT") rồi submit sau
9. DTO gửi lên:
   {
     counterparty_source: "INTERNAL",
     employee_id: "...",
     counterparty_name_snapshot: "Nguyễn Văn A",
     counterparty_phone_snapshot: "0901...",
     // KHÔNG gửi counterparty_id
   }
10. POST /payment-vouchers → trả về voucher với status DRAFT
11. POST /payment-vouchers/:id/submit → status → PENDING_APPROVAL
```

---

## 12. Luồng duyệt phiếu

```
Người duyệt mở drawer → xem status badge PENDING_APPROVAL
→ Buttons: [Đóng] [Hủy phiếu] [Từ chối] [Duyệt]

Click "Duyệt":
  handleStatusTransition("APPROVE", onSuccess)
  → approvePaymentVoucherApi(id)
  → POST /payment-vouchers/:id/approve
  → toast "Đã duyệt"
  → closeDrawer() + reload list

Click "Từ chối":
  handleStatusTransition("REJECT", onSuccess, { note: cancelReason })
  → rejectPaymentVoucherApi(id, note)
  → POST /payment-vouchers/:id/reject { note }
  → toast "Đã từ chối"

Sau khi APPROVED:
  Buttons: [Đóng] [Hủy phiếu] [Hạch toán]
  Click "Hạch toán" → postPaymentVoucherApi(id)
  → POST /payment-vouchers/:id/post
  → status → POSTED (không thể sửa, không thể hủy)
```

---

## 13. File Index

| File                                                         | Vai trò                                                       |
| ------------------------------------------------------------ | ------------------------------------------------------------- |
| `src/modules/finance/api/financeApi.ts`                      | Types, DTOs, 5 transition endpoints, filter params            |
| `src/modules/finance/types/voucherForm.ts`                   | Form interfaces, `COUNTERPARTY_SOURCE_OPTS`                   |
| `src/modules/finance/utils/financeHelpers.ts`                | `emptyForm`, `buildForm`, `emptyBankForm`, `buildBankForm`    |
| `src/modules/finance/hooks/useVoucherDrawer.ts`              | Drawer state, `handleStatusTransition` (action-based)         |
| `src/modules/finance/hooks/useCashVoucherHandlers.ts`        | CASH form logic, `handleEmployeeChange`                       |
| `src/modules/finance/hooks/useBankVoucherHandlers.ts`        | BANK form logic, `handleEmployeeChange`                       |
| `src/modules/finance/hooks/useVoucherList.ts`                | List fetch, `counterpartySourceFilter`                        |
| `src/modules/finance/components/CashVoucherDrawer/index.tsx` | CASH drawer UI, source toggle, actions, ApprovalHistory       |
| `src/modules/finance/components/ApprovalHistory/index.tsx`   | Timeline lịch sử duyệt                                        |
| `src/modules/finance/components/VoucherTable/index.tsx`      | Bảng, badge source, filter dropdown                           |
| `src/pages/TienMat.tsx`                                      | Page CASH — load employees, state orchestration               |
| `src/pages/TienGui.tsx`                                      | Page BANK — load employees, inline drawer với ApprovalHistory |
