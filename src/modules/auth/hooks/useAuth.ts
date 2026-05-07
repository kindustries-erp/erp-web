import { useAuthStore } from "@/modules/auth/domain/authStore";

/**
 * Convenience hook — exposes only the subset of auth state
 * that components typically need.
 */
export function useAuth() {
  const { accessToken, loading, error, loginAction, logoutAction, clearAuth } =
    useAuthStore();

  return {
    isAuthenticated: !!accessToken,
    loading,
    error,
    loginAction,
    logoutAction,
    clearAuth,
  };
}
