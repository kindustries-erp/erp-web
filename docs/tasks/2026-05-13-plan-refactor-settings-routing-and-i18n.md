# Task: FIX i18n + ENHANCE settings routing (ERP PLAN mode)

## Request Input
- **Type:** FIX + ENHANCE
- **Mục tiêu:**
  1. Fix lỗi dịch (i18n) còn sót trong các tab Thiết lập (đặc biệt là title của Tài khoản NH, và title/table của Hệ thống TK).
  2. Enhance routing: Tách 3 tab trong trang Thiết lập (Quỹ, NH, TK) thành 3 page riêng biệt với 3 URL path khác nhau.
- **Bối cảnh/ngữ cảnh:** Hiện tại, toàn bộ module Thiết lập dùng chung một page `thietlap` và render component con qua tab, gây khó khăn trong việc quản lý state và URL. Bug i18n cũng cho thấy cấu trúc key hiện tại chưa ổn định.

## Goal
Lập kế hoạch chi tiết để sửa lỗi dịch và refactor cấu trúc routing của module Thiết lập sang dạng multi-page.

## Scope
- **In-scope:**
  - `src/modules/settings/components/{QuyTab,NHTab,TKTab}.tsx`
  - `src/pages/ThietLap.tsx`
  - `src/core/routing/index.ts`, `PageLoader.tsx`
  - `src/core/components/layout/Sidebar.tsx`
  - Locale dictionaries `src/core/locale/{vi,en}.ts`
- **Out-of-scope:**
  - Thay đổi DB schema/data.
  - Thay đổi API contract.
  - Refactor các module khác ngoài Thiết lập.

## Relevant Files
- `src/pages/ThietLap.tsx` (sẽ được thay thế)
- `src/modules/settings/components/{QuyTab,NHTab,TKTab}.tsx` (sẽ được chuyển thành page)
- `src/core/routing/index.ts`
- `src/core/routing/PageLoader.tsx`
- `src/core/components/layout/Sidebar.tsx`
- `src/core/locale/{vi,en}.ts`

## Gate 0 — DB Precheck (bắt buộc)
- **Collections/fields liên quan:** `cash_funds`, `bank_accounts`, `chart_of_accounts`.
- **Data nền cần có:** Có thể rỗng.
- **Constraint/index/default cần có:** Không yêu cầu thay đổi.
- **Kết quả:** `DB_READY`

## Phân rã kế hoạch theo thứ tự DB -> API -> UI

### Gate 1 — DB (read-only verification)
1. Verify các collection `cash_funds`, `bank_accounts`, `chart_of_accounts` tồn tại.
2. Xác nhận không cần migration schema.
3. Chốt Gate 1 = `DB_READY`.
**Deliverable:** Evidence DB_READY.

### Gate 2 — API/workflow verification
1. Verify các API đang dùng cho 3 tab.
2. Xác nhận refactor routing không thay đổi API call.
**Deliverable:** Kết luận no-impact.

### Gate 3 — UI Refactor & Fix Plan

#### **Phase 1: Fix i18n & Chuẩn hóa Namespace**
1.  **Audit & Fix NHTab:** Key `thietlap.banks.title` đang được dùng nhưng trong `vi.ts` là `thietlap.bank.title`.
2.  **Chuẩn hóa Namespace:**
    *   Tạo namespace `settings.nh` cho tab Ngân hàng, migrate toàn bộ key trong `NHTab.tsx` sang.
    *   Tạo namespace `settings.quy` cho tab Quỹ, migrate toàn bộ key trong `QuyTab.tsx` sang.
    *   Kiểm tra lại `settings.tk` và `TKTab.tsx`, đảm bảo không còn sót key nào dùng `thietlap.*` hoặc `common.*` không cần thiết.
3.  **Cập nhật Dictionaries:** Thêm các namespace `settings.nh` và `settings.quy` vào `vi.ts` và `en.ts` một cách đồng bộ.

