# Task 05 — List Filter + Approval History

## Dependency

Phải hoàn thành **Task 01, 02, 03, 04** trước.

## Scope

Năm file cần sửa/tạo:

1. `src/modules/finance/hooks/useVoucherList.ts` — thêm params filter mới
2. `src/modules/finance/components/VoucherTable/index.tsx` — thêm filter UI
3. `src/modules/finance/components/ApprovalHistory/index.tsx` — tạo mới
4. `src/modules/finance/components/CashVoucherDrawer/index.tsx` — nhúng ApprovalHistory
5. `src/pages/TienGui.tsx` — nhúng ApprovalHistory, truyền filter mới

---

## File 1: `src/modules/finance/hooks/useVoucherList.ts`

### 1a. Mở rộng `LoadVouchersParams`

```ts
// BEFORE — interface LoadVouchersParams:
interface LoadVouchersParams {
  page: number;
  pageSize: number;
  search: string;
  statusFilter: VoucherStatus | "";
  channelFilter: string;
  channelParam: "cash_fund_id" | "company_bank_account_id";
  voucherChannel: "CASH" | "BANK";
  sortCol: string;
  dateFrom: string;
  dateTo: string;
  amountMin: string;
  amountMax: string;
}

// AFTER — thêm 2 filter mới:
interface LoadVouchersParams {
  page: number;
  pageSize: number;
  search: string;
  statusFilter: VoucherStatus | "";
  channelFilter: string;
  channelParam: "cash_fund_id" | "company_bank_account_id";
  voucherChannel: "CASH" | "BANK";
  sortCol: string;
  dateFrom: string;
  dateTo: string;
  amountMin: string;
  amountMax: string;
  counterpartySourceFilter?: CounterpartySource | "";
  employeeIdFilter?: string;
}
```

Thêm import `CounterpartySource`:

```ts
import type { CounterpartySource } from "@/modules/finance/api/financeApi";
```

### 1b. Truyền filter mới vào API call

Trong hàm `loadVouchers`, trong phần gọi `getPaymentVouchersPagedApi`:

```ts
// Thêm vào spread params:
        ...(params.counterpartySourceFilter
          ? { counterparty_source: params.counterpartySourceFilter }
          : {}),
        ...(params.employeeIdFilter
          ? { employee_id: params.employeeIdFilter }
          : {}),
```

---

## File 2: `src/modules/finance/components/VoucherTable/index.tsx`

### 2a. Thêm imports

```ts
import type { CounterpartySource } from "@/modules/finance/api/financeApi";
import { COUNTERPARTY_SOURCE_OPTS } from "@/modules/finance/types/voucherForm";
```

### 2b. Mở rộng `VoucherTableProps`

```ts
// Thêm vào interface VoucherTableProps:
  counterpartySourceFilter: CounterpartySource | "";
  onCounterpartySourceFilter: (v: CounterpartySource | "") => void;
```

### 2c. Cập nhật filter UI — thêm Combobox `counterparty_source`

Trong `filters` prop của `DataTable`, thêm sau `<Combobox ... STATUS_FILTER_OPTS ...>`:

```tsx
<Combobox
  options={[
    { value: "", label: "Tất cả đối tượng" },
    ...COUNTERPARTY_SOURCE_OPTS,
  ]}
  value={counterpartySourceFilter}
  onChange={(v) =>
    onCounterpartySourceFilter((v as CounterpartySource | "") ?? "")
  }
  placeholder="Loại đối tượng"
  className="w-[180px]"
/>
```

### 2d. Cập nhật cột `partner` để hiển thị theo source

```ts
// BEFORE:
    {
      key: "partner",
      header: t("voucher.table.colPartner"),
      cell: (v) => v.counterparty_name_snapshot || "—",
      skeletonClassName: "w-32",
    },

// AFTER — thêm badge source:
    {
      key: "partner",
      header: t("voucher.table.colPartner"),
      cell: (v) => {
        const name = v.counterparty_name_snapshot || "—";
        const badge =
          v.counterparty_source === "INTERNAL" ? (
            <span className="ml-1 text-[10px] px-1 py-[1px] rounded bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
              Nội bộ
            </span>
          ) : v.counterparty_source === "EXTERNAL" ? (
            <span className="ml-1 text-[10px] px-1 py-[1px] rounded bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300">
              Bên ngoài
            </span>
          ) : null;
        return (
          <span className="inline-flex items-center gap-1">
            {name}
            {badge}
          </span>
        );
      },
      skeletonClassName: "w-32",
    },
```

---

## File 3: `src/modules/finance/components/ApprovalHistory/index.tsx` (TẠO MỚI)

