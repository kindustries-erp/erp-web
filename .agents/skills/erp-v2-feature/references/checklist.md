# Checklist erp-v2-feature

## API
- [ ] Entity, migration (đã được duyệt nếu có DB change)
- [ ] DTO khớp fieldSpec, kiểu `decimal` cho tiền
- [ ] List: filter, sort, phân trang, tổng cho `number`/`decimal`
- [ ] Detail, create, update, status, next-code (nếu có)
- [ ] Permission đúng `permissionCollection`
- [ ] Test API và build pass

## UI bảng
- [ ] Generator chạy, `wire=true`
- [ ] Column selector và `tableInput` id
- [ ] Views và nhóm lọc
- [ ] Filter theo kiểu cột
- [ ] Summary row
- [ ] Search và URL query
- [ ] Loading và empty state

## UI drawer
- [ ] `V2StandardDrawer`, layout và size đúng
- [ ] Form khớp DTO 1-1
- [ ] Key field và option lấy từ enum
- [ ] Validate trong `domain/rules`
- [ ] Footer và tab liên kết (nếu có)

## Nối và i18n
- [ ] Route, menu, page registry (marker)
- [ ] Locale vi/en không còn tên trường thô

## QC
- [ ] `prettier`, `tsc --noEmit`, `eslint --max-warnings=0`, `vitest` (web)
- [ ] Test và build (API)
- [ ] File ≤180 dòng, không import ngược, không No Blue
- [ ] Audit Phần B "Zero-Miss Quality Gate"
- [ ] Commit chỉ khi anh yêu cầu, nhánh `erp-master`
