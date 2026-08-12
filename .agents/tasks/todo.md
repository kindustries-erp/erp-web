# Frontend Todo

## Backlog auth/navigation đang mở

- Lay role va permission cua user de an/hien tab, page, action dung theo session hien tai.
- Login in as user.

## Da hoan tat

- Fix 403, 404 khong doi path va khong hien thanh tab rieng o bottom tab bar.
- Fix thu tu drawer khi mo chong len nhau.
- 401 thi logout hoac quay ve session hop le, khong de UI o trang thai mo ho.

## Plan tiep theo: frontend cho impersonation

### Muc tieu

Cho phep user hien tai chi khi du quyen tren `system_roles` goi `POST /api/v1/auth/impersonate`, nhan `impersonation_token`, chuyen session frontend sang user dich, cap nhat lai profile + permissions + navigation, va cho phep quay lai tai khoan goc mot cach ro rang.

### Nen tang hien tai da san sang

- `src/modules/auth/domain/authStore.ts` da quan ly `accessToken`, `refreshToken`, `profile`, `employee`, `effectivePermissions`.
- `src/modules/auth/api/auth.ts` da co `getProfileApi()` cho `GET /api/v1/auth/profile`.
- `src/core/api/axiosInstance.ts` da co interceptor xu ly 401, 403 va refresh token.
- `src/pages/NhanSu.tsx` da co `user_id`, phu hop de them action impersonate o danh sach nhan vien.
- `src/modules/auth/components/UserProfileModal.tsx` va layout shell la cac diem dat banner/trang thai session phu hop.

### Quyet dinh ky thuat can khoa truoc khi code

1. `impersonation_token` khong di kem refresh token rieng.
2. Khi dang impersonate ma access token het han, frontend khong duoc silently refresh roi doi session ve user goc ma khong thong bao.
3. Cach xu ly de xuat: neu dang impersonate va gap 401, clear trang thai impersonation, dung `refresh_token` goc de quay ve actor session, hydrate lai profile, va hien toast thong bao phien impersonation da ket thuc.
4. Backend da bo sung metadata impersonation trong `GET /auth/profile`, vi vay bootstrap/reload co the dua truc tiep vao response nay thay vi doan session bang local state.
5. Quyen su dung feature nay khong check theo label role nhu `super admin`, ma check theo user profile hien tai: session nao co full quyen tren collection `system_roles` moi duoc thay UI va goi API impersonate.

### Phase 1: chot contract o API layer

- Them `ImpersonateRequest` va `ImpersonateResponse` vao `src/modules/auth/api/auth.ts`.
- Them `impersonateApi(payload)` goi `POST /api/v1/auth/impersonate`.
- Dong bo type response cho `GET /api/v1/auth/profile` de co them field `impersonation`:
  - `active: boolean`
  - `actor?: { id: string; email: string; first_name?: string; last_name?: string }`
- Bo sung helper check quyen tu `effectivePermissions` cua profile hien tai, vi du `canImpersonateUser(profile)` hoac `hasFullSystemRolesAccess(effectivePermissions)`.
- Xac dinh shape response toi thieu can dung o frontend cho `POST /api/v1/auth/impersonate`:
  - `impersonation_token`
  - sau khi doi token, frontend goi lai `getProfileApi()` de lay profile, permissions va `impersonation` metadata cua session moi.

### Phase 2: mo rong auth store cho session switching

- Bo sung `impersonation` state vao `src/modules/auth/domain/authStore.ts`.
- State de xuat:
  - `active: boolean`
  - `actorProfile`
  - `actorEmployee`
  - `actorPermissions`
  - `targetUserId`
  - `startedAt`
- Khi bootstrap app, uu tien hydrate trang thai impersonation tu `profile.impersonation` tra ve tu backend.
- Khi bootstrap app, tinh luon flag `canImpersonate` tu `effectivePermissions` cua session hien tai.
- Them action:
  - `impersonateAction(targetUserId: string)`
  - `stopImpersonationAction(reason?: "manual" | "expired" | "unauthorized")`
  - `refreshProfileAction()` de dung chung sau login, impersonate, stop impersonate.
