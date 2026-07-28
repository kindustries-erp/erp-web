// ─────────────────────────────────────────────────────────────────────────────
// ERP CORE auth store — local JWT, không dùng Directus
// Giữ nguyên tên export để không vỡ component cũ
// ─────────────────────────────────────────────────────────────────────────────
import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  changePasswordApi,
  loginApi,
  getProfileApi,
  impersonateApi,
  logoutApi,
  selfUpdateProfileApi,
  type CoreLoginResponse,
  type CoreProfileResponse,
} from "@/modules/auth/api/auth.core";
import { useAppStore } from "@/core/config/appStore";
import { useUIStore } from "@/core/config/uiStore";

// ── Compat types — giữ đủ shape để component cũ không TS-error ───────────────

export interface EffectiveCollectionPermission {
  collection: string;
  actions: string[];
}

export interface UserProfile {
  id: string;
  email: string;
  status: string;
  role?: {
    id: string;
    name: string;
    icon?: string;
    description?: string | null;
  } | null;
}

// employee-like shape tối thiểu để Sidebar/UserMenu/UserProfileModal không vỡ
export interface Employee {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  notes: string | null;
  employee_code: string;
  status: string;
  employment_status?: string;
  department_id: { department_name: string };
  position_id: { position_name: string };
}

export type ImpersonationMetadata =
  | { active: false }
  | { active: true; actor: { id: string; email: string } };

export interface SelfUpdateProfileRequest {
  email?: string;
  full_name?: string | null;
  phone?: string | null;
  notes?: string | null;
}

// ── Helpers — build Employee stub từ CoreProfileResponse ─────────────────────

function profileToEmployee(p: CoreProfileResponse): Employee {
  const snapshot = p.employee;
  return {
    id: p.id,
    email: snapshot?.email ?? p.email,
    full_name: snapshot?.fullName ?? p.email,
    phone: snapshot?.phone ?? null,
    notes: snapshot?.notes ?? null,
    employee_code: snapshot?.employeeCode ?? "—",
    status: p.status,
    department_id: { department_name: "—" },
    position_id: { position_name: "—" },
  };
}

function mapCorePermissionsToEffective(
  corePermissions?: CoreProfileResponse["permissions"],
): EffectiveCollectionPermission[] {
  if (!corePermissions) return [];

  const map = new Map<string, Set<string>>();
  for (const p of corePermissions) {
    if (!map.has(p.resource)) {
      map.set(p.resource, new Set());
    }
    map.get(p.resource)!.add(p.action);
  }

  const result: EffectiveCollectionPermission[] = [];
  map.forEach((actions, resource) => {
    result.push({
      collection: resource,
      actions: Array.from(actions),
    });
  });
  return result;
}

// ── State interface — compat với consumers cũ ─────────────────────────────────

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null; // compat với axios/store cũ
  expiresAt: number | null;
  employee: Employee | null;
  profile: UserProfile | null;
  effectivePermissions: EffectiveCollectionPermission[]; // luôn [] — no Directus RBAC
  loading: boolean;
  error: string | null;
  canImpersonate: boolean;
  impersonation: ImpersonationMetadata | null;
  actorAccessToken: string | null;
  actorRefreshToken: string | null;
  actorExpiresAt: number | null;
  _raw: CoreLoginResponse | null; // internal — lưu raw response

  loginAction: (email: string, password: string) => Promise<void>;
  logoutAction: () => Promise<void>;
  clearAuth: () => void;
  updateProfileAction: (payload: SelfUpdateProfileRequest) => Promise<void>;
  changePasswordAction: (
    oldPassword: string,
    newPassword: string,
  ) => Promise<void>;
  bootstrapAction: () => Promise<void>;
  stopImpersonationAction: (reason?: string) => Promise<void>;
  impersonateAction: (targetUserId: string) => Promise<void>;
}

