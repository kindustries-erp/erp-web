# Task 04 — Drawer UI: Form Logic + Action Buttons

## Dependency

Phải hoàn thành **Task 01, 02, 03** trước.

## Scope

Hai file cần sửa:

1. `src/modules/finance/components/CashVoucherDrawer/index.tsx`
2. `src/pages/TienGui.tsx`
3. `src/pages/TienMat.tsx` (chỉ cập nhật prop truyền xuống và load employees)

---

## File 1: `src/modules/finance/components/CashVoucherDrawer/index.tsx`

### 1a. Cập nhật imports

```ts
// Thêm vào import từ financeApi:
  type CounterpartySource,

// Thêm vào import từ voucherForm:
  COUNTERPARTY_SOURCE_OPTS,
```

### 1b. Cập nhật `CashVoucherDrawerProps`

```ts
// Thêm vào interface CashVoucherDrawerProps:

  // Thêm sau partnerOpts:
  employeeOpts: SelectOption[];

  // Thêm sau onPartnerChange:
  onEmployeeChange: (empId: string) => void;
  onSourceChange: (src: CounterpartySource) => void;
```

### 1c. Cập nhật destructure props trong component function

```ts
// Thêm employeeOpts, onEmployeeChange, onSourceChange vào destructure
```

### 1d. Cập nhật logic `canEdit`

```ts
// BEFORE:
const canEdit =
  !editing || editing.status === "DRAFT" || editing.status === "REJECTED";

// AFTER — backend chặn PATCH nếu không phải DRAFT:
const canEdit = !editing || editing.status === "DRAFT";
```

### 1e. Cập nhật `actions` — đổi sang Action mới theo state machine

```ts
// BEFORE (đoạn actions trong component):
const actions: DrawerAction[] = (() => {
  if (!editing || drawerEditMode) {
    return [
      { label: t("voucher.drawer.cancel"), onClick: onClose },
      {
        label: t("voucher.drawer.saveDraft"),
        disabled: saving,
        onClick: () => onSave("DRAFT"),
      },
      {
        label: t("voucher.drawer.submitApprove"),
        primary: true,
        loading: saving,
        disabled: saving,
        onClick: () => onSave("PENDING_APPROVAL"),
      },
    ];
  }
  if (editing.status === "PENDING_APPROVAL") {
    return [
      { label: t("voucher.drawer.close"), onClick: onClose },
      {
        label: t("voucher.drawer.reject"),
        disabled: saving,
        onClick: () => onStatusTransition("REJECTED"),
      },
      {
        label: t("voucher.drawer.approve"),
        primary: true,
        loading: saving,
        disabled: saving,
        onClick: () => onStatusTransition("APPROVED"),
      },
    ];
  }
  if (editing.status === "APPROVED") {
    return [
      { label: t("voucher.drawer.close"), onClick: onClose },
      {
        label: t("voucher.drawer.post"),
        primary: true,
        loading: saving,
        disabled: saving,
        onClick: () => onStatusTransition("POSTED"),
      },
    ];
  }
  if (editing.status === "DRAFT" || editing.status === "REJECTED") {
    return [
      { label: t("voucher.drawer.close"), onClick: onClose },
      {
        label: t("voucher.drawer.submitApprove"),
        primary: true,
        loading: saving,
        disabled: saving,
        onClick: () => onStatusTransition("PENDING_APPROVAL"),
      },
    ];
  }
  return [{ label: t("voucher.drawer.close"), onClick: onClose }];
})();

// AFTER — gọi action đúng tên:
const actions: DrawerAction[] = (() => {
  if (!editing || drawerEditMode) {
    return [
      { label: "Hủy bỏ", onClick: onClose },
      { label: "Lưu nháp", disabled: saving, onClick: () => onSave("DRAFT") },
      {
        label: "Gửi duyệt",
        primary: true,
        loading: saving,
        disabled: saving,
        onClick: () => onStatusTransition("SUBMIT"),
      },
    ];
  }
  switch (editing.status) {
    case "DRAFT":
      return [
        { label: "Đóng", onClick: onClose },
        {
          label: "Hủy phiếu",
          disabled: saving,
          onClick: () => onStatusTransition("CANCEL"),
        },
        {
          label: "Gửi duyệt",
          primary: true,
          loading: saving,
          disabled: saving,
          onClick: () => onStatusTransition("SUBMIT"),
        },
      ];
    case "PENDING_APPROVAL":
      return [
        { label: "Đóng", onClick: onClose },
        {
          label: "Hủy phiếu",
          disabled: saving,
          onClick: () => onStatusTransition("CANCEL"),
        },
        {
          label: "Từ chối",
          disabled: saving,
          onClick: () => onStatusTransition("REJECT"),
        },
        {
          label: "Duyệt",
          primary: true,
          loading: saving,
          disabled: saving,
          onClick: () => onStatusTransition("APPROVE"),
        },
      ];
    case "APPROVED":
      return [
        { label: "Đóng", onClick: onClose },
        {
          label: "Hủy phiếu",
          disabled: saving,
          onClick: () => onStatusTransition("CANCEL"),
        },
        {
          label: "Hạch toán",
          primary: true,
          loading: saving,
          disabled: saving,
          onClick: () => onStatusTransition("POST"),
        },
      ];
    default:
      return [{ label: "Đóng", onClick: onClose }];
  }
})();
```

