---
name: employees-core
description: Module tri thức Nhân viên V2 trong erp-web gồm lõi src/v2/core/employees và thin module src/v2/modules/employees-management (route /v2/employees-management, API /api/v2/employees). Chứa cấu trúc, quy tắc ngày giờ VN, quyền theo hành động, CCCD và liên kết với users-management.
---

# Module Tri Thức: Employees V2 - Frontend (`erp-web`)

## 1. Phạm vi

- Route `/v2/employees-management` (menu nhóm `settings`), page key `employees-management`. Quyền collection `employees`: `read` (vào route), `create` (nút thêm), `update` (sửa, đổi trạng thái, xem CCCD đầy đủ), `delete` (xóa, ẩn khi còn tài khoản liên kết).
- Backend: `/api/v2/employees`, xem skill `employees-core` của erp-api. V1 `ErpEmployeesPage` (`/api/v1/employees`) giữ nguyên, không dùng lại.

## 2. Cấu trúc

```text
src/v2/core/employees/                  # lõi họ employees
├── employees.config.type.ts            # EmployeeModuleConfig
├── employees.locale.ts                 # i18n VI/EN v2.employees.*
├── api/                                # employeesApi (employeesV2Api, toEmployeePayload), keys, queries, mutations, dtos
├── domain/                             # employee.ts, rules/employeeDates.ts, rules/employeeRules.ts
├── components/                         # status badge, employee-table (cột, views), employee-form (3 section)
├── drawers/                            # EmployeeDrawer + hook; view mode dùng EmployeeProfileView/EmployeeWorkView (V2DrawerRowList, không ô nhập)
├── hooks/                              # useEmployeeListController, employeeRowActions
└── index.ts                            # barrel @/v2/core/employees
src/v2/modules/employees-management/    # thin module: api delegate, config, page + hook, locale riêng, test
```

## 3. Quy tắc

- Ngày thuần (sinh, vào làm, nghỉ việc) lưu timestamptz: UI làm việc với `yyyy-MM-dd` theo giờ VN, gửi ISO lúc 00:00 +07:00 (`vnDateToIso`) và hiển thị bằng `isoToVnDate`/`formatVnDate`; không dùng `V2TableDateCell` cho các cột này.
- Khi sửa, trường nullable bị xóa gửi `null`; khi tạo, trường rỗng bị bỏ khỏi payload. Mã nhân viên để trống thì backend sinh.
- Bảng chỉ thấy `nationalIdMasked`; form sửa nạp CCCD đầy đủ qua `GET /:id/national-id` (chỉ khi có quyền update). Khối "Tài khoản liên kết" chỉ đọc, liên kết quản lý ở users-management.
- Cột lọc/sort dùng key backend: `employeeCode`, `fullName`, `jobTitle`, `department`, `branchId` (lọc theo danh sách chi nhánh), `phone`, `email`, `birthDate`, `startDate`, `status`. Cột `account` chỉ hiển thị.
- Chi nhánh lấy từ `/api/v2/branches` (response phẳng `items`).
- users-management dùng `usersV2Api.listEmployees` gọi `/api/v2/employees?status=ACTIVE`.

## 4. Kiểm thử

`bunx vitest run src/v2/core/employees src/v2/modules/employees-management src/v2/core/users`.
