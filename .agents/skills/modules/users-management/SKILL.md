---
name: users-management
description: Module tri thức Quản lý tài khoản V2 trong erp-web gồm lõi src/v2/core/users và thin module src/v2/modules/users-management (route /v2/users-management, API /api/v2/users-management). Chứa cấu trúc, luồng dữ liệu, quyền, múi giờ, giới hạn hiện tại so với V1 và cách chạy E2E.
---

# 👤 Module Tri Thức: Users Management V2 - Frontend (`erp-web`)

## 1. Phạm vi

- Route: `/v2/users-management` (menu nhóm `settings`). Page key `users-management`.
- Quyền: `admin_users` với action `manage` (route guard, nút tạo, row action). Khớp guard backend `admin_users:manage`.
- Backend: `/api/v2/users-management` (bảng `users_management`, `users_management` là nguồn chính, mirror một chiều sang `core_users` cho các FK cũ; đăng nhập qua auth v2 `/api/v2/auth-sessions`, xem skill `v2-auth`). Chi tiết API: skill `erp-users` của erp-api (mục 0).
- V1 (`ErpUsersPage`, `/api/v1/admin/users`) vẫn chạy song song cho tới khi anh ra lệnh xóa.
- Tài khoản không có xóa: chỉ ngưng hoạt động / kích hoạt.

## 2. Cấu trúc

```text
src/v2/core/users/                      # lõi họ users
├── core.manifest.json                  # exports cho v2-thin-module
├── users.config.type.ts                # UserModuleConfig
├── users.locale.ts                     # i18n VI/EN v2.users.*
├── api/
│   ├── userApi.type.ts                 # UserApi (list, options, get, create, update, activate, deactivate, resetPassword)
│   ├── usersApi.ts                     # usersV2Api + mapper payload/params; listEmployees (/api/v2/employees?status=ACTIVE)
│   ├── userKeys.ts                     # createUserKeys, userKeys
│   ├── dtos/user.dto.ts
│   ├── queries/                        # useUsersQuery, useUserEmployeeOptionsQuery
│   └── mutations/useUserMutations.ts   # save, toggle status, reset password
├── domain/                             # user.ts (UserRecord, UserFormValue), rules/userRules.ts
├── components/{molecules,organisms}/   # user-status-badge, user-table (cột, views), user-form, user-reset-password
├── drawers/                            # UserDrawer + hook (tạo: email + mật khẩu; sửa: trạng thái + nhân viên)
├── hooks/useUserListController.tsx     # quyền, drawer, xác nhận đổi trạng thái, đặt lại mật khẩu, view mode
└── index.ts                            # barrel @/v2/core/users

src/v2/modules/users-management/        # thin module: api client, config, page, locale riêng, test
```

## 3. Luồng dữ liệu và quy tắc

- Request qua `v2HttpClient`. List trả `{ items, pagination }`, chi tiết/ghi trả `{ message, data }` (client bóc `data`).
- Cột lọc/sort gửi đúng key backend: `email`, `employee`, `status`, `lastLoginAt`, `createdAt`.
- Email chỉ nhập khi tạo; mật khẩu 8–72 ký tự (kiểm cả client và server). Sửa chỉ đổi `status` và `employeeId` (rỗng = gỡ liên kết). Backend chặn tự ngưng chính mình (400) và trả 409 khi nhân viên đã gắn user khác.
- Đặt lại mật khẩu / ngưng hoạt động thu hồi phiên đăng nhập ở backend. Hộp thoại xóa giá trị mật khẩu khi đóng.
- **Múi giờ**: DB `timestamptz`, API trả ISO UTC, bảng hiển thị theo múi giờ trình duyệt qua atom `V2TableDateCell`.
- Nhân viên để liên kết: `listEmployees` gọi `/api/v2/employees?page=1&pageSize=200&status=ACTIVE` (họ employees, xem skill `employees-core`).
- Mọi chuỗi hiển thị qua `useV2Translation` với khóa `v2.users.*` (lõi) và `v2.usersManagement.*` (module).

## 4. Kiểm thử

- Vitest: `bunx vitest --run src/v2/core/users src/v2/modules/users-management`.
- E2E: `e2e/users-management.e2e.mjs` (`bun run e2e:users-management`), 11 kiểm tra: bảng gọi API v2, tạo qua drawer (chặn mật khẩu ngắn), tài khoản mới đăng nhập được, tìm, ngưng/kích hoạt, đặt lại mật khẩu.
  - Cần `E2E_ADMIN_PASSWORD` (mật khẩu admin, đọc `SEED_ADMIN_PASSWORD` trong `erp-api/.env`, không in ra) hoặc `E2E_PASSWORD`; `E2E_ADMIN_EMAIL` mặc định `admin@liouni.com`.
  - Tạo dữ liệu email `e2e-users-*@example.com`; không có API xóa nên dọn bằng SQL (xóa `core_refresh_tokens`, `core_users`, `users_management` theo email) sau khi xác nhận `SELECT current_database();`. Không chạy trên DB production.

## 5. Còn lại và lưu ý

- Cutover auth/FK và xóa V1 chỉ làm khi có lệnh.
- `bun run type:check` mặc định (heap 1536MB) có thể hết bộ nhớ trên repo lớn; chạy với `NODE_OPTIONS=--max-old-space-size=6144` khi cần kiểm cục bộ.
