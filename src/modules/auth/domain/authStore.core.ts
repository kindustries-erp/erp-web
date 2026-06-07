// ─────────────────────────────────────────────────────────────────────────────
// ERP CORE auth store — local JWT, không có Directus/impersonation/refresh
// ─────────────────────────────────────────────────────────────────────────────
import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  loginApi,
  getProfileApi,
  type CoreProfileResponse,
} from "@/modules/auth/api/auth.core";
import { useAppStore } from "@/core/config/appStore";
import { useUIStore } from "@/core/config/uiStore";

interface CoreAuthState {
  accessToken: string | null;
  profile: CoreProfileResponse | null;
  loading: boolean;
  error: string | null;

  loginAction: (email: string, password: string) => Promise<void>;
  logoutAction: () => void;
  clearAuth: () => void;
  bootstrapAction: () => Promise<void>;
}

export const useAuthStore = create<CoreAuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      profile: null,
      loading: false,
      error: null,

      loginAction: async (email, password) => {
        set({ loading: true, error: null });
        try {
          const data = await loginApi({ email, password });
          set({ accessToken: data.accessToken, loading: false });
          // Set isLoggedIn ở appStore để App.tsx render shell
          useAppStore.getState().login();
          useUIStore.getState().resetShellState();
          // Fetch profile sau login
          try {
            const profile = await getProfileApi();
            set({ profile });
          } catch {
            // profile là nice-to-have, không block login
          }
        } catch (err: unknown) {
          const message =
            (err as { response?: { data?: { message?: string } } })?.response
              ?.data?.message ?? "Đăng nhập thất bại";
          set({ loading: false, error: message });
          throw err;
        }
      },

      logoutAction: () => {
        set({
          accessToken: null,
          profile: null,
          loading: false,
          error: null,
        });
        useUIStore.getState().resetShellState();
        useAppStore.getState().logout();
      },

      clearAuth: () => {
        set({
          accessToken: null,
          profile: null,
          loading: false,
          error: null,
        });
        useAppStore.getState().logout();
      },

      bootstrapAction: async () => {
        const { accessToken } = useAuthStore.getState();
        if (!accessToken) return;
        try {
          const profile = await getProfileApi();
          set({ profile });
          // Đảm bảo appStore đồng bộ
          useAppStore.getState().login();
        } catch {
          // Token hết hạn hoặc invalid → clear
          useAuthStore.getState().clearAuth();
        }
      },
    }),
    {
      name: "erp-auth",
      partialize: (s) => ({
        accessToken: s.accessToken,
        profile: s.profile,
      }),
    },
  ),
);
