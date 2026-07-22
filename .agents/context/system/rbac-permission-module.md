# RBAC / Phan Quyen Module Notes

Ngay 2026-05-01, UI man hinh "Phan quyen & Vai tro" da duoc go khoi frontend vi layout bi loi. Tai lieu nay ghi lai nhung phan module, function va API da lam duoc de co the tiep tuc sau nay.

## Trang thai hien tai

- Da xoa UI page `PhanQuyenV2`.
- Da xoa cac component UI:
  - `src/modules/system/components/RoleDrawer.tsx`
  - `src/modules/system/components/PermissionMatrix.tsx`
  - `src/modules/system/components/RoleTable.tsx`
- Da bo item "Phan quyen & Vai tro" khoi sidebar.
- Route `phanquyen` trong `App.tsx` tam thoi render `ComingSoon` neu truy cap truc tiep.
- Van giu lai API wrapper, hooks va type definitions de tai su dung.

## Files con giu lai

- `src/modules/system/api/rbacApi.ts`
- `src/modules/system/hooks/useRoles.ts`
- `src/modules/system/hooks/usePermissionsEditor.ts`
- `src/modules/system/types/rbac.ts`

## API wrapper da co

File: `src/modules/system/api/rbacApi.ts`

- `getRolesApi(params?)`
  - Goi `GET /api/v1/rbac/roles`.
  - Ho tro pagination/search qua params.
  - Normalize response ve `PaginatedResponse<Role>`.

- `createRoleApi(dto)`
  - Goi `POST /api/v1/rbac/roles`.
  - Tao role moi.

- `updateRoleApi(id, dto)`
  - Goi `PATCH /api/v1/rbac/roles/:id`.
  - Cap nhat role.

- `deleteRoleApi(id)`
  - Goi `DELETE /api/v1/rbac/roles/:id`.
  - Xoa role.

- `getRolePermissionsApi(roleId)`
  - Goi `GET /api/v1/rbac/roles/:roleId/permissions`.
  - Lay danh sach permission cua role.

- `saveRolePermissionsApi(roleId, dto)`
  - Goi `PATCH /api/v1/rbac/roles/:roleId/permissions`.
  - Luu permission list.

- `getUserEmailsMapApi()`
  - Goi `GET /api/v1/users?pageSize=500`.
  - Tao map `userId -> email/displayName`.
  - Neu loi thi tra `{}` de UI/hook khong bi crash.

## Hooks da co

File: `src/modules/system/hooks/useRoles.ts`

- Quan ly state role list:
  - `roles`
  - `usersMap`
  - `loading`
  - `error`
  - `page`
  - `pageSize`
  - `total`
  - `totalPages`
  - `search`

- Functions:
  - `load(opts?)`: load role list va user email map.
  - `handleSearch(q)`: set search, reset page ve 1, reload.
  - `handlePage(pg)`: doi page va reload.
  - `handlePageSize(ps)`: doi page size, reset page ve 1, reload.
  - `createRole(dto)`: tao role, reload list.
  - `updateRole(id, dto)`: cap nhat role trong list local.
  - `deleteRole(id)`: xoa role, reload list.

File: `src/modules/system/hooks/usePermissionsEditor.ts`

- Quan ly permission matrix theo role:
  - `permMap`
  - `loading`
  - `saving`
  - `error`

- Internal helpers:
  - `buildEmptyMap()`: tao map CRUD false cho tat ca collections.
  - `permissionsToMap(permissions)`: convert list permission tu API sang `PermissionMap`.
  - `mapToPermissions(map)`: convert `PermissionMap` sang payload list de save.

- Functions:
  - `loadPermissions(roleId)`: load permission cua role.
  - `toggle(collection, action)`: bat/tat mot action.
  - `toggleRow(collection, value)`: bat/tat tat ca CRUD cua mot collection.
  - `toggleColumn(action, value)`: bat/tat mot action tren tat ca collection.
  - `isRowFull(collection)`: kiem tra collection da full CRUD.
  - `isColumnFull(action)`: kiem tra action da bat tren tat ca collection.
  - `save()`: patch permissions hien tai len API.
  - `reset()`: reset state editor.

## Types da co

File: `src/modules/system/types/rbac.ts`

- `Role`
  - `id`
  - `name`
  - `description`
  - `icon`
  - `admin_access`
  - `app_access`
  - `users?: number | string[]`

- `CreateRoleDto`
- `UpdateRoleDto`
- `CrudAction = "create" | "read" | "update" | "delete"`
- `Permission`
- `SavePermissionsDto`
- `CollectionDef`
- `PermissionMap`

## Collection scope da khai bao

`RBAC_COLLECTIONS` hien gom:

- Tai chinh:
  - `gw_payment_vouchers`
  - `gw_cash_funds`
  - `gw_company_bank_accounts`
  - `gw_accounting_accounts`
- Nhan su:
  - `gw_employees`
  - `gw_departments`
  - `gw_positions`
- Doi tac:
  - `gw_partners`
  - `gw_partner_contacts`
  - `gw_partner_bank_accounts`
- He thong:
  - `directus_users`

`CRUD_ACTIONS` gom:

- `create`
- `read`
- `update`
- `delete`

## Nhung viec da lam nhung da go

- Da tung co page UI quan ly role.
- Da tung co drawer tao/sua role.
- Da tung co permission matrix checkbox theo collection/action.
- Da tung co delete confirm va toast success/error.
- Nhung UI nay da bi go do layout trong right panel bi lech/cat noi dung.

## Viec can lam neu build lai UI

- Nen dung dung layout pattern cua `TienMat.tsx`:
  - Header trong page content, khong fixed/absolute.
  - Noi dung nam trong `Panel`.
  - Bang/list nam trong container co `overflow-x-auto`, `min-w-0`.
  - Khong dung width/fixed positioning ben ngoai content wrapper cua `App.tsx`.
- Nen tao UI moi bang component rieng, test ngay trong browser voi viewport desktop/mobile.
- Sau khi co UI moi, co the tai su dung truc tiep:
  - `useRoles`
  - `usePermissionsEditor`
  - `rbacApi`
  - `rbac.ts`
