# User Info Loading Flow

## Overview

Tài liệu mô tả cách hệ thống ERP tải thông tin user (profile, role, permission) trong các tình huống khác nhau.

---

## 1. Login Flow

### Endpoint

**POST** `/api/v1/auth/login`

### Request

```json
{
  "email": "user@example.com",
  "password": "password"
}
```

### Response

```json
{
  "message": "Login successful",
  "employee": {
    "id": "uuid",
    "employee_code": "EMP-001",
    "full_name": "Nguyễn Văn A",
    "email": "a@example.com",
    "phone": "0987654321",
    "department_id": { "id": "dept-uuid", "department_name": "IT", ... },
    "position_id": { "id": "pos-uuid", "position_name": "Manager", ... },
    "employment_status": "active",
    "directus_user_id": {
      "role": {
        "id": "role-uuid",
        "name": "Approver",
        "users": ["directus-user-id-1", "directus-user-id-2"]
      }
    }
  },
  "access_token": "jwt-token",
  "refresh_token": "refresh-token",
  "expires": 3600
}
```

### Code Path

1. [src/pages/Login.tsx](../src/pages/Login.tsx) → `loginAction(email, password)`
2. [src/modules/auth/domain/authStore.ts](../src/modules/auth/domain/authStore.ts) → `loginAction` handler
3. [src/modules/auth/api/auth.ts](../src/modules/auth/api/auth.ts) → `loginApi()`
4. Response stored in Zustand:
   - `accessToken` → localStorage & store
   - `refreshToken` → localStorage & store
   - `expiresAt` → calculated as `Date.now() + expires * 1000`
   - `employee` → localStorage & store

### Storage

- **Memory**: Zustand store `useAuthStore`
- **Persistent**: localStorage key `"erp-auth"` (Zustand persist middleware)

```typescript
// authStore persist config
{
  name: "erp-auth",
  partialize: (s) => ({
    accessToken: s.accessToken,
    refreshToken: s.refreshToken,
    expiresAt: s.expiresAt,
    employee: s.employee,
  })
}
```

---

## 2. Page Reload Flow

### Timeline

```
[User reload page (F5/Cmd+R)]
        ↓
        Zustand persist middleware restores from localStorage
        ↓
        [UI renders immediately with cached data]
        ↓
        App.tsx mounts → useEffect triggers bootstrapAction()
        ↓
        ├─ Check 1: Does accessToken exist?
        │  └─ No → Return early (silent)
        │  └─ Yes → Continue
        │
        ├─ Check 2: Does employee.id exist?
        │  └─ No → Return early (silent)
        │  └─ Yes → Continue
        │
        ├─ Check 3: Has token expired?
        │  └─ Yes → Axios interceptor calls POST /api/v1/auth/refresh
        │  │        (refresh token automatically)
        │  │
        │  └─ No → Proceed with current token
        │
        ├─ GET /api/v1/employees/{employee.id}
        │  ├─ Returns fresh Employee object
        │  └─ Preserves nested objects (department_id, position_id)
        │
        └─ set({ employee: fresh })
           └─ [UI re-renders with updated data]
```

### Code Path

