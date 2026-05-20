# Task: Refactor Tabs → Sidebar Sub-menu Pages

**Branch:** `refactor/tabs-to-sidebar-pages`  
**Created:** 2026-05-20  
**Status:** Planning

---

## Objective

Convert all tab-based page layouts into separate pages with their own URL paths, and display them as sub-menu items under group labels in the sidebar. This restores the previous sidebar-driven navigation pattern.

---

## Current State

| Parent Page | Tabs (current) | URL pattern |
|---|---|---|
| CashFlow (`/cashflow`) | Tổng hợp, Tiền mặt, Tiền gửi | `/cashflow?tab=tong-hop\|tien-mat\|uy-nhiem-chi` |
| Công nợ (`/receivables`) | Phải thu, Phải trả | `/receivables?tab=...` |
| Nhân sự (`/employees`) | Nhân viên, Phòng ban, Chức vụ | `/employees?tab=...` |
| Thiết lập (`/settings-cash-fund`) | Quỹ, Ngân hàng, Tài khoản | `/settings-cash-fund?tab=...` |
| Hóa đơn (`/e-invoice`) | Nháp, Đã phát hành | `/e-invoice?tab=...` |

## Target State

Each tab becomes its own page with a dedicated URL. Sidebar shows group labels with sub-items:

```
KẾ TOÁN
  Dòng tiền (group label)
    ├── Tổng hợp           /cashflow
    ├── Tiền mặt           /cash-fund
    └── Tiền gửi           /bank-deposit
  Công nợ (group label)
    ├── Phải thu            /receivables
    └── Phải trả           /payables
  Hóa đơn                  /e-invoice
  Báo cáo                  /journal
  Đối tác                  /partners
  Nhân sự (group label)
    ├── Nhân viên           /employees
    ├── Phòng ban           /departments
    └── Chức vụ            /positions
  Tài liệu                 /attachments
  Thiết lập (group label)
    ├── Quỹ tiền mặt       /settings/cash-fund
    ├── Ngân hàng           /settings/bank
    └── Tài khoản           /settings/accounts
```

---

## Tasks

### Phase 1: Sidebar restructure

- [ ] **1.1** Add `NavGroup` component to `SidebarPrimitives.tsx` — renders a group label with indented child `NavItem`s
- [ ] **1.2** Update `Sidebar.tsx` — replace single NavItems with NavGroup + child NavItems for: Dòng tiền, Công nợ, Nhân sự, Thiết lập
- [ ] **1.3** Update i18n keys for new group labels if needed
- [ ] **1.4** Ensure collapsed sidebar still works (show icons only, tooltip on hover)

### Phase 2: Remove tab layouts from pages

- [ ] **2.1** `CashFlow.tsx` — Remove `PageWithTabsLayout`, keep only the "Tổng hợp" overview content. Remove imports of `TienMat`/`TienGui` (they're already separate pages)
- [ ] **2.2** `CashFund.tsx` — Remove tab wrapper if any, make it a standalone page (already mostly done)
- [ ] **2.3** `BankDeposit.tsx` — Same as above (already standalone)
- [ ] **2.4** `Employees.tsx` — If it has tabs for Phòng ban/Chức vụ, remove them (they're already separate pages at `/departments`, `/positions`)
- [ ] **2.5** `SettingsCashFund.tsx` / `SettingsBankAccount.tsx` / `SettingsChartOfAccounts.tsx` — Remove shared tab layout, each is standalone
- [ ] **2.6** Receivables/Payables — If they share a tab layout, separate them

### Phase 3: Breadcrumbs & navigation cleanup

- [ ] **3.1** Update `BREADCRUMBS` in `appStore.ts` — each page gets its own breadcrumb trail (no more tab-based breadcrumb switching)
- [ ] **3.2** Remove `?tab=` URL parameter handling from all pages
- [ ] **3.3** Update `SECTION_ROOTS` if needed for correct tab bar grouping
- [ ] **3.4** Remove `PageWithTabsLayout` usage from affected pages (keep component for other uses)

### Phase 4: Cleanup & verification

- [ ] **4.1** Remove dead code (tab state, tab change handlers, tab URL sync)
- [ ] **4.2** Verify all pages render correctly standalone
- [ ] **4.3** Verify sidebar navigation works for all items
- [ ] **4.4** Verify breadcrumbs are correct
- [ ] **4.5** Run `tsc --noEmit` — no errors
- [ ] **4.6** Test mobile sidebar behavior

---

## Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Breaking existing bookmarks with `?tab=` params | Keep `pathToPage` handling — ignore unknown tab params gracefully |
| Tab bar at bottom showing wrong grouping | Update `SECTION_ROOTS` to reflect new standalone pages |
| Pages that embed other pages (CashFlow imports TienMat/TienGui) | Remove those imports, each page is independent |

---

## Files to modify

- `src/core/components/layout/Sidebar.tsx`
- `src/core/components/layout/SidebarPrimitives.tsx`
- `src/pages/CashFlow.tsx`
- `src/pages/CashFund.tsx`
- `src/pages/BankDeposit.tsx`
- `src/pages/Employees.tsx`
- `src/pages/SettingsCashFund.tsx`
- `src/pages/SettingsBankAccount.tsx`
- `src/pages/SettingsChartOfAccounts.tsx`
- `src/pages/Receivables.tsx`
- `src/pages/Payables.tsx`
- `src/core/config/appStore.ts` (BREADCRUMBS, SECTION_ROOTS)
- `src/core/locale/vi.ts` / `en.ts` (new group labels if needed)
