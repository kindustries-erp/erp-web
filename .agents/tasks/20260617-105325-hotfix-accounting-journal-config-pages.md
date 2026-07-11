# Task: Hotfix accounting journal/config pages

- Scope: FE hotfix cho `erp-accounting-journal` và `erp-accounting-config`
- Gate 0 DB: N/A — là page-start/runtime FE bug; escalated ra API contract gap và RBAC gap trong quá trình debug
- Order: DB -> API -> UI -> QC

## Status: DONE — Verified live 2026-06-17

## Checklist

- [x] Inspect mounted owner + imports + route wiring
- [x] Reproduce build/runtime failure
- [x] Patch root cause tối thiểu
- [x] Build verify
- [x] Report blocker/live verify note

## Root causes (3 layers)

### 1. Render loop — FE (web)

`ErpAccountingJournalPage` và `ErpAccountingConfigPage` lấy cả `store` object từ Zustand
và đưa `store` vào dependency `useEffect`, trong khi bên trong effect gọi `store.set...()`.
Gây render loop → page không start được.

**Fix:** tách selector cụ thể `useStore((s) => s.field)` thay vì lấy `store` cả object.
Commit: `ced04c7`

### 2. Sai `/api/v1` prefix + sai route path — FE (web)

`accountingApi.ts` gọi `/journal-entries` và `/accounting-configs-core` trực tiếp,
nhưng `axiosInstance.baseURL` chỉ là domain, không tự thêm prefix.
Ngoài ra, suffix `-core` trong path sai — controller BE dùng `@Controller('accounting-configs')`.

**Fix:**

- Thêm `/api/v1/` prefix toàn bộ accountingApi
- Đổi `accounting-configs-core` → `accounting-configs`
  Commits: `f48cc11`, `caed257`

### 3. RBAC resource thiếu — BE (api)

`rbac-core/rbac-core.service.ts` dùng static list hardcoded trong `getAvailableResources()`.
Thiếu `journal_entries` và `accounting_configs` → không thể cấp quyền từ `erp-permissions-core` UI.

**Fix:** thêm 2 resource vào list. API commit: `2d4e2f9`

## Commits

| Repo | Commit    | Mô tả                                                      |
| ---- | --------- | ---------------------------------------------------------- |
| web  | `ced04c7` | fix render loop (store selector)                           |
| web  | `f48cc11` | fix /api/v1 prefix                                         |
| web  | `caed257` | fix accounting-configs path                                |
| api  | `2d4e2f9` | add journal_entries + accounting_configs to rbac resources |

## Lesson learned

- Pattern `const store = useStore(); useEffect(..., [store])` gây render loop với Zustand — luôn dùng selector
- accountingApi là file đầu tiên dùng path tương đối không có `/api/v1` — các api client mới phải check convention qua `axiosInstance.ts` trước
- `getAvailableResources()` trong `rbac-core.service.ts` là static list — mỗi lần thêm module mới cần cập nhật cả đây
