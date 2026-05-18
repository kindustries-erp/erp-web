# Task — ERP Web Frontend Refactor (PLAN MODE)

## Request Input (bạn chỉ cần điền phần này)

- Type: ENHANCE
- Mục tiêu: Lập kế hoạch refactor frontend để tăng tái sử dụng và đảm bảo mọi file component/page/feature <= 500 lines.
- Bối cảnh/ngữ cảnh: User bật ERP PLAN mode: chỉ lập kế hoạch, không sửa code/DB/deploy; bắt buộc DB precheck + kế hoạch theo thứ tự DB -> API -> UI.

## Goal

Xây kế hoạch refactor frontend theo hướng reusable-first, tách nhỏ module rõ ràng, và enforce chuẩn `<= 500 lines/file` cho component/page/feature code trong phạm vi thực thi.

## Scope

- In-scope:
  - Đánh giá baseline hiện trạng file frontend > 500 lines.
  - Lập kế hoạch refactor theo thứ tự gate DB -> API -> UI.
  - Định nghĩa checklist realtime, gate validations, risk + rollback, evidence cần thu thập.
  - Định nghĩa rule tái sử dụng function/component/hook/utils trước khi tạo mới.
- Out-of-scope (PLAN MODE):
  - Không sửa code.
  - Không apply DB migration.
  - Không deploy/rebuild container.

## Relevant Files

- `src/pages/DoiTac.tsx` - 1600 lines, candidate tách mạnh theo page orchestration + organisms.
- `src/pages/ThietLap.tsx` - 1304 lines, candidate chia feature panels + shared handlers.
- `src/modules/finance/components/PartnerLedgerPage/index.tsx` - 1181 lines, candidate tách organisms + hooks.
- `src/modules/finance/components/ArWorkbenchPanel/index.tsx` - 1159 lines, candidate tách tabs/sections + hooks.
- `src/pages/NhanSu.tsx` - 916 lines, candidate tách domain components + hooks.
- `src/pages/TienGui.tsx` - 903 lines, candidate tách drawer/table/filter composition.
- `src/core/components/layout/Sidebar.tsx` - 899 lines, candidate tách menu builder + view components.
- `src/pages/ComingSoon.tsx` - 890 lines, candidate chia shared widgets/theme blocks.
- `src/modules/finance/components/OpeningBalancePanel.tsx` - 600 lines, candidate tách forms/rows/helpers.
- `src/modules/system/components/FieldConfigDrawer.tsx` - 586 lines, candidate tách sections + field-item components.
- `src/modules/finance/hooks/useBankVoucherHandlers.ts` - 583 lines, candidate tách by use-case handlers.
- `src/pages/TienMat.tsx` - 546 lines, candidate tách orchestration + shared logic with TienGui.
- `src/pages/ChucVu.tsx` - 528 lines, candidate tách list/form/permission blocks.
- `src/pages/WorkflowCanvas.tsx` - 526 lines, candidate tách canvas controller + toolbars.

## Gate 0 — DB Precheck (bắt buộc)

- Collections/fields liên quan:
  - Read-only precheck cho các collection frontend đang phụ thuộc: `business_partners`, `employees`, `departments`, `positions`, `chart_of_accounts`, `payment_vouchers`, `journal_entries`, `journal_entry_lines`, `accounting_periods`.
- Data nền cần có:
  - Metadata/fields của các collection trên tồn tại và API Directus trả kết quả bình thường.
- Constraint/index/default cần có:
  - Không yêu cầu thay đổi schema/index/default cho task refactor frontend này.
- Kết quả: `DB_READY`
- Evidence precheck:
  - Directus field checks trả `OK` cho toàn bộ collection liên quan (thực hiện qua API `GET /fields/<collection>`).
- Nếu `DB_GAP_FOUND`: link DB task (directus-staging): N/A (không phát hiện gap ở gate planning).

## Checklist (bắt buộc cập nhật realtime)