**Quan trọng**: Cập nhật prop `onStatusTransition` của `CashVoucherDrawerProps` từ:

```ts
  onStatusTransition: (nextStatus: VoucherStatus) => void;
```

thành:

```ts
  onStatusTransition: (action: "SUBMIT" | "APPROVE" | "REJECT" | "POST" | "CANCEL") => void;
```

### 1f. Cập nhật Section "Đối tượng" trong render

Thay thế toàn bộ `<DrawerSection title={t("voucher.drawer.sectionPartner")}>` bằng:

```tsx
{
  /* Section 2: Đối tượng */
}
<DrawerSection title={t("voucher.drawer.sectionPartner")}>
  <DrawerField label="Loại đối tượng" required>
    <Combobox
      options={COUNTERPARTY_SOURCE_OPTS}
      value={form.counterparty_source}
      onChange={(v) => onSourceChange((v as CounterpartySource) || "EXTERNAL")}
      disabled={viewOnly}
    />
  </DrawerField>

  {form.counterparty_source === "INTERNAL" ? (
    <DrawerField label="Nhân viên" required>
      <Combobox
        options={employeeOpts}
        value={form.employee_id}
        onChange={onEmployeeChange}
        placeholder="Chọn nhân viên..."
        disabled={viewOnly}
      />
    </DrawerField>
  ) : (
    <div className="grid grid-cols-2 max-[560px]:grid-cols-1 gap-x-3">
      <div className="col-span-2 max-[560px]:col-span-1">
        <DrawerField label={t("voucher.drawer.partner")} required>
          <Combobox
            options={partnerOpts}
            value={form.counterparty_id}
            onChange={onPartnerChange}
            placeholder={t("voucher.drawer.partnerPlaceholder")}
            disabled={viewOnly}
          />
        </DrawerField>
      </div>
      <DrawerField label={t("voucher.drawer.role")}>
        <Combobox
          options={COUNTERPARTY_ROLE_OPTS}
          value={form.counterparty_role}
          onChange={(v) => onFieldChange("counterparty_role", v)}
          placeholder={t("voucher.drawer.rolePlaceholder")}
          disabled={viewOnly}
        />
      </DrawerField>
      <DrawerField label={t("voucher.drawer.taxCode")}>
        <input
          type="text"
          disabled
          className={inputCls}
          value={form.counterparty_tax_code_snapshot}
          readOnly
        />
      </DrawerField>
      <div className="col-span-2 max-[560px]:col-span-1">
        <DrawerField label={t("voucher.drawer.address")}>
          <input
            type="text"
            disabled
            className={inputCls}
            value={form.counterparty_address_snapshot}
            readOnly
          />
        </DrawerField>
      </div>
    </div>
  )}

  {/* Snapshot preview readonly */}
  {(form.counterparty_name_snapshot ||
    form.counterparty_phone_snapshot ||
    form.counterparty_identity_no_snapshot) && (
    <div className="mt-2 rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs text-muted-fg space-y-1">
      <p className="font-medium text-foreground">
        Thông tin sẽ được chốt khi lưu:
      </p>
      {form.counterparty_name_snapshot && (
        <p>
          Tên:{" "}
          <span className="text-foreground">
            {form.counterparty_name_snapshot}
          </span>
        </p>
      )}
      {form.counterparty_phone_snapshot && (
        <p>
          SĐT:{" "}
          <span className="text-foreground">
            {form.counterparty_phone_snapshot}
          </span>
        </p>
      )}
      {form.counterparty_identity_no_snapshot && (
        <p>
          CMND/CCCD:{" "}
          <span className="text-foreground">
            {form.counterparty_identity_no_snapshot}
          </span>
        </p>
      )}
    </div>
  )}
</DrawerSection>;
```

