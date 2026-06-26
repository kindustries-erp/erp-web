# Task 09 — Login as User: NhanSu Row Action

## Dependency

**Task 06 và Task 07 phải hoàn thành trước** — task này dùng `impersonateAction` và `canImpersonate` từ `useAuthStore`.

## Scope

File duy nhất cần sửa: `src/pages/NhanSu.tsx`

Không tạo file mới. Không sửa file khác.

---

## 1. Thêm import `useAuthStore`

```ts
// BEFORE (cuối block import từ auth):
import {
  updateProfileApi,
  type Employee,
  type UpdateProfileRequest,
} from "@/modules/auth/api/auth";

// AFTER:
import {
  updateProfileApi,
  type Employee,
  type UpdateProfileRequest,
} from "@/modules/auth/api/auth";
import { useAuthStore } from "@/modules/auth/domain/authStore";
```

---

## 2. Thêm `IconLoginAs` SVG

Thêm sau `IconRefresh` component (khoảng line 548 trong file, sau dấu đóng `);` của IconRefresh):

```ts
const IconLoginAs = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
    <polyline points="10 17 15 12 10 7" />
    <line x1="15" y1="12" x2="3" y2="12" />
  </svg>
);
```

---

## 3. Thêm `canImpersonate` và `impersonateAction` vào component

Thêm **ngay sau** dòng `const showToast = useUIStore(...)` trong `NhanSu` component:

```ts
// BEFORE:
const showToast = useUIStore((s) => s.showToast);
const [items, setItems] = useState<Employee[]>([]);

// AFTER:
const showToast = useUIStore((s) => s.showToast);
const canImpersonate = useAuthStore((s) => s.canImpersonate);
const impersonateAction = useAuthStore((s) => s.impersonateAction);
const [items, setItems] = useState<Employee[]>([]);
```

---

## 4. Thêm state cho impersonation confirm modal

Thêm sau state `deleting`:

```ts
// BEFORE:
const [deleting, setDeleting] = useState(false);

// AFTER:
const [deleting, setDeleting] = useState(false);

const [impersonateTarget, setImpersonateTarget] = useState<Employee | null>(
  null,
);
const [impersonating, setImpersonating] = useState(false);
```

---

## 5. Thêm handler `handleImpersonate`

Thêm sau hàm `handleDelete`:

```ts
async function handleImpersonate() {
  if (!impersonateTarget) return;
  const targetId = getDirectusId(impersonateTarget);
  if (!targetId) return;
  setImpersonating(true);
  try {
    await impersonateAction(targetId);
    setImpersonateTarget(null);
    showToast({
      title: t("nhansu.toast.impersonateStarted"),
      description: impersonateTarget.full_name,
      variant: "success",
    });
  } catch (e) {
    const msg = (e as { response?: { data?: { message?: string } } })?.response
      ?.data?.message;
    showToast({
      title: t("nhansu.toast.impersonateFailed"),
      description: msg ?? "",
      variant: "destructive",
    });
  } finally {
    setImpersonating(false);
  }
}
```

---

## 6. Thêm nút "Login as user" vào cột `actions`

```ts
// BEFORE (trong columns, key "actions"):
    {
      key: "actions",
      header: "",
      cell: (emp) => (
        <div className="flex gap-[5px] justify-end">
          <button
            title={t("nhansu.actions.edit")}
            onClick={() => openEdit(emp)}
            className="p-[5px] rounded text-[color:var(--muted-fg)] hover:text-foreground hover:bg-surface-hover cursor-pointer"
          >
            <IconEdit />
          </button>
          <button
            title={t("nhansu.actions.delete")}
            onClick={() => setDeleteTarget(emp)}
            className="p-[5px] rounded text-[color:var(--muted-fg)] hover:text-red-500 hover:bg-surface-hover cursor-pointer"
          >
            <IconTrash />
          </button>
        </div>
      ),
      headerClassName: "w-[80px]",
      skeletonClassName: "",
    },

// AFTER:
    {
      key: "actions",
      header: "",
      cell: (emp) => (
        <div className="flex gap-[5px] justify-end">
          {canImpersonate && getDirectusId(emp) && (
            <button
              title={t("nhansu.actions.loginAsUser")}
              onClick={() => setImpersonateTarget(emp)}
              className="p-[5px] rounded text-[color:var(--muted-fg)] hover:text-primary hover:bg-surface-hover cursor-pointer"
            >
              <IconLoginAs />
            </button>
          )}
          <button
            title={t("nhansu.actions.edit")}
            onClick={() => openEdit(emp)}
            className="p-[5px] rounded text-[color:var(--muted-fg)] hover:text-foreground hover:bg-surface-hover cursor-pointer"
          >
            <IconEdit />
          </button>
          <button
            title={t("nhansu.actions.delete")}
            onClick={() => setDeleteTarget(emp)}
            className="p-[5px] rounded text-[color:var(--muted-fg)] hover:text-red-500 hover:bg-surface-hover cursor-pointer"
          >
            <IconTrash />
          </button>
        </div>
      ),
      headerClassName: "w-[100px]",
      skeletonClassName: "",
    },
```

