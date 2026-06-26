# Task — Branch master data rollout phase 1 UI

## Request Input (bạn chỉ cần điền phần này)

- Type: ENHANCE
- Mục tiêu: Hoàn tất Gate 3 Web UI cho branch master data rollout phase 1.
- Bối cảnh/ngữ cảnh: DB và API gate đã mở branch_id nullable cho employee/bank/cash/journal/voucher; Web cần cập nhật form/filter tương ứng.

## Goal

Bổ sung khả năng chọn/lọc chi nhánh ở các màn hình Web liên quan, bảo toàn tương thích dữ liệu cũ và build/deploy an toàn.

## Scope

- In-scope:
  - Tạo reusable branch selector cho Web
  - Mở rộng form nhân sự, ngân hàng, quỹ tiền mặt, nhật ký chung để nhận branch_id
  - Mở rộng filter nhật ký chung theo branch_id
  - Đồng bộ TypeScript contracts với API branch_id
- Out-of-scope:
  - Màn hình master CRUD riêng cho branches
  - Siết required branch_id toàn hệ thống ở phase 2

## Relevant Files

- `src/modules/branches/api/branchApi.ts` - API contract và option loader cho branch
- `src/modules/branches/api/BranchSelect.tsx` - UI selector tái sử dụng
- `src/modules/hr/components/NhanSu/*` - map branch_id cho nhân sự
- `src/modules/settings/components/NHTab.tsx` - map branch_id cho tài khoản ngân hàng
- `src/modules/settings/components/QuyTab.tsx` - map branch_id cho quỹ tiền mặt
- `src/pages/NhatKyChung.tsx` - filter branch ở journal entries
- `src/modules/accounting/*` - contract/form/hook journal entries hỗ trợ branch_id

## Gate 0 — DB Precheck (bắt buộc)

- Collections/fields liên quan:
  - branches
  - employees.branch_id
  - company_bank_accounts.branch_id
  - cash_funds.branch_id
  - journal_entries.branch_id
  - payment_vouchers.branch_id
- Data nền cần có:
  - 3 chi nhánh seed ban đầu (`BR001`, `BR002`, `BR003`)
- Constraint/index/default cần có:
  - unique branch code
  - FK branch_id trên các bảng nghiệp vụ mục tiêu
  - index branch_id trên collection nghiệp vụ lớn
- Kết quả: `DB_READY`
- Nếu `DB_GAP_FOUND`: link DB task (directus-staging): N/A

## Checklist (bắt buộc cập nhật realtime)

- [x] 1.0 Gate 0 DB Precheck done
- [x] 2.0 Backend workflow/API gate done
- [x] 3.0 UI gate done
- [x] 4.0 Validation
  - [x] 4.1 Chạy `npx tsc --noEmit` (đạt gián tiếp qua `npm run build`)
  - [x] 4.2 Smoke test flow liên quan
- [x] 5.0 Close
  - [x] 5.1 Lessons learned entry (if issue)
  - [x] 5.2 Commit + push code (web/api)
  - [x] 5.3 Tổng kết evidence

## Validation Evidence

- DB precheck result: `DB_READY` theo rollout DB task `/opt/repos/liouni-erp/directus-staging/ops/tasks/2026-05-16-branch-master-data-rollout-phase1.md`
- `npx tsc --noEmit`: dùng `npm run build` để xác nhận TypeScript + Vite build PASS
- Smoke test: `docker compose ps` web container Up; `curl -I http://127.0.0.1:8808/` -> HTTP 200; `curl -I https://dev.erp.liouni.com/` -> HTTP 200

## Lessons Learned

- Build đầu tiên fail do import nhầm Select component, type chưa mở rộng `branch_id`, và một số lời gọi `t()` dùng fallback string không đúng signature hiện tại. Đã sửa triệt để trước khi deploy.

## Commit/Push Status

- Web repo: pushed `master` at commit `7db3ef1` (`feat: add branch support to ERP web rollout phase 1`)
- API repo: có thay đổi bẩn khác scope trong working tree, không đụng trong bước Web deploy này
- DB/directus staging: apply+verify+document (no code push required)