```tsx
import { useEffect, useState } from "react";
import {
  getVoucherApprovalLogsApi,
  type PaymentVoucherApprovalLog,
} from "@/modules/finance/api/financeApi";

const ACTION_LABELS: Record<string, string> = {
  SUBMIT: "Gửi duyệt",
  APPROVE: "Duyệt",
  REJECT: "Từ chối",
  POST: "Hạch toán",
  CANCEL: "Hủy",
};

const ACTION_COLORS: Record<string, string> = {
  SUBMIT: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  APPROVE: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  REJECT: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  POST: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
  CANCEL: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};

interface ApprovalHistoryProps {
  voucherId: string;
}

export function ApprovalHistory({ voucherId }: ApprovalHistoryProps) {
  const [logs, setLogs] = useState<PaymentVoucherApprovalLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getVoucherApprovalLogsApi(voucherId)
      .then(setLogs)
      .catch(() => setLogs([]))
      .finally(() => setLoading(false));
  }, [voucherId]);

  if (loading) {
    return (
      <div className="text-xs text-muted-fg py-2 px-1 animate-pulse">
        Đang tải lịch sử duyệt...
      </div>
    );
  }

  if (!logs.length) {
    return (
      <div className="text-xs text-muted-fg py-2 px-1">
        Chưa có hoạt động duyệt.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {logs.map((log) => (
        <div
          key={log.id}
          className="flex items-start gap-3 text-xs border-l-2 border-border pl-3"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`px-1.5 py-[1px] rounded text-[10px] font-medium ${
                  ACTION_COLORS[log.action] ?? "bg-muted text-muted-fg"
                }`}
              >
                {ACTION_LABELS[log.action] ?? log.action}
              </span>
              {log.from_status && log.to_status && (
                <span className="text-muted-fg">
                  {log.from_status} → {log.to_status}
                </span>
              )}
            </div>
            <div className="text-muted-fg mt-0.5">
              {new Date(log.action_at).toLocaleString("vi-VN")}
              {log.action_by && ` · ${log.action_by}`}
            </div>
            {log.note && (
              <div className="mt-0.5 text-foreground italic">"{log.note}"</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
```

---

## File 4: `src/modules/finance/components/CashVoucherDrawer/index.tsx`

### 4a. Import `ApprovalHistory`

```ts
import { ApprovalHistory } from "@/modules/finance/components/ApprovalHistory";
```

### 4b. Thêm section "Lịch sử duyệt" trong render (sau section Đính kèm)

```tsx
{
  /* Section 5: Lịch sử duyệt — chỉ hiện khi xem, không phải tạo mới */
}
{
  editing && (
    <DrawerSection title="Lịch sử duyệt">
      <ApprovalHistory voucherId={editing.id} />
    </DrawerSection>
  );
}
```

---

## File 5: `src/pages/TienGui.tsx`

### 5a. Thêm state filter

```ts
const [counterpartySourceFilter, setCounterpartySourceFilter] = useState<
  CounterpartySource | ""
>("");
```

### 5b. Truyền filter mới vào `loadVouchers` trong `useEffect`

```ts
// Trong useEffect load vouchers, thêm vào params:
      counterpartySourceFilter,
```

Và thêm `counterpartySourceFilter` vào dependency array của `useEffect`.

### 5c. Truyền props mới xuống `VoucherTable`

```tsx
counterpartySourceFilter={counterpartySourceFilter}
onCounterpartySourceFilter={(v) => {
  setCounterpartySourceFilter(v);
  setPage(1);
}}
```

### 5d. Thêm ApprovalHistory vào drawer

```tsx
// Import:
import { ApprovalHistory } from "@/modules/finance/components/ApprovalHistory";

// Trong JSX của DrawerModal, sau DrawerSection attachment:
{
  editing && (
    <DrawerSection title="Lịch sử duyệt">
      <ApprovalHistory voucherId={editing.id} />
    </DrawerSection>
  );
}
```

---

## Tương tự cho `src/pages/TienMat.tsx`

Áp dụng bước 5a–5d tương tự cho TienMat.tsx, truyền `counterpartySourceFilter` / `onCounterpartySourceFilter` xuống `VoucherTable` và thêm `ApprovalHistory` trong `CashVoucherDrawer` (đã được handle ở File 4).

---

## Acceptance Criteria

- [ ] TypeScript compile không lỗi.
- [ ] `VoucherTable` hiển thị dropdown filter "Loại đối tượng".
- [ ] Khi chọn filter "Nội bộ", list chỉ hiện phiếu INTERNAL; "Bên ngoài" chỉ hiện EXTERNAL.
- [ ] Cột đối tác có badge mini "Nội bộ" / "Bên ngoài".
- [ ] `ApprovalHistory` render đúng danh sách log theo thứ tự mới nhất.
- [ ] Section "Lịch sử duyệt" xuất hiện trong drawer khi `editing !== null`.
- [ ] Khi voucher chưa có log, hiển thị "Chưa có hoạt động duyệt."
- [ ] Filter `counterpartySourceFilter` được truyền đúng vào `loadVouchers`.
