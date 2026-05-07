# Task 07 — Login as User: Auth Store Extension

## Dependency

**Task 06 phải hoàn thành trước** — task này dùng `ImpersonationMetadata`, `ImpersonationActor`, `impersonateApi`, `hasFullDirectusRolesAccess` từ `src/modules/auth/api/auth.ts`.

## Scope

File duy nhất cần sửa: `src/modules/auth/domain/authStore.ts`

Không tạo file mới. Không sửa file khác.

---

## 1. Cập nhật imports

```ts
// BEFORE:
import {
  loginApi,
  logoutApi,
  selfUpdateProfileApi,
  changePasswordApi,
  getProfileApi,
} from "@/modules/auth/api/auth";
import type {
  Employee,
  SelfUpdateProfileRequest,
  UserProfile,
  EffectiveCollectionPermission,
} from "@/modules/auth/api/auth";

// AFTER:
import {
  loginApi,
  logoutApi,
  selfUpdateProfileApi,
  changePasswordApi,
  getProfileApi,
  impersonateApi,
  hasFullDirectusRolesAccess,
} from "@/modules/auth/api/auth";
import type {
  Employee,
  SelfUpdateProfileRequest,
  UserProfile,
  EffectiveCollectionPermission,
  ImpersonationMetadata,
  ImpersonationActor,
} from "@/modules/auth/api/auth";
```

---

## 2. Mở rộng `AuthState` interface

```ts
// BEFORE:
interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  /** Timestamp (ms) when the access token expires */
  expiresAt: number | null;
  employee: Employee | null;
  profile: UserProfile | null;
  effectivePermissions: EffectiveCollectionPermission[];
  loading: boolean;
  error: string | null;

  loginAction: (email: string, password: string) => Promise<void>;
  logoutAction: () => Promise<void>;
  clearAuth: () => void;
  updateProfileAction: (payload: SelfUpdateProfileRequest) => Promise<void>;
  changePasswordAction: (newPassword: string) => Promise<void>;
  bootstrapAction: () => Promise<void>;
}

// AFTER — thêm impersonation fields và actions:
interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  /** Timestamp (ms) when the access token expires */
  expiresAt: number | null;
  employee: Employee | null;
  profile: UserProfile | null;
  effectivePermissions: EffectiveCollectionPermission[];
  loading: boolean;
  error: string | null;

  /** True khi session hiện tại có full CRUD trên directus_roles */
  canImpersonate: boolean;
  /** Metadata trả về từ GET /auth/profile — active=true khi đang impersonate */
  impersonation: ImpersonationMetadata | null;
  /**
   * Actor snapshot — lưu thông tin session gốc để có thể restore sau khi
   * kết thúc impersonation. Persisted để F5 không mất.
   */
  actorAccessToken: string | null;
  actorRefreshToken: string | null;
  actorExpiresAt: number | null;

  loginAction: (email: string, password: string) => Promise<void>;
  logoutAction: () => Promise<void>;
  clearAuth: () => void;
  updateProfileAction: (payload: SelfUpdateProfileRequest) => Promise<void>;
  changePasswordAction: (newPassword: string) => Promise<void>;
  bootstrapAction: () => Promise<void>;
  /** Bắt đầu impersonation session với target user */
  impersonateAction: (targetUserId: string) => Promise<void>;
  /**
   * Kết thúc impersonation, restore lại actor session.
   * reason = "expired" khi token hết hạn (do axios interceptor gọi).
   * reason = "manual" khi user tự bấm "Quay lại tài khoản gốc".
   */
  stopImpersonationAction: (
    reason?: "manual" | "expired" | "unauthorized",
  ) => Promise<void>;
}

// NOTE: ImpersonationActor được import nhưng chỉ dùng gián tiếp qua
// ImpersonationMetadata. Thêm suppress nếu linter báo unused:
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type _ImpersonationActorRef = ImpersonationActor;
```

> Nếu TypeScript báo `ImpersonationActor` unused, xóa dòng `_ImpersonationActorRef` và xóa `ImpersonationActor` khỏi import type.

---

## 3. Khởi tạo initial state cho các field mới

```ts
// BEFORE:
    (set) => ({
      accessToken: null,
      refreshToken: null,
      expiresAt: null,
      employee: null,
      profile: null,
      effectivePermissions: [],
      loading: false,
      error: null,

// AFTER:
    (set) => ({
      accessToken: null,
      refreshToken: null,
      expiresAt: null,
      employee: null,
      profile: null,
      effectivePermissions: [],
      loading: false,
      error: null,
      canImpersonate: false,
      impersonation: null,
      actorAccessToken: null,
      actorRefreshToken: null,
      actorExpiresAt: null,

```