---

## File 2: `src/pages/TienGui.tsx`

### 2a. Cập nhật `drawerActions` — đổi sang action name mới

Tìm đoạn `const drawerActions: DrawerAction[] = (() => {` và thay toàn bộ:

```ts
// AFTER — đồng bộ với CashVoucherDrawer:
const drawerActions: DrawerAction[] = (() => {
  if (!editing || drawerEditMode) {
    return [
      { label: "Hủy bỏ", onClick: closeDrawer },
      {
        label: "Lưu nháp",
        disabled: saving,
        onClick: () => handleSave("DRAFT"),
      },
      {
        label: "Gửi duyệt",
        primary: true,
        loading: saving,
        disabled: saving,
        onClick: () => handleStatusTransition("SUBMIT", reloadCurrentData),
      },
    ];
  }
  switch (editing.status) {
    case "DRAFT":
      return [
        { label: "Đóng", onClick: closeDrawer },
        {
          label: "Hủy phiếu",
          disabled: saving,
          onClick: () => handleStatusTransition("CANCEL", reloadCurrentData),
        },
        {
          label: "Gửi duyệt",
          primary: true,
          loading: saving,
          disabled: saving,
          onClick: () => handleStatusTransition("SUBMIT", reloadCurrentData),
        },
      ];
    case "PENDING_APPROVAL":
      return [
        { label: "Đóng", onClick: closeDrawer },
        {
          label: "Hủy phiếu",
          disabled: saving,
          onClick: () => handleStatusTransition("CANCEL", reloadCurrentData),
        },
        {
          label: "Từ chối",
          disabled: saving,
          onClick: () => handleStatusTransition("REJECT", reloadCurrentData),
        },
        {
          label: "Duyệt",
          primary: true,
          loading: saving,
          disabled: saving,
          onClick: () => handleStatusTransition("APPROVE", reloadCurrentData),
        },
      ];
    case "APPROVED":
      return [
        { label: "Đóng", onClick: closeDrawer },
        {
          label: "Hủy phiếu",
          disabled: saving,
          onClick: () => handleStatusTransition("CANCEL", reloadCurrentData),
        },
        {
          label: "Hạch toán",
          primary: true,
          loading: saving,
          disabled: saving,
          onClick: () => handleStatusTransition("POST", reloadCurrentData),
        },
      ];
    default:
      return [{ label: "Đóng", onClick: closeDrawer }];
  }
})();
```

**Lưu ý**: `handleStatusTransition` lúc này là từ `useVoucherDrawer` (không phải từ `useBankVoucherHandlers`). Bỏ dòng destructure `handleStatusTransition` từ `useBankVoucherHandlers`. Thêm destructure từ `useVoucherDrawer`:

```ts
// Trong TienGui.tsx, sau khi gọi useVoucherDrawer():
const { ...cancelReason, setCancelReason, handleStatusTransition } =
  useVoucherDrawer();
```