---

## 7. Thêm `ConfirmModal` cho impersonation

Tìm block `{/* Delete confirm */}` (hoặc block ConfirmModal của delete) và thêm modal impersonation **ngay sau** nó. Tìm pattern cuối của delete confirm modal:

```ts
// Tìm block ConfirmModal delete (có title deleteTarget?.full_name):
      <ConfirmModal
        open={!!deleteTarget}
        title={...}
        ...
      />
```

Thêm sau ConfirmModal đó:

```ts
      {/* ── Impersonation confirm ── */}
      <ConfirmModal
        open={!!impersonateTarget}
        title={t("nhansu.confirm.impersonateTitle")}
        description={t("nhansu.confirm.impersonateBody", {
          name: impersonateTarget?.full_name ?? "",
        })}
        confirmLabel={t("nhansu.actions.loginAsUser")}
        onConfirm={handleImpersonate}
        onCancel={() => setImpersonateTarget(null)}
        loading={impersonating}
        variant="default"
      />
```

---

## 8. Thêm locale keys (tiếng Việt + tiếng Anh)

### `src/core/locale/vi.ts` — thêm vào object `nhansu`:

```ts
// Thêm vào cuối block nhansu.actions:
"nhansu.actions.loginAsUser": "Đăng nhập hộ",

// Thêm vào cuối block nhansu.confirm:
"nhansu.confirm.impersonateTitle": "Đăng nhập hộ người dùng này?",
"nhansu.confirm.impersonateBody": "Bạn sẽ đăng nhập với quyền của {name}. Nhấn nút trong topbar để quay lại.",

// Thêm vào cuối block nhansu.toast:
"nhansu.toast.impersonateStarted": "Đang đăng nhập hộ",
"nhansu.toast.impersonateFailed": "Không thể đăng nhập hộ",
```

### `src/core/locale/en.ts` — thêm tương ứng:

```ts
"nhansu.actions.loginAsUser": "Login as user",
"nhansu.confirm.impersonateTitle": "Login as this user?",
"nhansu.confirm.impersonateBody": "You will act as {name}. Use the topbar button to return to your account.",
"nhansu.toast.impersonateStarted": "Impersonation started",
"nhansu.toast.impersonateFailed": "Cannot impersonate user",
```

> **Lưu ý**: Nếu hàm `t()` trong codebase không hỗ trợ interpolation `{name}`, hãy thay bằng:
>
> ```ts
> description={`${t("nhansu.confirm.impersonateBody")} ${impersonateTarget?.full_name ?? ""}`}
> ```
>
> và bỏ phần `{name}` khỏi chuỗi locale.

---

## 9. Kiểm tra interface `ConfirmModal`

Trước khi thêm, kiểm tra `src/shared/components/ConfirmModal.tsx` có nhận prop `variant` không. Nếu không có `variant` prop, bỏ dòng `variant="default"`.

---

## Acceptance Criteria

- [ ] `tsc --noEmit` không lỗi.
- [ ] `useAuthStore` được import.
- [ ] `canImpersonate` và `impersonateAction` được đọc từ store.
- [ ] `IconLoginAs` được thêm.
- [ ] Nút "Login as user" chỉ render khi `canImpersonate === true` VÀ `getDirectusId(emp)` non-empty.
- [ ] Khi click nút → mở `ConfirmModal` (impersonateTarget được set).
- [ ] Khi confirm → `handleImpersonate` gọi `impersonateAction(targetId)`.
- [ ] Toast success hiện sau khi impersonation thành công.
- [ ] Toast error hiện khi impersonation thất bại.
- [ ] Modal tự đóng sau khi confirm hoặc cancel.
- [ ] Locale keys được thêm vào cả vi.ts và en.ts.
