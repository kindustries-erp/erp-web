import { create } from "zustand";
import { persist } from "zustand/middleware";
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
} from "@/modules/auth/api/auth";
import { useAppStore } from "@/core/config/appStore";

// ── Types ──────────────────────────────────────────────────────────────────

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

// ── Store ──────────────────────────────────────────────────────────────────

export const useAuthStore = create<AuthState>()(
  persist(
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

      loginAction: async (email, password) => {
        set({ loading: true, error: null });
        try {
          const data = await loginApi({ email, password });
          set({
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            expiresAt: Date.now() + data.expires * 1000,
            employee: data.employee,
          });
          const profileData = await getProfileApi();
          set({
            profile: profileData.profile,
            employee: profileData.employee ?? data.employee,
            effectivePermissions: profileData.effectivePermissions,
            canImpersonate: hasFullDirectusRolesAccess(profileData.effectivePermissions),
            impersonation: profileData.impersonation ?? { active: false },
            actorAccessToken: null,
            actorRefreshToken: null,
            actorExpiresAt: null,
            loading: false,
            error: null,
          });
          // Sync UI state
          useAppStore.getState().login();
        } catch (err: unknown) {
          const message =
            (err as { response?: { data?: { message?: string } } })?.response
              ?.data?.message ?? "Đăng nhập thất bại";
          set({ loading: false, error: message });
          throw err;
        }
      },

      logoutAction: async () => {
        const { refreshToken } = useAuthStore.getState();
        set({ loading: true, error: null });
        try {
          if (refreshToken) {
            await logoutApi({ refresh_token: refreshToken });
          }
        } catch {
          // Proceed with local logout even if API call fails
        } finally {
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
          // Sync UI state
          useAppStore.getState().logout();
        }
      },

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

      updateProfileAction: async (payload: SelfUpdateProfileRequest) => {
        const { employee } = useAuthStore.getState();
        if (!employee) return;
        set({ loading: true, error: null });
        try {
          const updated = await selfUpdateProfileApi(payload);
          set({
            employee: { ...employee, ...updated },
            loading: false,
          });
        } catch (err: unknown) {
          const message =
            (err as { response?: { data?: { message?: string } } })?.response
              ?.data?.message ?? "Cập nhật thất bại";
          set({ loading: false, error: message });
          throw err;
        }
      },

      changePasswordAction: async (newPassword: string) => {
        set({ loading: true, error: null });
        try {
          await changePasswordApi({ new_password: newPassword });
          set({ loading: false });
        } catch (err: unknown) {
          const message =
            (err as { response?: { data?: { message?: string } } })?.response
              ?.data?.message ?? "Đổi mật khẩu thất bại";
          set({ loading: false, error: message });
          throw err;
        }
      },

      bootstrapAction: async () => {
        const { accessToken } = useAuthStore.getState();
        if (!accessToken) return;
        try {
          const data = await getProfileApi();
          const canImp = hasFullDirectusRolesAccess(data.effectivePermissions);
          set({
            profile: data.profile,
            employee: data.employee,
            effectivePermissions: data.effectivePermissions,
            canImpersonate: canImp,
            impersonation: data.impersonation ?? { active: false },
          });
        } catch (e) {
          void e;
          // Silently ignore — stale cached data is still usable;
          // the axios interceptor will handle 401 and clear auth if needed.
        }
      },

      impersonateAction: async (targetUserId: string) => {
        const state = useAuthStore.getState();
        set({ loading: true, error: null });
        try {
          const res = await impersonateApi({ target_user_id: targetUserId });

          set({
            actorAccessToken: state.accessToken,
            actorRefreshToken: state.refreshToken,
            actorExpiresAt: state.expiresAt,
          });

          set({
            accessToken: res.impersonation_token,
            refreshToken: null,
            expiresAt: Date.now() + res.expires * 1000,
          });

          const profileData = await getProfileApi();
          set({
            profile: profileData.profile,
            employee: profileData.employee,
            effectivePermissions: profileData.effectivePermissions,
            canImpersonate: hasFullDirectusRolesAccess(profileData.effectivePermissions),
            impersonation: profileData.impersonation ?? {
              active: true,
              actor: { id: "", email: "" },
            },
            loading: false,
          });
        } catch (err: unknown) {
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
          useAuthStore.getState().clearAuth();
          return;
        }

        set({
          accessToken: actorAccessToken,
          refreshToken: actorRefreshToken,
          expiresAt: actorExpiresAt,
          actorAccessToken: null,
          actorRefreshToken: null,
          actorExpiresAt: null,
          impersonation: null,
        });

        try {
          const profileData = await getProfileApi();
          set({
            profile: profileData.profile,
            employee: profileData.employee,
            effectivePermissions: profileData.effectivePermissions,
            canImpersonate: hasFullDirectusRolesAccess(profileData.effectivePermissions),
            impersonation: profileData.impersonation ?? { active: false },
          });
        } catch {
          // Nếu profile load thất bại, vẫn giữ actor session
        }

        void reason;
      },
    }),
    {
      name: "erp-auth",
      partialize: (s) => ({
        accessToken: s.accessToken,
        refreshToken: s.refreshToken,
        expiresAt: s.expiresAt,
        employee: s.employee,
        profile: s.profile,
        effectivePermissions: s.effectivePermissions,
        actorAccessToken: s.actorAccessToken,
        actorRefreshToken: s.actorRefreshToken,
        actorExpiresAt: s.actorExpiresAt,
        impersonation: s.impersonation,
      }),
    },
  ),
);
