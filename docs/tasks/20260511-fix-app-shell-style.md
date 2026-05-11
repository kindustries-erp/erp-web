# Task: Fix App Shell Style according to Theme

## 1. DB Precheck
- [x] Không liên quan đến DB. `DB_READY`

## 2. UI Fixes
- [x] Rà soát style `.app-shell` và `.theme-classic .app-shell` trong `src/styles/shell.css`.
- [x] Đồng nhất style cho `theme-classic`: bỏ margin, set height 100%, bỏ border/radius/shadow.
- [x] Kiểm tra xem có inline style nào đè lên `background` của `.app-shell` không. (Đã thêm !important để đảm bảo)
- [x] Verify hiển thị trên cả theme mặc định và theme classic.

## 3. Validation
- [x] Smoke check: Navigation, Sidebar, Topbar hoạt động bình thường.
- [x] `npx tsc --noEmit`
