# Task 03 — Hook Business Logic

## Dependency

Phải hoàn thành **Task 01** và **Task 02** trước.

## Scope

Ba file cần sửa:

1. `src/modules/finance/hooks/useVoucherDrawer.ts`
2. `src/modules/finance/hooks/useCashVoucherHandlers.ts`
3. `src/modules/finance/hooks/useBankVoucherHandlers.ts`

---

## File 1: `src/modules/finance/hooks/useVoucherDrawer.ts`

### 1a. Cập nhật imports

```ts
// BEFORE:
import {
  getVoucherAttachmentsApi,
  deleteVoucherAttachmentApi,
  updatePaymentVoucherApi,
  type PaymentVoucher,
  type PaymentVoucherAttachment,
  type VoucherStatus,
  type AttachmentType,
} from "@/modules/finance/api/financeApi";

// AFTER — thêm 5 hàm transition, bỏ updatePaymentVoucherApi khỏi luồng transition:
import {
  getVoucherAttachmentsApi,
  deleteVoucherAttachmentApi,
  updatePaymentVoucherApi,
  submitPaymentVoucherApi,
  approvePaymentVoucherApi,
  rejectPaymentVoucherApi,
  postPaymentVoucherApi,
  cancelPaymentVoucherApi,
  type PaymentVoucher,
  type PaymentVoucherAttachment,
  type VoucherStatus,
  type AttachmentType,
} from "@/modules/finance/api/financeApi";
```

### 1b. Thêm state `cancelReason`

Thêm sau dòng `const [saveError, setSaveError] = useState<string | null>(null);`:

```ts
  const [cancelReason, setCancelReason] = useState("");
```

### 1c. Thay toàn bộ hàm `handleStatusTransition`

```ts
// BEFORE:
  async function handleStatusTransition(
    nextStatus: VoucherStatus,
    onSuccess: () => void,
  ) {
    if (!editing) return;
    setSaving(true);
    setSaveError(null);
    try {
      await updatePaymentVoucherApi(editing.id, { status: nextStatus });
      showToast({
        title: "Cập nhật trạng thái thành công",
        description: `${editing.voucher_no}: ${STATUS_LABELS[nextStatus]}`,
        variant: "success",
      });
      closeDrawer();
      onSuccess();
    } catch (e) {
      const reason = extractApiError(e);
      setSaveError(reason);
      showToast({
        title: "Cập nhật trạng thái thất bại",
        description: reason,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

// AFTER — gọi đúng endpoint transition:
  async function handleStatusTransition(
    action: "SUBMIT" | "APPROVE" | "REJECT" | "POST" | "CANCEL",
    onSuccess: () => void,
    opts?: { note?: string; cancel_reason?: string },
  ) {
    if (!editing) return;
    setSaving(true);
    setSaveError(null);
    try {
      switch (action) {
        case "SUBMIT":
          await submitPaymentVoucherApi(editing.id);
          break;
        case "APPROVE":
          await approvePaymentVoucherApi(editing.id);
          break;
        case "REJECT":
          await rejectPaymentVoucherApi(editing.id, opts?.note);
          break;
        case "POST":
          await postPaymentVoucherApi(editing.id);
          break;
        case "CANCEL":
          await cancelPaymentVoucherApi(editing.id, opts?.cancel_reason);
          break;
      }
      const ACTION_LABELS: Record<string, string> = {
        SUBMIT: "Đã gửi duyệt",
        APPROVE: "Đã duyệt",
        REJECT: "Đã từ chối",
        POST: "Đã hạch toán",
        CANCEL: "Đã hủy",
      };
      showToast({
        title: ACTION_LABELS[action] ?? "Thành công",
        description: editing.voucher_no,
        variant: "success",
      });
      closeDrawer();
      onSuccess();
    } catch (e) {
      const reason = extractApiError(e);
      setSaveError(reason);
      showToast({
        title: "Thao tác thất bại",
        description: reason,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }
```

### 1d. Cập nhật return value — thêm `cancelReason`, `setCancelReason`

```ts
// Trong return {...} cuối hàm, thêm:
    cancelReason,
    setCancelReason,
    handleStatusTransition,
```

---

## File 2: `src/modules/finance/hooks/useCashVoucherHandlers.ts`

### 2a. Thêm import

```ts
// Thêm vào import từ "@/modules/finance/api/financeApi":
  type CounterpartySource,

// Thêm riêng import Employee. Employee đã có trong auth.ts:
import type { Employee } from "@/modules/auth/api/auth";
```

### 2b. Thêm param `employees` vào `UseCashVoucherHandlersParams`

```ts
// Trong interface UseCashVoucherHandlersParams, sau dòng `partners: BusinessPartner[];`:
  employees: Employee[];
```

### 2c. Thêm hàm `handleEmployeeChange`

Thêm sau hàm `handlePartnerChange`:

```ts
  function handleEmployeeChange(employeeId: string) {
    const emp = employees.find((e) => e.id === employeeId);
    setForm((current) => ({
      ...current,
      employee_id: employeeId,
      counterparty_id: "",
      counterparty_name_snapshot: emp?.full_name ?? "",
      counterparty_phone_snapshot: emp?.phone ?? "",
      counterparty_identity_no_snapshot: emp?.identity_no ?? "",
      counterparty_tax_code_snapshot: "",
      counterparty_address_snapshot: "",
    }));
  }
```

### 2d. Cập nhật `handlePartnerChange` — clear employee khi chọn partner

