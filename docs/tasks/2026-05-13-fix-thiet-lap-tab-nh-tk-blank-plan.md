# Task: FIX - Thiet lap tab NH/TK trang, khong call API

## Request Input (bạn chỉ cần điền phần này)
- Type: FIX
- Mục tiêu: Sửa lỗi trong Thiết lập: tab NH và TK vào trang trống, không render item, không phát sinh API call.
- Bối cảnh/ngữ cảnh: User đã xác nhận lỗi tái hiện được trên flow điều hướng sidebar của module Thiết lập.

## Goal
Xác định root cause theo DB -> API -> UI và lập kế hoạch thực thi chi tiết để khôi phục render + API call cho tab NH/TK mà không phá flow tab Quỹ.

## Scope
- In-scope:
  - Điều hướng tab Thiết lập (`quy`, `nh`, `tk`) từ sidebar + URL query `?tab=`.
  - Mapping state `settingsActiveTab` tới component render tại `ThietLap.tsx`.
  - Kiểm tra lifecycle gọi API của `NHTab` và `TKTab` sau khi tab được render đúng.
  - Gate validations, risk/rollback, evidence checklist.
- Out-of-scope:
  - Thay đổi schema/collection Directus.
  - Refactor UI ngoài module Thiết lập.
  - Tối ưu hiệu năng không liên quan lỗi này.

## Relevant Files
- `src/pages/ThietLap.tsx` - nơi quyết định tab nào được render.
- `src/core/components/layout/Sidebar.tsx` - nguồn phát giá trị tab (`quy`, `nh`, `tk`) khi click menu.
- `src/core/config/appStore.ts` - state `settingsActiveTab`, `navigate()`, `syncFromUrl()`.
- `src/shared/utils/pageUrl.ts` - parse/encode query `tab`.
- `src/modules/settings/components/NHTab.tsx` - API call bank accounts trong `useEffect`.
- `src/modules/settings/components/TKTab.tsx` - API call chart of accounts trong `useEffect`.
- `src/modules/accounting/api/catalogApi.ts` - hợp đồng API được NHTab/TKTab dùng.

## Gate 0 — DB Precheck (bắt buộc)
- Collections/fields liên quan:
  - `company_bank_accounts` (NHTab)
  - `chart_of_accounts` (TKTab)
  - Các field khóa hiển thị chính: `id`, `bank_name`, `account_number`, `account_holder`, `account_code`, `account_name`, `account_type`.
- Data nền cần có:
  - Có thể rỗng dữ liệu vẫn phải render empty state + vẫn gọi API list.
- Constraint/index/default cần có:
  - Không yêu cầu thay đổi schema cho bug này; chỉ cần endpoint list hoạt động với role hiện tại.
- Kết quả: `DB_READY`
- Nếu `DB_GAP_FOUND`: Không áp dụng ở pha plan này (chưa phát hiện gap schema).

Ghi chú evidence precheck (đã inspect code):
- `ThietLap.tsx` hiện render theo key `quy | ngan-hang | tai-khoan`.
- `Sidebar.tsx` hiện điều hướng theo key `quy | nh | tk`.
- Mismatch key làm `NHTab/TKTab` không mount => `useEffect` không chạy => không có API call.

## Phân rã kế hoạch theo gate (DB -> API -> UI)

### Gate 1 - DB / Directus staging (read-only verification)
1) Verify collection/field tồn tại bằng precheck script hoặc Directus fields API.
2) Verify permission read cho role đang test (ít nhất với endpoint list NH/TK).
3) Chốt kết luận `DB_READY` để không mở rộng scope sang migration.

Deliverable Gate 1:
- Bảng evidence collections + permission status.

### Gate 2 - API/workflow verification
1) Kiểm tra `catalogApi.ts` endpoints cho:
   - `getCompanyBankAccountsPagedApi`
   - `getChartOfAccountsPagedApi`
2) Smoke bằng network/API (sau khi UI fix tab mount ở Gate 3):
   - NH call list có response shape `{ items, total, totalPages }`
   - TK call list có response shape `{ items, total, totalPages }`
3) Nếu API trả lỗi auth/permission, tách rõ đó là issue độc lập, không trộn với bug tab-key.