// ── Store ─────────────────────────────────────────────────────────────────────

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      expiresAt: null,
      employee: null,
      profile: null,
      effectivePermissions: [],
      loading: false,
      error: null,
      canImpersonate: false as const,
      impersonation: null,
      actorAccessToken: null,
      actorRefreshToken: null,
      actorExpiresAt: null,
      _raw: null,

      loginAction: async (email, password) => {
        set({ loading: true, error: null });
        try {
          const data = await loginApi({ email, password });
          const profile: UserProfile = {
            id: data.user.id,
            email: data.user.email,
            status: data.user.status,
          };
          set({
            accessToken: data.accessToken,
            refreshToken: data.refreshToken ?? null,
            expiresAt: data.expiresIn
              ? Date.now() + data.expiresIn * 1000
              : null,
            _raw: data,
            profile,
            loading: false,
            error: null,
            impersonation: { active: false },
            canImpersonate: profile.email === "admin@liouni.com",
          });
          useUIStore.getState().resetShellState();
          useAppStore.getState().login();
          // Best-effort: load full profile
          try {
            const raw = await getProfileApi();
            set({
              employee: profileToEmployee(raw),
              effectivePermissions: mapCorePermissionsToEffective(
                raw.permissions,
              ),
              canImpersonate: raw.email === "admin@liouni.com",
            });
          } catch {
            // non-blocking
          }
        } catch (err: unknown) {
          const message =
            (err as { response?: { data?: { message?: string } } })?.response
              ?.data?.message ?? "Đăng nhập thất bại";
          set({ loading: false, error: message });
          throw err;
        }
      },

      logoutAction: async () => {
        const { refreshToken } = get();
        if (refreshToken) {
          try {
            await logoutApi(refreshToken);
          } catch {
            // best-effort: revoke trên BE, không block local clear
          }
        }
        set({
          accessToken: null,
          refreshToken: null,
          expiresAt: null,
          _raw: null,
          employee: null,
          profile: null,
          effectivePermissions: [],
          loading: false,
          error: null,
          impersonation: null,
        });
        useUIStore.getState().resetShellState();
        useAppStore.getState().logout();
      },

      clearAuth: () => {
        set({
          accessToken: null,
          _raw: null,
          employee: null,
          profile: null,
          effectivePermissions: [],
          loading: false,
          error: null,
          impersonation: null,
        });
        useAppStore.getState().logout();
      },

      updateProfileAction: async (payload) => {
        set({ loading: true, error: null });
        try {
          const data = await selfUpdateProfileApi(payload);
          set((state) => ({
            loading: false,
            error: null,
            profile: state.profile
              ? {
                  ...state.profile,
                  email: data.email,
                }
              : state.profile,
            employee: state.employee
              ? {
                  ...state.employee,
                  email: data.email,
                  full_name: data.full_name ?? state.employee.full_name,
                  phone: data.phone,
                  notes: data.notes,
                }
              : state.employee,
          }));
        } catch (err: unknown) {
          const message =
            (err as { response?: { data?: { message?: string } } })?.response
              ?.data?.message ?? "Cập nhật hồ sơ thất bại";
          set({ loading: false, error: message });
          throw err;
        }
      },

      changePasswordAction: async (oldPassword, newPassword) => {
        set({ loading: true, error: null });
        try {
          await changePasswordApi({ oldPassword, newPassword });
          set({ loading: false, error: null });
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
          const raw = await getProfileApi();
          const profile: UserProfile = {
            id: raw.id,
            email: raw.email,
            status: raw.status,
          };
          set({
            profile,
            employee: profileToEmployee(raw),
            effectivePermissions: mapCorePermissionsToEffective(
              raw.permissions,
            ),
            canImpersonate: raw.email === "admin@liouni.com",
          });
          useAppStore.getState().login();
        } catch {
          useAuthStore.getState().clearAuth();
        }
      },

      stopImpersonationAction: async () => {
        const {
          actorAccessToken,
          actorRefreshToken,
          actorExpiresAt,
          impersonation,
        } = get();
        if (!impersonation?.active || !actorAccessToken) return;

        try {
          const raw = localStorage.getItem("erp-auth");
          const obj = raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
          obj.state = {
            ...(obj.state as object | undefined),
            accessToken: actorAccessToken,
            refreshToken: actorRefreshToken,
            expiresAt: actorExpiresAt,
            actorAccessToken: null,
            actorRefreshToken: null,
            actorExpiresAt: null,
            impersonation: null,
          };
          localStorage.setItem("erp-auth", JSON.stringify(obj));
        } catch {
          // silent
        }

        set({
          accessToken: actorAccessToken,
          refreshToken: actorRefreshToken,
          expiresAt: actorExpiresAt,
          actorAccessToken: null,
          actorRefreshToken: null,
          actorExpiresAt: null,
          impersonation: { active: false },
        });

        useUIStore.getState().resetShellState();
        await get().bootstrapAction();
        useUIStore.getState().showToast({
          title: "Đã quay lại admin",
        });
      },

      impersonateAction: async (targetUserId: string) => {
        const { profile, accessToken, refreshToken, expiresAt } = get();
        if (!profile || profile.email !== "admin@liouni.com") return;

        try {
          const data = await impersonateApi(targetUserId);

          try {
            const raw = localStorage.getItem("erp-auth");
            const obj = raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
            obj.state = {
              ...(obj.state as object | undefined),
              actorAccessToken: accessToken,
              actorRefreshToken: refreshToken,
              actorExpiresAt: expiresAt,
              impersonation: {
                active: true,
                actor: { id: profile.id, email: profile.email },
              },
            };
            localStorage.setItem("erp-auth", JSON.stringify(obj));
          } catch {
            // silent
          }

          set({
            accessToken: data.accessToken,
            refreshToken: data.refreshToken ?? null,
            expiresAt: data.expiresIn
              ? Date.now() + data.expiresIn * 1000
              : null,
            actorAccessToken: accessToken,
            actorRefreshToken: refreshToken,
            actorExpiresAt: expiresAt,
            impersonation: {
              active: true,
              actor: { id: profile.id, email: profile.email },
            },
          });

          useUIStore.getState().resetShellState();
          await get().bootstrapAction();
          useUIStore.getState().showToast({
            title: "Đã đăng nhập dưới quyền user khác",
          });
        } catch (err: unknown) {
          const message =
            (err as { response?: { data?: { message?: string } } })?.response
              ?.data?.message ?? "Chuyển đổi user thất bại";
          useUIStore.getState().showToast({
            title: "Lỗi",
            description: message,
            variant: "destructive",
          });
          throw err;
        }
      },
    }),
    {
      name: "erp-auth",
      partialize: (s) => ({
        accessToken: s.accessToken,
        refreshToken: s.refreshToken,
        expiresAt: s.expiresAt,
        profile: s.profile,
        employee: s.employee,
        effectivePermissions: s.effectivePermissions,
        impersonation: s.impersonation,
        actorAccessToken: s.actorAccessToken,
        actorRefreshToken: s.actorRefreshToken,
        actorExpiresAt: s.actorExpiresAt,
      }),
    },
  ),
);
