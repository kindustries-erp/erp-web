import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:10000";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

// ── Refresh-queue state ────────────────────────────────────────────────────
let isRefreshing = false;
let waitingQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null) {
  waitingQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token!)));
  waitingQueue = [];
}

// ── LocalStorage helpers (avoids circular imports with authStore) ──────────
function getStoredAuth(): {
  accessToken: string | null;
  refreshToken: string | null;
} {
  try {
    const raw = localStorage.getItem("erp-auth");
    if (!raw) return { accessToken: null, refreshToken: null };
    const parsed = JSON.parse(raw) as {
      state?: { accessToken?: string; refreshToken?: string };
    };
    return {
      accessToken: parsed?.state?.accessToken ?? null,
      refreshToken: parsed?.state?.refreshToken ?? null,
    };
  } catch {
    return { accessToken: null, refreshToken: null };
  }
}

function patchStoredTokens(
  accessToken: string,
  refreshToken: string,
  expiresAt: number,
) {
  try {
    const raw = localStorage.getItem("erp-auth");
    const obj = raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
    obj.state = {
      ...(obj.state as object | undefined),
      accessToken,
      refreshToken,
      expiresAt,
    };
    localStorage.setItem("erp-auth", JSON.stringify(obj));
  } catch {
    // silent
  }
}

/**
 * Reads the actor snapshot from localStorage.
 * Returns non-null actorRefreshToken only when an impersonation session
 * was active and we have a way to restore the actor session.
 */
function getStoredImpersonationSnapshot(): {
  actorRefreshToken: string | null;
} {
  try {
    const raw = localStorage.getItem("erp-auth");
    if (!raw) return { actorRefreshToken: null };
    const parsed = JSON.parse(raw) as {
      state?: { actorRefreshToken?: string };
    };
    return {
      actorRefreshToken: parsed?.state?.actorRefreshToken ?? null,
    };
  } catch {
    return { actorRefreshToken: null };
  }
}

/**
 * Patches localStorage after restoring actor session from impersonation:
 * - Replaces accessToken/refreshToken/expiresAt with actor tokens
 * - Clears actorAccessToken/actorRefreshToken/actorExpiresAt/impersonation
 */
function patchStoredActorRestore(
  accessToken: string,
  refreshToken: string,
  expiresAt: number,
) {
  try {
    const raw = localStorage.getItem("erp-auth");
    const obj = raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
    obj.state = {
      ...(obj.state as object | undefined),
      accessToken,
      refreshToken,
      expiresAt,
      actorAccessToken: null,
      actorRefreshToken: null,
      actorExpiresAt: null,
      impersonation: null,
    };
    localStorage.setItem("erp-auth", JSON.stringify(obj));
  } catch {
    // silent
  }
}

// ── Request interceptor: attach Bearer token ──────────────────────────────
axiosInstance.interceptors.request.use(
  (config) => {
    const { accessToken } = getStoredAuth();
    if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
    return config;
  },
  (error) => Promise.reject(error),
);

// ── Response interceptor: 401 → refresh token → retry ────────────────────
type RetryableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableConfig | undefined;

    // Handle 403 Forbidden errors
    if (error.response?.status === 403) {
      import("@/core/config/appStore").then(({ useAppStore }) => {
        useAppStore.getState().setForbidden(true);
      });
      return Promise.reject(error);
    }

    // Only handle 401 once per request
    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry
    ) {
      return Promise.reject(error);
    }

    const { refreshToken } = getStoredAuth();

    if (!refreshToken) {
      // Check if this is an expired impersonation token
      const { actorRefreshToken } = getStoredImpersonationSnapshot();

      if (actorRefreshToken) {
        // Impersonation token expired — restore actor session
        try {
          const { data } = await axios.post<{
            access_token: string;
            refresh_token: string;
            expires: number;
          }>(
            `${API_BASE_URL}/api/v1/auth/refresh`,
            { refresh_token: actorRefreshToken },
            {
              headers: { "Content-Type": "application/json" },
              timeout: 15000,
            },
          );

          const newExpiresAt = Date.now() + data.expires * 1000;

          patchStoredActorRestore(
            data.access_token,
            data.refresh_token,
            newExpiresAt,
          );

          import("@/modules/auth/domain/authStore").then(({ useAuthStore }) => {
            useAuthStore.setState({
              accessToken: data.access_token,
              refreshToken: data.refresh_token,
              expiresAt: newExpiresAt,
              actorAccessToken: null,
              actorRefreshToken: null,
              actorExpiresAt: null,
              impersonation: null,
            });
            useAuthStore.getState().bootstrapAction();
          });

          import("@/core/config/uiStore").then(({ useUIStore }) => {
            useUIStore.getState().showToast({
              title: "Phiên đăng nhập hộ đã kết thúc",
              description: "Token hết hạn — đã khôi phục tài khoản gốc.",
              variant: "default",
            });
          });
        } catch {
          // Actor refresh also failed — full logout
          import("@/modules/auth/domain/authStore").then(({ useAuthStore }) => {
            useAuthStore.getState().clearAuth();
          });
        }
        // Do NOT retry original request — it was made as impersonated user
        return Promise.reject(error);
      }

      // Normal case: no refresh token, not in impersonation — force logout
      import("@/modules/auth/domain/authStore").then(({ useAuthStore }) => {
        useAuthStore.getState().clearAuth();
      });
      return Promise.reject(error);
    }

    // If a refresh is already in-flight, queue this request
    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        waitingQueue.push({ resolve, reject });
      }).then((newToken) => {
        originalRequest._retry = true;
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return axiosInstance(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      // Use raw axios (not axiosInstance) to avoid interceptor loop
      const { data } = await axios.post<{
        access_token: string;
        refresh_token: string;
        expires: number;
      }>(
        `${API_BASE_URL}/api/v1/auth/refresh`,
        { refresh_token: refreshToken },
        { headers: { "Content-Type": "application/json" }, timeout: 15000 },
      );

      const newExpiresAt = Date.now() + data.expires * 1000;

      // Persist to localStorage immediately so all tabs stay in sync
      patchStoredTokens(data.access_token, data.refresh_token, newExpiresAt);

      // Sync in-memory Zustand store (lazy import to avoid circular dep)
      import("@/modules/auth/domain/authStore").then(({ useAuthStore }) => {
        useAuthStore.setState({
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
          expiresAt: newExpiresAt,
        });
      });

      processQueue(null, data.access_token);
      originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
      return axiosInstance(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      import("@/modules/auth/domain/authStore").then(({ useAuthStore }) => {
        useAuthStore.getState().clearAuth();
      });
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export default axiosInstance;
