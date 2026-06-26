# Task — UI split Hóa đơn nháp / Đã phát hành thành 2 tab, 2 table

## Request Input (bạn chỉ cần điền phần này)

- Type: ENHANCE
- Mục tiêu: Tách rõ 2 tab + 2 table cho hóa đơn nháp và hóa đơn đã phát hành, có nút sync riêng từng tab.
- Bối cảnh/ngữ cảnh: User yêu cầu rõ ràng không gộp chung list; dữ liệu cần sync lại từ Viettel sau khi DB được làm sạch.

## Goal

Trang Hóa đơn điện tử hiển thị độc lập 2 luồng Draft/Issued, tránh nhầm lẫn trạng thái và cho phép thao tác sync theo từng luồng.

## Scope

- In-scope:
  - Tách tab Draft/Issued
  - Mỗi tab có table, pagination, filter và nút sync riêng
  - Gọi API list/sync mới tương ứng
- Out-of-scope:
  - Không thay đổi design system chung
  - Không thay đổi luồng Tax Portal IN/OUT

## Relevant Files

- `src/pages/HoaDonDienTu.tsx` - page orchestration tabs
- `src/modules/accounting/api/sinvoiceApi.ts` - API functions sync/list draft/issued
- `src/modules/accounting/components/*` - nếu cần tách table component

## Gate 0 — DB Precheck (bắt buộc)

- Collections/fields liên quan:
  - `einvoices` theo status DRAFT/ISSUED
- Data nền cần có:
  - API sync/list draft/issued trả dữ liệu
- Constraint/index/default cần có:
  - không đổi schema
- Kết quả: `DB_READY`
- Nếu `DB_GAP_FOUND`: link DB task (directus-staging): N/A

## Checklist (bắt buộc cập nhật realtime)

- [x] 1.0 Gate 0 DB Precheck done
- [ ] 2.0 Backend workflow/API gate done
- [ ] 3.0 UI gate done
- [ ] 4.0 Validation
  - [ ] 4.1 Chạy `npx tsc --noEmit`
  - [ ] 4.2 Smoke test flow liên quan
- [ ] 5.0 Close
  - [ ] 5.1 Lessons learned entry (if issue)
  - [ ] 5.2 Commit + push code (web/api)
  - [ ] 5.3 Tổng kết evidence

## Validation Evidence

- DB precheck result: DB đã xóa sạch einvoices, sẵn sàng sync lại.
- `npx tsc --noEmit`: pending
- Smoke test: pending

## Lessons Learned

- Không có issue

## Commit/Push Status

- Web repo: pending
- API repo: pending
- DB/directus staging: apply+verify+document (no code push required)