```ts
// BEFORE:
  function handlePartnerChange(partnerId: string) {
    const partner = partners.find((item) => item.id === partnerId);
    setForm((current) => ({
      ...current,
      counterparty_id: partnerId,
      counterparty_name_snapshot: partner?.name ?? "",
      counterparty_tax_code_snapshot: partner?.tax_code ?? "",
      counterparty_address_snapshot: partner?.address ?? "",
    }));
  }

// AFTER — thêm clear employee fields:
  function handlePartnerChange(partnerId: string) {
    const partner = partners.find((item) => item.id === partnerId);
    setForm((current) => ({
      ...current,
      counterparty_id: partnerId,
      employee_id: "",
      counterparty_name_snapshot: partner?.name ?? "",
      counterparty_tax_code_snapshot: partner?.tax_code ?? "",
      counterparty_address_snapshot: partner?.address ?? "",
      counterparty_phone_snapshot: partner?.phone ?? "",
      counterparty_identity_no_snapshot: "",
    }));
  }
```

### 2e. Cập nhật validation trong `handleSave`

```ts
// BEFORE — dòng validate counterparty:
    if (!form.counterparty_id) {
      setSaveError("Vui lòng chọn đối tác.");
      return;
    }

// AFTER — validate theo source:
    if (form.counterparty_source === "INTERNAL" && !form.employee_id) {
      setSaveError("Vui lòng chọn nhân viên.");
      return;
    }
    if (form.counterparty_source === "EXTERNAL" && !form.counterparty_id) {
      setSaveError("Vui lòng chọn đối tác.");
      return;
    }
```

### 2f. Cập nhật DTO trong `handleSave`

```ts
// Trong phần build dto, BEFORE:
        counterparty_id: form.counterparty_id,
        counterparty_name_snapshot: ...
        counterparty_tax_code_snapshot: ...
        counterparty_address_snapshot: ...
        counterparty_role: ...

// AFTER — thêm counterparty_source và employee_id, chỉ gửi field đúng với source:
        counterparty_source: form.counterparty_source,
        ...(form.counterparty_source === "INTERNAL"
          ? { employee_id: form.employee_id }
          : { counterparty_id: form.counterparty_id }),
        counterparty_name_snapshot:
          form.counterparty_name_snapshot.trim() ||
          (form.counterparty_source === "INTERNAL"
            ? (employees.find((e) => e.id === form.employee_id)?.full_name ?? "")
            : (partners.find((p) => p.id === form.counterparty_id)?.name ?? "")),
        counterparty_tax_code_snapshot:
          form.counterparty_tax_code_snapshot.trim() || undefined,
        counterparty_address_snapshot:
          form.counterparty_address_snapshot.trim() || undefined,
        counterparty_role: (form.counterparty_role as CounterpartyRole) || undefined,
```

### 2g. Cập nhật return — thêm `handleEmployeeChange`

```ts
// Thêm vào return object:
    handleEmployeeChange,
```

---

## File 3: `src/modules/finance/hooks/useBankVoucherHandlers.ts`

Áp dụng **tương tự File 2**, với các điểm khác biệt:

- Import `Employee` như trên.
- Thêm `employees: Employee[]` vào `UseBankVoucherHandlersParams`.
- Thêm `handleEmployeeChange` tương tự (có thêm reset `beneficiary_bank_account_id: ""`).
- Cập nhật `handlePartnerChange` — clear `employee_id: ""`.
- Cập nhật validation theo `counterparty_source` giống 2e.
- Cập nhật DTO build giống 2f.

Thêm riêng cho BANK — trong hàm `handleStatusTransition` nội bộ của hook này:

```ts
// BEFORE — hàm trong useBankVoucherHandlers.ts (line ~377):
  async function handleStatusTransition(nextStatus: VoucherStatus) {
    if (!editing) return;
    setSaving(true);
    setSaveError(null);
    try {
      await updatePaymentVoucherApi(editing.id, { status: nextStatus });
      ...

// AFTER — xóa hàm này hoàn toàn khỏi useBankVoucherHandlers.ts.
// TienGui.tsx sẽ gọi handleStatusTransition từ useVoucherDrawer thay thế.
// Trong return object của useBankVoucherHandlers, xóa dòng `handleStatusTransition`.
```

---

## Ghi chú

- `Employee` type từ `src/modules/auth/api/auth.ts` có các field: `id`, `full_name`, `phone`, `email`, `employee_code`. Field `identity_no` có thể chưa có — nếu không có thì bỏ qua, không ép kiểu.
- Không xóa `updatePaymentVoucherApi` khỏi imports vì `handleSave` vẫn dùng PATCH khi edit DRAFT.
- File `useCashVoucherHandlers` vẫn dùng `handleStatusTransition` từ `useVoucherDrawer` (được truyền vào qua props `onStatusTransition` của CashVoucherDrawer). Không cần thêm hàm transition vào hook này.

---

## Acceptance Criteria

- [ ] TypeScript compile không lỗi.
- [ ] `handleStatusTransition` trong `useVoucherDrawer` dùng đúng endpoint transition (không dùng PATCH status).
- [ ] `useCashVoucherHandlers` có `handleEmployeeChange` được export.
- [ ] `useBankVoucherHandlers` có `handleEmployeeChange` được export.
- [ ] `handleSave` validate đúng theo `counterparty_source`.
- [ ] DTO không gửi `employee_id` khi source là EXTERNAL và không gửi `counterparty_id` khi source là INTERNAL.
- [ ] `handleStatusTransition` bị xóa khỏi `useBankVoucherHandlers`.