---

## 4. Cập nhật `loginAction` — thêm canImpersonate + xóa impersonation state

```ts
// BEFORE (trong loginAction, block set sau khi getProfileApi()):
set({
  profile: profileData.profile,
  employee: profileData.employee ?? data.employee,
  effectivePermissions: profileData.effectivePermissions,
  loading: false,
  error: null,
});

// AFTER:
set({
  profile: profileData.profile,
  employee: profileData.employee ?? data.employee,
  effectivePermissions: profileData.effectivePermissions,
  canImpersonate: hasFullDirectusRolesAccess(profileData.effectivePermissions),
  impersonation: profileData.impersonation ?? { active: false },
  // Clear any stale impersonation snapshot from previous session
  actorAccessToken: null,
  actorRefreshToken: null,
  actorExpiresAt: null,
  loading: false,
  error: null,
});
```

---

## 5. Cập nhật `logoutAction` — xóa impersonation state

```ts
// BEFORE (trong logoutAction, block set trong finally):
set({
  accessToken: null,
  refreshToken: null,
  expiresAt: null,
  employee: null,
  profile: null,
  effectivePermissions: [],
  loading: false,
  error: null,
});

// AFTER:
set({
  accessToken: null,
  refreshToken: null,
  expiresAt: null,
  employee: null,
  profile: null,
  effectivePermissions: [],
  loading: false,
  error: null,
  canImpersonate: false,
  impersonation: null,
  actorAccessToken: null,
  actorRefreshToken: null,
  actorExpiresAt: null,
});
```

---

## 6. Cập nhật `clearAuth` — xóa impersonation state

```ts
// BEFORE:
      clearAuth: () => {
        set({
          accessToken: null,
          refreshToken: null,
          expiresAt: null,
          employee: null,
          profile: null,
          effectivePermissions: [],
          loading: false,
          error: null,
        });
        useAppStore.getState().logout();
      },

// AFTER:
      clearAuth: () => {
        set({
          accessToken: null,
          refreshToken: null,
          expiresAt: null,
          employee: null,
          profile: null,
          effectivePermissions: [],
          loading: false,
          error: null,
          canImpersonate: false,
          impersonation: null,
          actorAccessToken: null,
          actorRefreshToken: null,
          actorExpiresAt: null,
        });
        useAppStore.getState().logout();
      },
```

---

## 7. Cập nhật `bootstrapAction` — hydrate impersonation state

```ts
// BEFORE:
      bootstrapAction: async () => {
        const { accessToken } = useAuthStore.getState();
        if (!accessToken) return;
        try {
          const data = await getProfileApi();
          set({
            profile: data.profile,
            employee: data.employee,
            effectivePermissions: data.effectivePermissions,
          });
        } catch {
          // Silently ignore — stale cached data is still usable;
          // the axios interceptor will handle 401 and clear auth if needed.
        }
      },

// AFTER:
      bootstrapAction: async () => {
        const { accessToken } = useAuthStore.getState();
        if (!accessToken) return;
        try {
          const data = await getProfileApi();
          set({
            profile: data.profile,
            employee: data.employee,
            effectivePermissions: data.effectivePermissions,
            canImpersonate: hasFullDirectusRolesAccess(
              data.effectivePermissions,
            ),
            impersonation: data.impersonation ?? { active: false },
          });
        } catch {
          // Silently ignore — stale cached data is still usable;
          // the axios interceptor will handle 401 and clear auth if needed.
        }
      },
```

---

## 8. Thêm `impersonateAction` và `stopImpersonationAction`

Thêm **sau** `bootstrapAction` (trước dấu `}` đóng của object `(set) => ({...})`):