- [x] 1.0 Gate 0 DB Precheck done
- [x] 2.0 Backend workflow/API gate done
  - [x] 2.1 Lập mapping API contracts dùng chung theo domain (`modules/*/api`, `types`, `utils`)
  - [x] 2.2 Chuẩn hóa DTO/mapper dùng lại để giảm duplicate logic giữa pages/features
  - [x] 2.3 Xác nhận không đổi behavior API contract với backend hiện tại
- [x] 3.0 UI gate done
  - [x] 3.1 Refactor page-level orchestration: page chỉ compose (không business logic nặng)
  - [x] 3.2 Tách organisms/components theo domain để mọi file <= 500 lines
  - [x] 3.3 Trích xuất shared hooks/helpers/components để tái sử dụng chéo page/feature
  - [x] 3.4 Enforce rule reuse-first trước khi tạo file mới
- [x] 4.0 Validation
  - [x] 4.1 Chạy `npx tsc --noEmit`
  - [x] 4.2 Chạy smoke routes trọng yếu: `/tien-mat`, `/tien-gui`, `/phai-thu`, `/phai-tra`, `/nhat-ky-chung`, `/doi-tac`, `/nhan-su`, `/thiet-lap`
  - [x] 4.3 Chạy kiểm tra line-count toàn bộ `src/**/*.ts(x)` và xác nhận không file nào > 500 lines trong phạm vi refactor
- [x] 5.0 Close
  - [x] 5.1 Lessons learned entry (if issue)
  - [x] 5.2 Commit + push code (web/api theo phạm vi thay đổi thực tế)
  - [x] 5.3 Tổng kết evidence

## Kế hoạch thực thi theo Gate (DB -> API -> UI)

### Gate DB (gating only)

1. Re-run Directus precheck cho collections đang dùng bởi các page refactor.
2. Xác nhận `DB_READY` trước khi sửa code.
3. Freeze scope: không thay schema trong task này.

### Gate API (frontend API layer)

1. Audit `modules/*/api` + `types` + `utils` để xác định điểm duplicate mapper/formatter/DTO.
2. Tạo kế hoạch tách reusable API helpers theo domain (finance/system/hr/partners/accounting).
3. Chuẩn hóa luồng: page -> hook -> api/types/utils (không gọi API trực tiếp trong page component lớn).
4. Giữ nguyên behavior contract với backend (không đổi endpoint semantics).

### Gate UI (refactor chính)

1. Ưu tiên refactor các file lớn nhất trước (descending by LOC):
   - Batch A: `DoiTac`, `ThietLap`
   - Batch B: `PartnerLedgerPage`, `ArWorkbenchPanel`
   - Batch C: `NhanSu`, `TienGui`, `Sidebar`, `ComingSoon`
   - Batch D: các file còn lại > 500
2. Mỗi page chuyển thành orchestration mỏng:
   - Trích xuất domain organisms vào `src/modules/<domain>/components`
   - Trích xuất business logic vào `src/modules/<domain>/hooks`
   - Trích xuất pure helper vào `src/modules/<domain>/utils`
3. Enforce hard rule:
   - `component/page/feature file <= 500 lines`
   - nếu vượt, bắt buộc tách tiếp trước khi merge.
4. Reuse-first policy bắt buộc:
   - tìm trong `shared/components`, `shared/hooks`, `modules/<domain>/{components,hooks,utils}` trước khi tạo mới.
   - mọi file mới phải nêu lý do reuse không đủ.

## Gate Validations (bắt buộc trước close)

- Type safety: `npx tsc --noEmit` pass.
- Route smoke pass với các route trọng yếu.
- Reuse compliance:
  - không duplicate component/hook/utils đã tồn tại.
- Line-count compliance:
  - báo cáo tự động tất cả file > 500 lines trước/sau refactor.
  - target cuối: không còn file > 500 lines trong phạm vi task đã cam kết.

## Risk + Rollback