- Khi impersonate thanh cong:
  - snapshot session goc vao store
  - thay `accessToken` bang `impersonation_token`
  - giu nguyen `refreshToken` goc
  - goi `getProfileApi()` bang token moi
  - replace `profile`, `employee`, `effectivePermissions` theo user dich.

### Phase 3: cap nhat interceptor va token lifecycle

- Sua `src/core/api/axiosInstance.ts` de doc persisted impersonation state.
- Neu request 401 khi `impersonation.active === true`:
  - khong logout ngay
  - dung refresh flow de quay lai actor session
  - clear metadata impersonation
  - dong bo lai Zustand state
  - thong bao bang toast: phien "login as user" da ket thuc.
- Neu stop impersonation chu dong tu UI:
  - khong can goi API rieng
  - dung `refresh_token` goc hoac actor snapshot de quay lai session goc
  - sau do hydrate lai `GET /auth/profile`.

### Phase 4: UI entry point va session indicator

- Entry point it ton cong nhat: them action `Login as user` o danh sach `src/pages/NhanSu.tsx` vi da co `user_id`.
- Action nay chi hien khi user profile hien tai co full quyen tren `system_roles`.
- Co the them them o man phan quyen sau, nhung khong nen mo rong scope dot dau.
- Them `ConfirmModal` truoc khi impersonate, hien ro ten nhan vien va canh bao session hien tai se bi thay the tam thoi.
- Them banner/chip o shell hoac `UserProfileModal`:
  - Dang impersonate: `<target user>`
  - Nut `Quay lai tai khoan goc`
  - Co the hien them actor name de tranh nham context.

### Phase 5: permission-driven UI refresh sau khi doi session

- Sau khi impersonate hoac stop impersonation, refresh toan bo visible navigation dua tren `effectivePermissions` moi.
- Neu session moi khong con full quyen `system_roles`, action `Login as user` phai bien mat ngay sau khi switch user.
- Ra soat cac cho dang dung `forbidden` va cac page guard de dam bao:
  - tab/page khong con quyen thi dong hoac redirect ve `dashboard`
  - khong de tab cu mo nhung noi dung da doi user
  - 403 van render in-place, khong tao tab loi rieng.
- Tach helper chung `canAccessPage(pageKey, effectivePermissions)` neu chua co, de Sidebar, App page switching va row actions dung cung mot nguon logic.

### Phase 6: test case can cover

- Login bang user co full quyen `system_roles` -> impersonate mot user thuong -> profile, employee, permissions, tab menu doi dung.
- Goi API sau khi impersonate phai dung `impersonation_token`.
- Bam `Quay lai tai khoan goc` -> session quay ve actor, permission va menu duoc hydrate lai.
- Access token impersonation het han -> frontend quay ve actor session co thong bao, khong logout mo ho.
- Logout trong luc impersonate -> clear ca actor snapshot lan impersonation metadata.
- Reload trang trong luc impersonate -> `GET /auth/profile` phai restore dung banner, actor info va permission state.
- Login bang user khong co full quyen `system_roles` -> khong thay action `Login as user` va frontend khong duoc expose flow nay.

### Thu tu implement de xuat

1. `src/modules/auth/api/auth.ts`
2. `src/modules/auth/domain/authStore.ts`
3. `src/core/api/axiosInstance.ts`
4. Helper permission/page gate o app shell
5. Action o `src/pages/NhanSu.tsx`
6. Banner + nut revert o `src/modules/auth/components/UserProfileModal.tsx` hoac layout shell

### Contract backend da co

- `GET /api/v1/auth/profile` gio tra ve `impersonation` o moi session.
- Frontend se check quyen su dung impersonation dua tren `effectivePermissions` cua profile hien tai, cu the la full access tren collection `system_roles`.
- Session binh thuong:
  - `impersonation: { active: false }`
- Session impersonate:
  - `impersonation.active: true`
  - `impersonation.actor.id`
  - `impersonation.actor.email`
  - `impersonation.actor.first_name`
  - `impersonation.actor.last_name`
- Frontend co the dung truc tiep field nay khi bootstrap, reload va render UI `Quay lai tai khoan goc`.
