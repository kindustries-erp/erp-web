import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { useAppStore } from "@/core/config/appStore";
import { useUIStore } from "@/core/config/uiStore";
import { useAuthStore } from "@/modules/auth/domain/authStore";
import { useDocumentDependencyStore } from "@/core/config/documentDependencyStore";
import { vi } from "@/core/locale/vi";
import { en } from "@/core/locale/en";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:10000";

// ── Custom config flags for opt-out ──────────────────────────────────────────
declare module "axios" {
  interface AxiosRequestConfig {
    /** Set true to suppress the automatic success toast */
    _silentSuccess?: boolean;
    /** Set true to suppress the automatic error toast */
    _silentError?: boolean;
    /** Current retry attempt count (internal) */
    _retryCount?: number;
  }
}

// ── Retry config ─────────────────────────────────────────────────────────────
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1000;
const RETRYABLE_STATUS = new Set([502, 503, 504]);

function isRetryable(error: AxiosError): boolean {
  // Network errors (no response received)
  if (
    !error.response &&
    (error.code === "ERR_NETWORK" || error.code === "ECONNABORTED")
  ) {
    return true;
  }
  // Server errors that are typically transient
  if (error.response && RETRYABLE_STATUS.has(error.response.status)) {
    return true;
  }
  return false;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ── i18n helpers (non-React context) ─────────────────────────────────────────
function tError(key: keyof typeof vi.apiErrors): string {
  const locale = useAppStore.getState().locale;
  const dict = locale === "en" ? en : vi;
  return dict.apiErrors[key];
}

function tToast(key: keyof typeof vi.apiToast): string {
  const locale = useAppStore.getState().locale;
  const dict = locale === "en" ? en : vi;
  return dict.apiToast[key];
}

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

// ── LocalStorage helpers ──────────────────────────────────────────────────
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

// ── Response interceptor: auto-retry for network/5xx errors ───────────────
type RetryableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as RetryableConfig | undefined;
    if (!config) return Promise.reject(error);

    const retryCount = config._retryCount ?? 0;

    if (isRetryable(error) && retryCount < MAX_RETRIES) {
      config._retryCount = retryCount + 1;
      await delay(RETRY_DELAY_MS * config._retryCount);
      return axiosInstance(config);
    }

    return Promise.reject(error);
  },
);

// ── Response interceptor: global SUCCESS toast ────────────────────────────
const MUTATING_METHODS = new Set(["post", "put", "patch", "delete"]);

axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    const config = response.config;
    const method = config.method?.toLowerCase() ?? "";

    // Only show toast for mutating methods, skip if opted out
    if (MUTATING_METHODS.has(method) && !config._silentSuccess) {
      const showToast = useUIStore.getState().showToast;
      let title: string;

      if (method === "post") title = tToast("createSuccess");
      else if (method === "delete") title = tToast("deleteSuccess");
      else title = tToast("updateSuccess");

      showToast({ title, variant: "success" });
    }

    return response;
  },
  // pass errors through to the next interceptor
  (error) => Promise.reject(error),
);

// ── Response interceptor: 401 refresh + global ERROR toast ────────────────

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableConfig | undefined;

    // Handle 403 Forbidden errors
    if (error.response?.status === 403) {
      useAppStore.getState().setForbidden(true);
      return Promise.reject(error);
    }

    // Only handle 401 once per request
    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry
    ) {
      // ── Handle DOCUMENT_IN_USE ──────────────────────────────────────────
      if (error.response?.status === 409) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data = error.response.data as any;
        if (data?.code === "DOCUMENT_IN_USE") {
          useDocumentDependencyStore
            .getState()
            .openModal(
              data.message || tToast("saveFail"),
              data.dependencies || [],
            );
          return Promise.reject(error);
        }
      }

      // ── Global error toast (non-401, non-403) ───────────────────────
      if (!originalRequest?._silentError && error.response?.status !== 401) {
        const apiMsg = (
          error.response?.data as { message?: string | string[] } | undefined
        )?.message;
        const description = Array.isArray(apiMsg)
          ? apiMsg.join("; ")
          : apiMsg || undefined;

        useUIStore.getState().showToast({
          title: tToast("saveFail"),
          description,
          variant: "destructive",
        });
      }
      return Promise.reject(error);
    }

    const { refreshToken } = getStoredAuth();

    if (!refreshToken) {
      const { actorRefreshToken } = getStoredImpersonationSnapshot();

      if (actorRefreshToken) {
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

          useUIStore.getState().showToast({
            title: tError("impersonationEnded"),
            description: tError("impersonationEndedDesc"),
            variant: "default",
          });
        } catch {
          useAuthStore.getState().clearAuth();
        }
        return Promise.reject(error);
      }

      useAuthStore.getState().clearAuth();
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

      patchStoredTokens(data.access_token, data.refresh_token, newExpiresAt);

      useAuthStore.setState({
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt: newExpiresAt,
      });

      processQueue(null, data.access_token);
      originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
      return axiosInstance(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      useAuthStore.getState().clearAuth();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export default axiosInstance;