### 2b. Cập nhật `canEditVoucher`

```ts
// BEFORE:
const canEditVoucher =
  !editing || editing.status === "DRAFT" || editing.status === "REJECTED";

// AFTER:
const canEditVoucher = !editing || editing.status === "DRAFT";
```

### 2c. Load danh sách nhân viên

Trong `useEffect` load catalog (cùng chỗ load `companyBankAccounts`, `coaItems`, `partners`), thêm:

```ts
import { getEmployeesApi } from "@/modules/hr/api/hrApi";

// Trong state:
const [employees, setEmployees] = useState<Employee[]>([]);

// Trong Promise.all:
Promise.all([
  getCompanyBankAccountsApi(),
  getChartOfAccountsApi(),
  getBusinessPartnersApi(),
  getEmployeesApi(), // thêm dòng này
]).then(([banks, coa, bps, emps]) => {
  setCompanyBankAccounts(banks ?? []);
  setCoaItems(coa ?? []);
  setPartners(bps ?? []);
  setEmployees(emps ?? []); // thêm dòng này
});
```

### 2d. Thêm `employeeOpts`

```ts
const employeeOpts = useMemo(
  () =>
    employees.map((e) => ({
      value: e.id,
      label: `${e.employee_code ?? ""} — ${e.full_name}`
        .trim()
        .replace(/^— /, ""),
    })),
  [employees],
);
```

### 2e. Cập nhật section "Đối tượng" trong JSX

Thay thế `<DrawerSection title={t("voucher.drawer.sectionPartner")}>` trong TienGui.tsx theo pattern tương tự CashVoucherDrawer (File 1, mục 1f), nhưng thêm thêm block beneficiary bank khi `counterparty_source === "EXTERNAL"`:

```tsx
{
  form.counterparty_source === "EXTERNAL" && (
    <DrawerField label={t("voucher.drawer.partnerBank")}>
      <Combobox
        options={partnerBankOpts}
        value={form.beneficiary_bank_account_id}
        onChange={(v) => setField("beneficiary_bank_account_id", v)}
        placeholder={
          partnerBankLoading
            ? t("voucher.drawer.partnerBankLoading")
            : form.counterparty_id
              ? t("voucher.drawer.partnerBankPlaceholder")
              : t("voucher.drawer.partnerBankNoPartner")
        }
        disabled={viewOnly || !form.counterparty_id || partnerBankLoading}
      />
    </DrawerField>
  );
}
```

---

## File 3: `src/pages/TienMat.tsx`

### 3a. Load employees

Tương tự TienGui 2c — thêm `getEmployeesApi` vào Promise.all, tạo state `employees`, tạo `employeeOpts`.

### 3b. Truyền prop mới xuống `CashVoucherDrawer`

```tsx
// Thêm props:
employeeOpts={employeeOpts}
onEmployeeChange={handleEmployeeChange}
onSourceChange={(src) => setField("counterparty_source", src)}
onStatusTransition={(action) =>
  handleStatusTransition(action, reloadAll)
}
```

---

## Acceptance Criteria

- [ ] TypeScript compile không lỗi.
- [ ] Khi `counterparty_source = INTERNAL`, form hiển thị Combobox chọn nhân viên; ẩn Combobox đối tác.
- [ ] Khi `counterparty_source = EXTERNAL`, form hiển thị Combobox đối tác; ẩn Combobox nhân viên.
- [ ] Snapshot preview xuất hiện dưới section đối tượng khi có dữ liệu.
- [ ] DRAFT drawer: button "Gửi duyệt" + "Hủy phiếu".
- [ ] PENDING_APPROVAL drawer: button "Duyệt" + "Từ chối" + "Hủy phiếu".
- [ ] APPROVED drawer: button "Hạch toán" + "Hủy phiếu".
- [ ] POSTED/REJECTED/CANCELLED: chỉ button "Đóng", không cho sửa.
- [ ] Không còn button "Sửa" (edit toggle) cho voucher REJECTED.
