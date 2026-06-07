// ─────────────────────────────────────────────────────────────────────────────
// ERP CORE auth store — local JWT, không dùng Directus
// Giữ nguyên tên export để không vỡ component cũ
// ─────────────────────────────────────────────────────────────────────────────
import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  loginApi,
  getProfileApi,
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
  full_name?: string;
  phone?: string | null;
  notes?: string | null;
}

// ── Helpers — build Employee stub từ CoreProfileResponse ─────────────────────

function profileToEmployee(p: CoreProfileResponse): Employee {
  return {
    id: p.id,
    email: p.email,
    full_name: p.email, // placeholder cho đến khi BE trả full_name
    phone: null,
    notes: null,
    employee_code: "—",
    status: p.status,
    department_id: { department_name: "—" },
    position_id: { position_name: "—" },
  };
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
  canImpersonate: false;
  impersonation: ImpersonationMetadata | null;
  actorAccessToken: string | null;
  actorRefreshToken: string | null;
  actorExpiresAt: number | null;
  _raw: CoreLoginResponse | null; // internal — lưu raw response

  loginAction: (email: string, password: string) => Promise<void>;
  logoutAction: () => Promise<void>;
  clearAuth: () => void;
  updateProfileAction: (payload: SelfUpdateProfileRequest) => Promise<void>;
  changePasswordAction: (newPassword: string) => Promise<void>;
  bootstrapAction: () => Promise<void>;
  stopImpersonationAction: (reason?: string) => Promise<void>;
  impersonateAction: (targetUserId: string) => Promise<void>;
}

// ── Store ─────────────────────────────────────────────────────────────────────

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
            _raw: data,
            profile,
            loading: false,
            error: null,
            impersonation: { active: false },
          });
          useUIStore.getState().resetShellState();
          useAppStore.getState().login();
          // Best-effort: load full profile
          try {
            const raw = await getProfileApi();
            set({ employee: profileToEmployee(raw) });
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

      updateProfileAction: async (_payload) => {
        // TODO: wire to core BE update endpoint khi có
        return;
      },

      changePasswordAction: async (_newPassword) => {
        // TODO: wire to core BE change-password endpoint khi có
        return;
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
          set({ profile, employee: profileToEmployee(raw) });
          useAppStore.getState().login();
        } catch {
          useAuthStore.getState().clearAuth();
        }
      },

      // no-op stubs — core không có impersonation
      stopImpersonationAction: async () => {},
      impersonateAction: async () => {},
    }),
    {
      name: "erp-auth",
      partialize: (s) => ({
        accessToken: s.accessToken,
        profile: s.profile,
        employee: s.employee,
      }),
    },
  ),
);