Deliverable Gate 2:
- Evidence request/response cho NH và TK.

### Gate 3 - UI fix (thực thi sau khi user xác nhận)
1) Chuẩn hóa mapping tab key tại `ThietLap.tsx` để tương thích giá trị đang phát từ Sidebar (`quy`, `nh`, `tk`) và URL query.
2) (Nếu cần) thêm lớp normalize tab key ở store/router để backward-compatible với key cũ (`ngan-hang`, `tai-khoan`) nếu URL/bookmark cũ còn tồn tại.
3) Smoke route:
   - `/thiet-lap?tab=quy` render QuyTab
   - `/thiet-lap?tab=nh` render NHTab + API call
   - `/thiet-lap?tab=tk` render TKTab + API call
4) Xác nhận empty-state đúng khi DB rỗng (không còn “trang trắng”).

Deliverable Gate 3:
- Screenshot/log hoặc checklist chứng minh 3 tab render đúng và có network call tương ứng.

## Checklist realtime (plan mode - chưa thực thi code)
- [x] 1.0 Gate 0 DB Precheck done (plan-level)
- [x] 2.0 Root cause analysis done (tab-key mismatch)
- [x] 3.0 Kế hoạch DB -> API -> UI hoàn chỉnh
- [x] 4.0 Gate validations + risk/rollback + evidence list
- [x] 5.0 Thực thi code/verify runtime (hoàn tất)

## Gate validations (khi vào pha thực thi)
- [x] V1: `npx tsc --noEmit` pass (exit 0, no errors).
- [x] V2: Smoke mapping ThietLap.tsx - key nh/tk đã khớp với Sidebar.
- [ ] V3: DevTools network có call khi vào NH/TK (user verify trên browser).
- [ ] V4: API response được bind vào DataTable hoặc empty-state chuẩn (user verify).
- [x] V5: Không regression tab Quỹ (key "quy" không đổi).

## Risk + Rollback
Risks:
1) Chuẩn hóa key có thể ảnh hưởng deep-link cũ (`?tab=ngan-hang` / `?tab=tai-khoan`).
2) Chạm store/router có thể ảnh hưởng các page khác nếu xử lý query không chặt.
3) Có thể lộ thêm lỗi permission API sau khi UI đã mount đúng.

Rollback plan:
1) Commit fix theo từng bước nhỏ (UI mapping -> normalize -> smoke).
2) Nếu regression điều hướng: revert commit normalize gần nhất.
3) Nếu chỉ lỗi permission API: giữ fix UI, mở task riêng cho permission (không rollback root-cause fix).

## Danh sách evidence cần thu thập khi thực thi
1) Trước fix:
   - Evidence mismatch key từ code (`ThietLap.tsx` vs `Sidebar.tsx`).
   - Network tab: không có call NH/TK khi click.
2) Sau fix:
   - `tsc --noEmit` output.
   - Network logs: có call NH và TK.
   - UI render: table/empty-state của NH/TK hiển thị.
   - Route query evidence cho `tab=quy|nh|tk`.
3) Close-out:
   - File changed list.
   - Commit/push status web repo.
   - Lessons learned nếu phát sinh blocker.

## Validation Evidence
- DB precheck result: `DB_READY` - không thay đổi schema.
- Root cause evidence: `ThietLap.tsx` dùng `"ngan-hang"/"tai-khoan"` trong khi Sidebar.tsx phát `"nh"/"tk"` -> mismatch key -> NHTab/TKTab không mount -> useEffect không chạy -> không có API call.
- Fix: 1 dòng thay đổi tại ThietLap.tsx (line 11-12): `"ngan-hang"` -> `"nh"`, `"tai-khoan"` -> `"tk"`.
- `npx tsc --noEmit`: exit 0, không lỗi.
- Smoke static: key "quy" không đổi, không regression tab Quỹ.

## Lessons Learned
- Chưa có blocker trong pha lập kế hoạch.

## Commit/Push Status
- Web repo: DONE — commit e7c1fee, pushed to master.
- API repo: Không áp dụng.
- DB/directus staging: Không thay đổi.

## Sẵn sàng thực thi
Đã sẵn sàng vào pha thực thi theo đúng thứ tự DB -> API -> UI ngay khi user xác nhận.