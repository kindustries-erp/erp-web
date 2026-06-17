# Task — Customers, Suppliers pages + Operational create/update modals

> **HISTORICAL REFERENCE ONLY**
> Task này thuộc legacy operational / Directus-era flow cũ trước lane `erp-master` hiện tại. Không dùng làm default implementation guidance nếu user không mở lại scope legacy operational.


## Request Input (bạn chỉ cần điền phần này)

- Type: FEATURE
- Mục tiêu: Tạo trang Khách hàng, Nhà cung cấp với filter role từ danh sách đối tác; tạo modal create/update cho Bán hàng, Mua hàng, Chi phí.
- Bối cảnh/ngữ cảnh: Hai trang customers/suppliers đang là ComingSoon. OperationalListPage không có form create/update. Backend đã đủ endpoint.

## Goal

1. Customers page: list đối tác filter role CUSTOMER, modal tạo mới/cập nhật, dùng API /business-partners
2. Suppliers page: list đối tác filter role VENDOR, modal tạo mới/cập nhật
3. Sales modal: create/update chứng từ bán hàng (lines)
4. Purchase modal: create/update chứng từ mua hàng (lines)
5. Expense modal: create/update chứng từ chi phí (lines)

## Scope

- In-scope:
  - replace ComingSoon ở customers/suppliers bằng page thật
  - reuse PartnersTab/PartnersTabView logic nhưng filter role
  - tạo OperationalFormDrawer dùng chung cho sales/purchase/expense với switch theo document_type
  - thêm nút Tạo mới + hành động Sửa vào OperationalListPage
  - đảm bảo FE không tự bịa enum/field
- Out-of-scope:
  - thay đổi backend API/schema
  - kho/inventory create form (scope riêng)
  - payment voucher
  - accounting/posting

## Relevant Files

- `src/App.tsx` - thay ComingSoon bằng route thật
- `src/pages/Customers.tsx` - tạo mới
- `src/pages/Suppliers.tsx` - tạo mới
- `src/modules/partners/components/PartnersTab.tsx` - reuse/fork
- `src/modules/partners/api/partnerApi.ts` - thêm filter role query
- `src/modules/operational/components/OperationalListPage.tsx` - thêm Tạo mới + Sửa
- `src/modules/operational/components/OperationalFormDrawer.tsx` - tạo mới
- `src/modules/operational/api/operationalApi.ts` - thêm update methods

## Gate 0 — DB Precheck (bắt buộc)

- Collections/fields liên quan:
  - `business_partners`, `business_partner_roles`, `sales_service_orders`, `purchase_orders`, `operating_expenses`
- Data nền cần có: existing test partners và operational records
- Constraint/index/default cần có: không thay đổi DB trong scope này
- Kết quả: `DB_READY`
- Nếu `DB_GAP_FOUND`: link DB task (directus-staging): N/A

## Checklist (bắt buộc cập nhật realtime)

- [x] 1.0 Gate 0 DB Precheck done
- [ ] 2.0 Backend workflow/API gate done
- [ ] 3.0 UI gate done
  - [ ] 3.1 Customers page
  - [ ] 3.2 Suppliers page
  - [ ] 3.3 Sales modal create/update
  - [ ] 3.4 Purchase modal create/update
  - [ ] 3.5 Expense modal create/update
  - [ ] 3.6 Route wiring in App.tsx
- [ ] 4.0 Validation
  - [ ] 4.1 Chạy `npx tsc --noEmit`
  - [ ] 4.2 Smoke test flow liên quan
- [ ] 5.0 Close
  - [ ] 5.1 Lessons learned entry (if issue)
  - [ ] 5.2 Commit + push code (web/api)
  - [ ] 5.3 Tổng kết evidence

## Validation Evidence

- DB precheck result: `DB_READY` — no schema changes needed.
- `npx tsc --noEmit`: Pending
- Smoke test: Pending

## Lessons Learned

- Link: No issue

## Commit/Push Status

- Web repo: Pending
- API repo: Pending
- DB/directus staging: N/A (no schema change)