#### **Phase 2: Refactor Routing (Tabs to Pages)**
1.  **Tạo Page Components mới:**
    *   Tạo file `src/pages/ThietLapQuy.tsx`, move code từ `QuyTab.tsx` vào.
    *   Tạo file `src/pages/ThietLapNganHang.tsx`, move code từ `NHTab.tsx` vào.
    *   Tạo file `src/pages/ThietLapTaiKhoan.tsx`, move code từ `TKTab.tsx` vào.
    *   Bọc mỗi page mới bằng layout chung (div padding, max-width).
2.  **Cập nhật Routing:**
    *   Trong `src/core/routing/index.ts`, xóa route `thietlap`.
    *   Thêm 3 routes mới: `thietlap-quy`, `thietlap-nh`, `thietlap-tk` với `group: "settings"`.
    *   Trong `src/core/routing/PageLoader.tsx`, thêm lazy-loading cho 3 page component mới.
3.  **Cập nhật Sidebar:**
    *   Trong `src/core/components/layout/Sidebar.tsx`:
        *   Thay đổi `NavItem` của "Thiết lập danh mục" để chỉ handle expand/collapse, không navigate.
        *   Sửa 3 `SubItem` hiện tại để navigate đến 3 page mới (`thietlap-quy`, `thietlap-nh`, `thietlap-tk`).
        *   Cập nhật logic `active` của `SubItem` để highlight dựa trên `currentPage` mới, không còn dùng `settingsActiveTab` từ store.
4.  **Dọn dẹp:**
    *   Xóa file `src/pages/ThietLap.tsx`.
    *   Xóa state `settingsActiveTab` khỏi Zustand store (`src/core/config/appStore.ts`).
    *   Grep toàn bộ project để đảm bảo không còn chỗ nào sử dụng `settingsActiveTab`.

## Checklist realtime (PLAN mode)
- [x] 1.0 Gate 0 DB Precheck done (`DB_READY`).
- [x] 2.0 Lên kế hoạch chi tiết cho i18n fix và routing refactor.
- [x] 3.0 Gate validations, risk, evidence đã được định nghĩa.
- [ ] 4.0 Thực thi code + verify runtime (chờ user xác nhận).

## Gate validations (khi thực thi)
- [ ] V1: `npx tsc --noEmit` pass.
- [ ] V2: Toàn bộ i18n key trong 3 module đã được chuyển sang namespace `settings.*`.
- [ ] V3: 3 menu con trong "Thiết lập danh mục" navigate tới 3 URL riêng biệt: `/thietlap-quy`, `/thietlap-nh`, `/thietlap-tk`.
- [ ] V4: Mỗi URL render đúng page tương ứng, UI không vỡ, chức năng (search, add, edit, delete) hoạt động như cũ.
- [ ] V5: State `settingsActiveTab` và page `ThietLap.tsx` đã được xóa hoàn toàn.

## Risk + Rollback
- **Risk:** Refactor routing có thể làm gãy link hoặc logic active trên sidebar. Di chuyển file có thể gây lỗi import path.
- **Rollback:** Toàn bộ thay đổi sẽ được commit riêng. Nếu có lỗi nghiêm trọng, revert commit đó là đủ để quay về trạng thái cũ.

## Danh sách evidence cần thu thập khi thực thi
1.  **i18n fix:**
    *   Diff của `vi.ts`, `en.ts` cho thấy các namespace `settings.quy`, `settings.nh` đã được thêm.
    *   Diff của `{Quy,NH,TK}Tab.tsx` cho thấy đã chuyển sang namespace mới.
2.  **Routing Refactor:**
    *   Diff của `src/core/routing/index.ts` và `PageLoader.tsx` showing 3 routes mới.
    *   Diff của `Sidebar.tsx` cho thấy logic navigate mới.
    *   Evidence `git rm src/pages/ThietLap.tsx`.
    *   Evidence `grep -L "settingsActiveTab" src` không trả về kết quả nào.
3.  **Close-out:**
    *   Commit hash.
    *   Evidence deploy thành công (build log, container status).

## Sẵn sàng thực thi
Kế hoạch đã sẵn sàng. Chờ xác nhận của bạn để bắt đầu thực thi.