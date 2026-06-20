# Task 06 — Login as User: API Types & Helper

## Dependency

Không có dependency. Task này độc lập.

## Scope

File duy nhất cần sửa: `src/modules/auth/api/auth.ts`

Không tạo file mới. Không sửa file khác.

---

## 1. Thêm impersonation types

Thêm ngay **trước** block `// ── Auth profile ───` (trước interface `AuthProfileResponse`):

```ts
// ── Impersonation types ────────────────────────────────────────────────────

export interface ImpersonationActor {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
}

export type ImpersonationMetadata =
  | { active: false }
  | { active: true; actor: ImpersonationActor };
```

---

## 2. Mở rộng `AuthProfileResponse`

```ts
// BEFORE:
export interface AuthProfileResponse {
  profile: UserProfile;
  employee: Employee | null;
  rolePermissions: CollectionPermission[];
  customPermissions: CollectionPermission[];
  effectivePermissions: EffectiveCollectionPermission[];
}

// AFTER — thêm field impersonation:
export interface AuthProfileResponse {
  profile: UserProfile;
  employee: Employee | null;
  rolePermissions: CollectionPermission[];
  customPermissions: CollectionPermission[];
  effectivePermissions: EffectiveCollectionPermission[];
  impersonation: ImpersonationMetadata;
}
```

---

## 3. Thêm request/response types cho impersonate endpoint

Thêm sau block `RefreshResponse` (tìm `expires: number; // seconds` cuối block đó):

```ts
export interface ImpersonateRequest {
  target_user_id: string;
}

export interface ImpersonateResponse {
  impersonation_token: string;
  expires: number; // seconds
}
```

---

## 4. Thêm `impersonateApi`

Thêm sau hàm `refreshTokenApi`:

```ts
export async function impersonateApi(
  payload: ImpersonateRequest,
): Promise<ImpersonateResponse> {
  const { data } = await axiosInstance.post<ImpersonateResponse>(
    "/api/v1/auth/impersonate",
    payload,
  );
  return data;
}
```

---

## 5. Thêm helper `hasFullDirectusRolesAccess`

Thêm sau hàm `selfUpdateProfileApi` (cuối file):

```ts
// ── Permission helpers ─────────────────────────────────────────────────────

/**
 * Returns true only when the effective permissions of the current session
 * include full CRUD on the `directus_roles` collection.
 * Used to gate the "Login as user" impersonation feature.
 */
export function hasFullDirectusRolesAccess(
  permissions: EffectiveCollectionPermission[],
): boolean {
  const entry = permissions.find((p) => p.collection === "directus_roles");
  if (!entry) return false;
  return ["read", "create", "update", "delete"].every((a) =>
    entry.actions.includes(a),
  );
}
```

---

## Acceptance Criteria

- [ ] `tsc --noEmit` không lỗi.
- [ ] `ImpersonationActor` và `ImpersonationMetadata` được export.
- [ ] `AuthProfileResponse.impersonation` có type `ImpersonationMetadata`.
- [ ] `impersonateApi` được export và gọi `POST /api/v1/auth/impersonate`.
- [ ] `hasFullDirectusRolesAccess([])` trả về `false`.
- [ ] `hasFullDirectusRolesAccess` với entry `directus_roles` có đủ 4 actions trả về `true`.
- [ ] `hasFullDirectusRolesAccess` với entry `directus_roles` thiếu 1 action bất kỳ trả về `false`.
