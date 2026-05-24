# Task — Cashflow Vouchers Greenfield (Web)

- Type: FEATURE
- Mục tiêu: Tạo mới surface `cashflow_vouchers` trong ERP Web.
- Bối cảnh: Plan canonical tại `/opt/docs/ai/liouni-erp/tasks/20260524.2047.2328 - cashflow-vouchers-greenfield.md`

## Gate 0 — DB Precheck

- Kết quả: `DB_GAP_FOUND` (DB và API phải hoàn tất trước)
- Scope FE phụ thuộc API cashflow-vouchers module ở API repo.

## Coordination Impact

- [x] Directus staging schema affected
- [x] ERP API contract affected

## Checklist

- [x] 1.0 Gate 0 DB Precheck done — DB_GAP_FOUND
- [x] 2.0 DB + API layers done (prerequisite complete)
- [x] 3.0 cashflow-vouchers API types and calls scaffolded
  - Appended vào `src/modules/finance/api/financeApi.ts` (15+ functions)
  - Types: CashflowVoucher, CashflowVoucherStatus, CashflowPartyScope, CashflowChannelType, CashflowFlowDirection, DTOs
  - Functions: list, detail, create, update, delete, post, cancel, timeline, related-docs (CRUD), allocations (CRUD), parties/lookup
- [x] 3.1 cashflow-vouchers list page — `src/pages/CashflowVouchers.tsx` (CashflowVouchersPage)
- [x] 3.2 Create form inline (party_scope-aware, channel_type-aware, cash_fund/bank_account select)
- [x] 3.3 Status-based action visibility — DRAFT: POST/DELETE; POSTED: CANCEL only; CANCELLED: DELETE allowed
- [x] 3.4 Related-document UX — panel hiển thị JSON timeline/related-docs/allocations (MVP)
- [x] 3.5 Allocation UX — panel hiển thị
- [x] 3.6 Timeline/audit UX — panel hiển thị
- [x] 3.7 Journal linkage — Detail panel hiển thị journal_entry_id / journal_entry_no_snapshot
- [x] 3.8 Sidebar / routing registration:
  - `src/shared/types/index.ts`: `"cashflow-vouchers"` thêm vào PageKey
  - `src/shared/utils/pageUrl.ts`: ALL_PAGE_KEYS + LEGACY_SLUGS `"phieu-thu-chi"`
  - `src/core/config/appStore.ts`: SECTION_ROOTS + breadcrumb trail
  - `src/core/routing/index.ts`: ROUTES
  - `src/core/locale/vi.ts` + `en.ts`: `cashflowVouchers` i18n key
  - `Sidebar.tsx`: NavGroupItem trong Dòng tiền group, active state
  - `App.tsx`: import + route render + known-pages list
- [x] 4.0 `bun run build` PASS — `tsc && vite build` exit 0, 4.11s, 11 entries precached
- [x] 4.1 Docker build PASS — `liouni-erp-web Started`
- [x] 4.2 Route smoke: `GET http://127.0.0.1:8808/cashflow-vouchers` → HTTP 200, page title "Hệ thống ERP" (SPA login guard)
- [x] 5.0 Commit + push (done — see Commit/Push Status)

## Validation Evidence

- API smoke: GET /api/v1/cashflow-vouchers → `{"items":[],"total":0,"page":1,"pageSize":3}` (HTTP 200)
- FE build: `vite build` exit 0, 2898 modules transformed (local), Docker layer #13 built in 4.11s
- Container: `liouni-erp-web Up` on :8808
- Route /cashflow-vouchers: HTTP 200, title "Hệ thống ERP"

## Rollback

- Web: `git -C /opt/repos/liouni-erp/liouni-erp-web revert <commit>` + `docker compose up -d --build`
- Không cần rollback DB (không đụng schema Web)
- Nếu cần ẩn tạm: xóa Sidebar entry `cashflow-vouchers` + remove route from App.tsx + rebuild

## Lessons Learned

- `sed -i` trong UTF-8 file có thể replace line không đúng context. Phải dùng Python read/write hoặc patch tool với context đủ rộng.
- LSP diagnostics sau `write_file` có thể stale. Build thực tế (bun run build) là source of truth.
- `read_file` dùng pagination sẽ prefix line numbers kép nếu copy-paste trực tiếp. Luôn write sạch từ content thuần.
- pageUrl.ts phải rewrite sạch sau lần sed double-replace; bun build là gating check.

## Commit/Push Status

- Web repo: committed and pushed