```ts
      impersonateAction: async (targetUserId: string) => {
        const state = useAuthStore.getState();
        set({ loading: true, error: null });
        try {
          // 1. Gọi API lấy impersonation token
          const res = await impersonateApi({ target_user_id: targetUserId });

          // 2. Snapshot actor session trước khi swap token
          set({
            actorAccessToken: state.accessToken,
            actorRefreshToken: state.refreshToken,
            actorExpiresAt: state.expiresAt,
          });

          // 3. Swap sang impersonation token
          //    Impersonation token không có refresh_token
          set({
            accessToken: res.impersonation_token,
            refreshToken: null,
            expiresAt: Date.now() + res.expires * 1000,
          });

          // 4. Load profile của user được impersonate
          const profileData = await getProfileApi();
          set({
            profile: profileData.profile,
            employee: profileData.employee,
            effectivePermissions: profileData.effectivePermissions,
            canImpersonate: hasFullDirectusRolesAccess(
              profileData.effectivePermissions,
            ),
            impersonation: profileData.impersonation ?? {
              active: true,
              actor: { id: "", email: "" },
            },
            loading: false,
          });
        } catch (err: unknown) {
          // Rollback: restore original access token nếu lỗi xảy ra trước khi swap
          const { actorAccessToken, actorRefreshToken, actorExpiresAt } =
            useAuthStore.getState();
          if (actorAccessToken) {
            set({
              accessToken: actorAccessToken,
              refreshToken: actorRefreshToken,
              expiresAt: actorExpiresAt,
              actorAccessToken: null,
              actorRefreshToken: null,
              actorExpiresAt: null,
            });
          }
          const message =
            (err as { response?: { data?: { message?: string } } })?.response
              ?.data?.message ?? "Không thể đăng nhập thay người dùng này";
          set({ loading: false, error: message });
          throw err;
        }
      },

      stopImpersonationAction: async (
        reason?: "manual" | "expired" | "unauthorized",
      ) => {
        const {
          actorAccessToken,
          actorRefreshToken,
          actorExpiresAt,
        } = useAuthStore.getState();

        if (!actorAccessToken) {
          // Không có actor snapshot — chỉ có thể clear toàn bộ
          useAuthStore.getState().clearAuth();
          return;
        }

        // 1. Restore actor tokens
        set({
          accessToken: actorAccessToken,
          refreshToken: actorRefreshToken,
          expiresAt: actorExpiresAt,
          actorAccessToken: null,
          actorRefreshToken: null,
          actorExpiresAt: null,
          impersonation: null,
        });

        // 2. Load lại profile của actor (với actor token vừa restore)
        try {
          const profileData = await getProfileApi();
          set({
            profile: profileData.profile,
            employee: profileData.employee,
            effectivePermissions: profileData.effectivePermissions,
            canImpersonate: hasFullDirectusRolesAccess(
              profileData.effectivePermissions,
            ),
            impersonation: profileData.impersonation ?? { active: false },
          });
        } catch {
          // Nếu profile load thất bại, vẫn giữ actor session
          // nhưng có thể profile hơi cũ — chấp nhận được
        }

        // 3. Nếu reason là "expired", caller (task 08) sẽ hiển thị toast
        void reason; // suppress unused warning — toast handled by axios interceptor
      },
```

---

## 9. Cập nhật `partialize` — persist actor snapshot + impersonation

```ts
// BEFORE:
    {
      name: "erp-auth",
      partialize: (s) => ({
        accessToken: s.accessToken,
        refreshToken: s.refreshToken,
        expiresAt: s.expiresAt,
        employee: s.employee,
        profile: s.profile,
        effectivePermissions: s.effectivePermissions,
      }),
    },

// AFTER:
    {
      name: "erp-auth",
      partialize: (s) => ({
        accessToken: s.accessToken,
        refreshToken: s.refreshToken,
        expiresAt: s.expiresAt,
        employee: s.employee,
        profile: s.profile,
        effectivePermissions: s.effectivePermissions,
        // Impersonation snapshot — needed to restore actor session on F5
        actorAccessToken: s.actorAccessToken,
        actorRefreshToken: s.actorRefreshToken,
        actorExpiresAt: s.actorExpiresAt,
        impersonation: s.impersonation,
      }),
    },
```

---

## Acceptance Criteria

- [ ] `tsc --noEmit` không lỗi.
- [ ] `useAuthStore.getState().canImpersonate` là `false` khi `effectivePermissions` là `[]`.
- [ ] Gọi `impersonateAction` snapshot actor tokens vào `actorAccessToken/actorRefreshToken/actorExpiresAt`.
- [ ] Gọi `impersonateAction` set `accessToken = impersonation_token`.
- [ ] Gọi `stopImpersonationAction` restore `accessToken` từ `actorAccessToken`.
- [ ] `clearAuth` và `logoutAction` xóa toàn bộ impersonation fields.
- [ ] `bootstrapAction` set `canImpersonate` và `impersonation` từ profile response.
- [ ] `partialize` include `actorAccessToken`, `actorRefreshToken`, `actorExpiresAt`, `impersonation`.