1. [src/App.tsx](../src/App.tsx#L33) → `useEffect` with no dependencies
2. Calls `bootstrapAction()` from [src/modules/auth/domain/authStore.ts](../src/modules/auth/domain/authStore.ts#L149)
3. [src/modules/auth/api/auth.ts](../src/modules/auth/api/auth.ts) → `getEmployeeApi(employee.id)`
4. Stores result back to `useAuthStore`

### Bootstrap Logic

```typescript
bootstrapAction: async () => {
  const { accessToken, employee } = useAuthStore.getState();
  if (!accessToken || !employee?.id) return;
  try {
    const fresh = await getEmployeeApi(employee.id);
    set({
      employee: {
        ...fresh,
        // Preserve original nested objects to prevent UI crashes
        department_id:
          fresh.department_id && typeof fresh.department_id === "object"
            ? fresh.department_id
            : employee.department_id,
        position_id:
          fresh.position_id && typeof fresh.position_id === "object"
            ? fresh.position_id
            : employee.position_id,
      },
    });
  } catch {
    // Silently ignore — stale data is still usable
    // axios interceptor will handle 401 and clear auth if needed
  }
};
```

---

## 3. Token Refresh Flow

### When triggered

- Access token expired (`expiresAt < Date.now()`)
- Any API call returns 401 Unauthorized

### Endpoint

**POST** `/api/v1/auth/refresh`

### Request

```json
{
  "refresh_token": "refresh-token"
}
```

### Response

```json
{
  "access_token": "new-jwt-token",
  "refresh_token": "new-refresh-token",
  "expires": 3600
}
```

### Code Path

[src/core/api/axiosInstance.ts](../src/core/api/axiosInstance.ts) → Response interceptor (lines 77-147)

### Behavior

1. Intercepts 401 response
2. If refresh already in-flight → queue request
3. POST refresh token
4. Update localStorage + Zustand store
5. Retry original request with new token
6. Return result to caller

---

## 4. User Profile Fetch (Manual)

### Endpoint

**GET** `/api/v1/employees/{employeeId}`

### Response

```json
{
  "message": "Success",
  "data": {
    "id": "uuid",
    "employee_code": "EMP-001",
    "full_name": "Name",
    ...
    "department_id": { nested object },
    "position_id": { nested object },
    "directus_user_id": { nested object with role info }
  }
}
```

### Code Path

[src/modules/auth/api/auth.ts](../src/modules/auth/api/auth.ts) → `getEmployeeApi(id)`

### When called

- Bootstrap (on app mount/reload)
- Profile update form submit
- Manual refresh in middleware

---

## 5. User Roles

### Current approach

Roles are extracted from `employee.directus_user_id.role` during login/bootstrap.

No dedicated API call to fetch user roles separately; using nested data from Employee object.

### Related APIs (not currently used)

- **GET** `/api/v1/rbac/users/{directusUserId}/roles` — Returns role IDs for a Directus user
- **PATCH** `/api/v1/rbac/users/{directusUserId}/roles` — Update user's roles

Code prepared but not invoked:

- [src/modules/system/api/rbacApi.ts](../src/modules/system/api/rbacApi.ts#L93) → `getUserRolesApi()`
- [src/modules/system/api/rbacApi.ts](../src/modules/system/api/rbacApi.ts#L109) → `updateUserRolesApi()`

---

## 6. User Permissions

### Role-based permissions

**Endpoint**: **GET** `/api/v1/rbac/roles/{roleId}/permissions`

**Response**: Array of `Permission[]`

```json
[
  {
    "id": "perm-uuid",
    "collection": "gw_payment_vouchers",
    "action": "create",
    "access": true,
    "fields": ["*"]
  },
  ...
]
```

**When loaded**: Only when user opens role editor in [src/pages/PhanQuyen.tsx](../src/pages/PhanQuyen.tsx)

**Hook**: [src/modules/system/hooks/usePermissionsEditor.ts](../src/modules/system/hooks/usePermissionsEditor.ts#L56)

### Employee custom permissions

**Endpoint**: **GET** `/api/v1/employees/{employeeId}/permissions`

**Response**: Array of `Permission[]` (same shape as role permissions)

**When loaded**: Only when user opens permission matrix for an employee in [src/pages/NhanSu.tsx](../src/pages/NhanSu.tsx)

**Hook**: Same `usePermissionsEditor`, but with custom API:

```typescript
const policyEditor = usePermissionsEditor({
  getApi: (id) => getEmployeePermissionsApi(id),
  saveApi: (id, dto) => saveEmployeePermissionsApi(id, dto),
});
```

---

## 7. User Display Name Mapping

### Purpose

Convert user IDs (directus_user_id) to display names (full_name or email) for UI rendering.

### Data source

**GET** `/api/v1/employees?pageSize=500`

Returns list of all employees with their `directus_user_id` relations.

### Mapping functions

- [src/modules/system/api/activityLogApi.ts](../src/modules/system/api/activityLogApi.ts#L46) → `getUsersMapApi()`
  - Used in [src/pages/ActivityLog.tsx](../src/pages/ActivityLog.tsx#L162)
  - Maps user ID → display name for activity log

- [src/modules/system/api/rbacApi.ts](../src/modules/system/api/rbacApi.ts#L74) → `getUserEmailsMapApi()`
  - Used in [src/modules/system/hooks/useRoles.ts](../src/modules/system/hooks/useRoles.ts#L32)
  - Maps user ID → email or display name for role management

### Response shape handling

```typescript
// Handles multiple response formats
const payload = data.items ?? data.data ?? data;
const list = Array.isArray(payload)
  ? payload
  : ((payload.items ?? payload.data ?? []) as UserItem[]);

// Extracts directus_user_id from relation object
const directusKeys =
  typeof u.directus_user_id === "string"
    ? [u.directus_user_id]
    : Array.isArray(u.directus_user_id?.users)
      ? u.directus_user_id.users
      : Array.isArray(u.directus_user_id?.role?.users)
        ? u.directus_user_id.role.users
        : [];

// Builds map with fallback
for (const key of [...directusKeys, u.id].filter(Boolean)) {
  map[key] = displayName;
}
```

---

## API Endpoints Summary

| Endpoint                              | Method | Purpose                           | When Called                     |
| ------------------------------------- | ------ | --------------------------------- | ------------------------------- |
| `/api/v1/auth/login`                  | POST   | Login user                        | Manual (Login page)             |
| `/api/v1/auth/refresh`                | POST   | Refresh token                     | Auto (interceptor on 401)       |
| `/api/v1/auth/logout`                 | POST   | Logout user                       | Manual (Sidebar logout)         |
| `/api/v1/employees/{id}`              | GET    | Fetch employee profile            | Bootstrap, manual refresh       |
| `/api/v1/employees`                   | GET    | List all employees                | User display name mapping       |
| `/api/v1/rbac/roles/{id}/permissions` | GET    | Fetch role permissions            | Manual (open role editor)       |
| `/api/v1/employees/{id}/permissions`  | GET    | Fetch employee custom permissions | Manual (open permission matrix) |
| `/api/v1/rbac/roles/{id}/permissions` | PATCH  | Save role permissions             | Manual (save role)              |
| `/api/v1/employees/{id}/permissions`  | PATCH  | Save employee custom permissions  | Manual (save policy)            |
| `/api/v1/rbac/users/{id}/roles`       | GET    | Fetch user roles                  | Not implemented                 |
| `/api/v1/rbac/users/{id}/roles`       | PATCH  | Update user roles                 | Not implemented                 |

---

## Storage & State Management

### Zustand Store: `useAuthStore`

**File**: [src/modules/auth/domain/authStore.ts](../src/modules/auth/domain/authStore.ts)

**State**:

```typescript
interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null; // Timestamp in milliseconds
  employee: Employee | null;
  loading: boolean;
  error: string | null;
}
```

**Persistence**:

- Middleware: `persist()` (Zustand)
- Key: `"erp-auth"` in localStorage
- Fields: `accessToken`, `refreshToken`, `expiresAt`, `employee`

**Actions**:

- `loginAction(email, password)` — Login & store tokens + employee
- `logoutAction()` — Logout & clear all
- `clearAuth()` — Clear auth state without API call
- `updateProfileAction(payload)` — Update employee profile
- `changePasswordAction(newPassword)` — Change password
- `bootstrapAction()` — Refresh employee data on app mount

---

## Error Handling

### 401 Unauthorized

1. **First attempt**: Try to refresh token using refresh endpoint
2. **If refresh succeeds**: Retry original request with new token
3. **If refresh fails or no refresh token**: Clear auth & redirect to login

### Other errors

- Bootstrap errors are silently ignored (stale data is usable)
- API call errors are caught and displayed in UI toasts
- Axios interceptor handles queue management for concurrent requests

### Logout on error

- When refresh token is missing → force logout
- When refresh fails → force logout
- When 401 occurs during bootstrap → silently ignore (let interceptor handle)

---

## Security Considerations

1. **Token storage**: localStorage (accessible to XSS; consider HttpOnly cookies for production)
2. **Token refresh**: Automatically retried on 401 (prevents session hijacking)
3. **Employee data**: Refreshed on app boot to catch permission/role changes
4. **Relation fields**: Validated to be objects, not serialized strings (prevent injection)

---

## Future improvements

- [ ] Implement `getUserRolesApi()` to fetch user roles explicitly
- [ ] Cache permission data (currently refetched every time)
- [ ] Add permission check hooks for UI (CanAccess, RequireRole)
- [ ] Implement role/permission change detection on app boot
- [ ] Add HttpOnly cookie support for token storage
- [ ] Add audit logging for auth events
