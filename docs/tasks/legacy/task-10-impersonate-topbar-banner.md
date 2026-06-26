# Task 10 — Login as User: Impersonation Banner (Topbar + UserProfileModal)

## Dependency

**Task 07 phải hoàn thành trước** — task này đọc `impersonation` và `stopImpersonationAction` từ `useAuthStore`.

## Scope

Hai file cần sửa:

1. `src/core/components/layout/Topbar.tsx`
2. `src/modules/auth/components/UserProfileModal.tsx`

Không tạo file mới. Không sửa file khác.

---

## Phần A — `Topbar.tsx`

### A1. Thêm import `useAuthStore`

```ts
// BEFORE (đầu file):
import { useAppStore, BREADCRUMBS } from "@/core/config/appStore";
import { useT } from "@/core/i18n";
import { PageKey } from "@/shared/types";
import { triggerContextMenu } from "@/shared/components/ContextMenu";
import { cn } from "@/shared/utils";

// AFTER:
import { useAppStore, BREADCRUMBS } from "@/core/config/appStore";
import { useAuthStore } from "@/modules/auth/domain/authStore";
import { useT } from "@/core/i18n";
import { PageKey } from "@/shared/types";
import { triggerContextMenu } from "@/shared/components/ContextMenu";
import { cn } from "@/shared/utils";
```

### A2. Đọc impersonation state trong `Topbar`

```ts
// BEFORE (trong Topbar function):
export function Topbar() {
  const {
    currentPage,
    navigate,
    setMobileSidebarOpen,
    isDark,
    appTheme,
    toggleTheme,
    toggleAppTheme,
    locale,
    toggleLocale,
  } = useAppStore();
  const t = useT();

// AFTER:
export function Topbar() {
  const {
    currentPage,
    navigate,
    setMobileSidebarOpen,
    isDark,
    appTheme,
    toggleTheme,
    toggleAppTheme,
    locale,
    toggleLocale,
  } = useAppStore();
  const impersonation = useAuthStore((s) => s.impersonation);
  const stopImpersonationAction = useAuthStore(
    (s) => s.stopImpersonationAction,
  );
  const employee = useAuthStore((s) => s.employee);
  const t = useT();
```

### A3. Thêm impersonation banner

Tìm comment `{/* Search */}` và thêm banner ngay trước nó:

```tsx
// BEFORE:
      {/* Search */}
      <div className="ml-auto flex items-center gap-2 bg-[color:var(--muted)] border border-border rounded-lg px-3 py-[6px] w-64 flex-shrink-0 max-[900px]:w-44 max-[640px]:hidden">

// AFTER:
      {/* Impersonation banner */}
      {impersonation?.active && (
        <div className="flex items-center gap-2 px-3 py-[5px] rounded-lg bg-[color:var(--warn-bg)] border border-[color:var(--warn-fg)]/40 text-[color:var(--warn-fg)] text-xs flex-shrink-0 max-[768px]:hidden">
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="flex-shrink-0"
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <span className="font-medium">
            {employee?.full_name ?? impersonation.actor?.email ?? t("topbar.impersonation.unknownUser")}
          </span>
          <span className="text-[color:var(--warn-fg)]/70">
            ({t("topbar.impersonation.actorLabel")}: {impersonation.actor?.email ?? "—"})
          </span>
          <button
            onClick={() => stopImpersonationAction("manual")}
            className="ml-1 px-2 py-[2px] rounded text-[11px] font-medium border border-[color:var(--warn-fg)]/50 hover:bg-[color:var(--warn-fg)]/10 transition-colors whitespace-nowrap"
          >
            {t("topbar.impersonation.stopButton")}
          </button>
        </div>
      )}

      {/* Search */}
      <div className="ml-auto flex items-center gap-2 bg-[color:var(--muted)] border border-border rounded-lg px-3 py-[6px] w-64 flex-shrink-0 max-[900px]:w-44 max-[640px]:hidden">
```

### A4. Thêm locale keys cho Topbar

#### `src/core/locale/vi.ts`:

```ts
"topbar.impersonation.stopButton": "Quay lại tài khoản gốc",
"topbar.impersonation.actorLabel": "Tài khoản",
"topbar.impersonation.unknownUser": "Người dùng không xác định",
```

#### `src/core/locale/en.ts`:

```ts
"topbar.impersonation.stopButton": "Return to your account",
"topbar.impersonation.actorLabel": "Account",
"topbar.impersonation.unknownUser": "Unknown user",
```

---

## Phần B — `UserProfileModal.tsx`

### B1. Đọc thêm `impersonation` và `stopImpersonationAction` từ store

```ts
// BEFORE:
const { employee, profile, loading, error, updateProfileAction } =
  useAuthStore();

// AFTER:
const {
  employee,
  profile,
  loading,
  error,
  updateProfileAction,
  impersonation,
  stopImpersonationAction,
} = useAuthStore();
```

### B2. Thêm impersonation info section trong view mode

Tìm block cuối của view mode (trước dấu `</>` đóng của view mode):

```tsx
// BEFORE (phần cuối view mode, trước đóng <>):
          {employee.notes && (
            <DrawerSection title={t("profile.notes")}>
              <DrawerRow
                label={t("profile.notes")}
                value={employee.notes}
                cls="max-w-[220px]"
              />
            </DrawerSection>
          )}
        </>

// AFTER:
          {employee.notes && (
            <DrawerSection title={t("profile.notes")}>
              <DrawerRow
                label={t("profile.notes")}
                value={employee.notes}
                cls="max-w-[220px]"
              />
            </DrawerSection>
          )}

          {impersonation?.active && (
            <DrawerSection title={t("profile.impersonation.sectionTitle")}>
              <div className="flex flex-col gap-3">
                <div className="rounded-lg bg-[color:var(--warn-bg)] border border-[color:var(--warn-fg)]/30 px-3 py-2 text-xs text-[color:var(--warn-fg)]">
                  <div className="font-medium mb-1">
                    {t("profile.impersonation.activeNotice")}
                  </div>
                  <div className="text-[color:var(--warn-fg)]/80">
                    {t("profile.impersonation.actorLabel")}:{" "}
                    {[
                      impersonation.actor?.first_name,
                      impersonation.actor?.last_name,
                    ]
                      .filter(Boolean)
                      .join(" ") || impersonation.actor?.email || "—"}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    stopImpersonationAction("manual");
                    onClose();
                  }}
                  className="w-full py-[7px] px-3 rounded-lg border border-[color:var(--warn-fg)]/50 text-xs font-medium text-[color:var(--warn-fg)] bg-[color:var(--warn-bg)] hover:bg-[color:var(--warn-fg)]/10 transition-colors"
                >
                  {t("profile.impersonation.stopButton")}
                </button>
              </div>
            </DrawerSection>
          )}
        </>
```

### B3. Thêm locale keys cho UserProfileModal

#### `src/core/locale/vi.ts`:

```ts
"profile.impersonation.sectionTitle": "Phiên đăng nhập hộ",
"profile.impersonation.activeNotice": "Đang đăng nhập thay người dùng này",
"profile.impersonation.actorLabel": "Tài khoản gốc",
"profile.impersonation.stopButton": "Quay lại tài khoản gốc",
```

#### `src/core/locale/en.ts`:

```ts
"profile.impersonation.sectionTitle": "Impersonation session",
"profile.impersonation.activeNotice": "Currently logged in as this user",
"profile.impersonation.actorLabel": "Original account",
"profile.impersonation.stopButton": "Return to your account",
```

---

## Acceptance Criteria

- [ ] `tsc --noEmit` không lỗi.
- [ ] Topbar: `useAuthStore` được import.
- [ ] Topbar: banner render khi `impersonation?.active === true`, ẩn khi `active === false` hoặc `null`.
- [ ] Topbar: banner hiển thị tên nhân viên đang bị impersonate.
- [ ] Topbar: nút "Quay lại tài khoản gốc" gọi `stopImpersonationAction("manual")`.
- [ ] Topbar: banner ẩn trên mobile (`max-[768px]:hidden`).
- [ ] Topbar: locale keys được thêm vào vi.ts và en.ts.
- [ ] UserProfileModal: `impersonation` và `stopImpersonationAction` được đọc từ store.
- [ ] UserProfileModal: section impersonation chỉ hiện trong view mode (không phải edit mode), khi `impersonation?.active === true`.
- [ ] UserProfileModal: nút "Quay lại" gọi `stopImpersonationAction("manual")` VÀ gọi `onClose()`.
- [ ] UserProfileModal: locale keys được thêm vào vi.ts và en.ts.