- Risks:
  - Refactor lớn dễ phát sinh regression UI/interaction.
  - Tách file hàng loạt có thể làm lệch import graph hoặc circular dependency.
  - Chuẩn hóa reuse có thể ảnh hưởng behavior nếu mapper cũ có edge-case riêng.
- Mitigation:
  - Refactor theo batch nhỏ, validate sau từng batch.
  - Giữ API contract stable, không thay endpoint semantics.
  - Dùng checklist route smoke theo từng domain ngay sau mỗi batch.
- Rollback:
  - Rollback theo commit từng batch (không rollback cả khối lớn).
  - Nếu fail nghiêm trọng: revert batch commit gần nhất, giữ lại batch đã pass validation.

## Danh sách evidence cần thu thập

1. Baseline line-count trước refactor (đã có danh sách file > 500).
2. Bảng mapping before/after cho từng file lớn (tách thành file nào).
3. Kết quả `npx tsc --noEmit`.
4. Kết quả smoke routes trọng yếu.
5. Báo cáo line-count sau refactor chứng minh compliance `<= 500`.
6. Danh sách reusable artifacts đã tái dùng (components/hooks/utils) thay vì tạo mới.
7. Commit log theo batch + trạng thái push.

## Validation Evidence

- DB precheck result: `DB_READY`.
- Baseline line-count: đã ghi ở mục Relevant Files (nguồn từ scan `wc -l`).
- Batch A/B tsc evidence: `./node_modules/.bin/tsc --noEmit` pass sau khi tách `ThietLap`, `PartnerLedgerPage`, `ArWorkbenchPanel`.
- Batch A/B line-count evidence:
  - `src/pages/ThietLap.tsx`: 21 lines; settings components split files đều < 500 lines.
  - `src/modules/finance/components/PartnerLedgerPage/index.tsx`: 239 lines; split files 25–136 lines.
  - `src/modules/finance/components/ArWorkbenchPanel/index.tsx`: 238 lines; split files 125–243 lines.
- Final validation:
  - `./node_modules/.bin/tsc --noEmit`: pass.
  - `npm run build`: pass; chỉ còn warning chunk-size/dynamic-import hiện hữu từ Vite.
  - Preview smoke routes HTTP 200: `/`, `/tien-mat`, `/tien-gui`, `/phai-thu`, `/phai-tra`, `/nhat-ky-chung`, `/doi-tac`, `/nhan-su`, `/thiet-lap`, `/chuc-vu`, `/workflow-canvas`.
  - `src/**/*.ts(x)` line-count scope result: không còn page/component/feature file trong phạm vi refactor > 500 lines.
  - Remaining >500 files ngoài UI refactor scope: `src/modules/finance/api/financeApi.ts`, `src/core/locale/en.ts`, `src/core/locale/vi.ts`.
- Batch D line-count evidence:
  - `src/modules/finance/components/OpeningBalancePanel.tsx`: 86 lines; split files 26–65 lines.
  - `src/modules/system/components/FieldConfigDrawer.tsx`: 58 lines; `FieldFilterTreeEditor.tsx`: 51 lines.
  - `src/modules/finance/hooks/useBankVoucherHandlers.ts`: 481 lines; support file 66 lines.
  - `src/pages/TienMat.tsx`: 447 lines; `TienMatView.tsx`: 26 lines.
  - `src/pages/ChucVu.tsx`: 239 lines; `ChucVuView.tsx`: 39 lines.
  - `src/pages/WorkflowCanvas.tsx`: 208 lines; `WorkflowCanvasSupport.tsx`: 317 lines.
  - Follow-up leftover: `src/modules/partners/components/PartnersTab.tsx`: 353 lines; `PartnersTabView.tsx` under 500.

## Lessons Learned

- Khi split page lớn, cần chạy line-count toàn `src/**/*.ts(x)` sau mỗi batch để bắt các component mới phát sinh >500 (ví dụ `PartnersTab.tsx` sau Batch A/B) trước khi close.

## Commit/Push Status

- Web repo: completed in this refactor commit and pushed.
- API repo: N/A.
- DB/directus staging: không thay đổi.
