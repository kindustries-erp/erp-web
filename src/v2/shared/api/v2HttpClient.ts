import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/modules/auth/domain/authStore";
import { useV2DocumentDependencyStore } from "@/v2/shared/stores/useV2DocumentDependencyStore";
import {
  isDocumentInUseError,
  readDocumentDependencies,
} from "@/v2/shared/utils/v2ApiError";

export const V2_API_BASE_URL: string =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:10000";

const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1000;
const RETRYABLE_STATUS = new Set([502, 503, 504]);
const REFRESH_TIMEOUT_MS = 15000;

type RetryConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
  _retryCount?: number;
};

interface RefreshResponse {
  access_token: string;
  refresh_token: string;
  expires: number;
}

export const v2HttpClient = axios.create({
  baseURL: V2_API_BASE_URL,
  timeout: 60000,
  headers: { "Content-Type": "application/json" },
});

// Nhiều request cùng 401 chỉ gọi refresh một lần; các request khác chờ chung promise này.
let refreshInFlight: Promise<string> | null = null;

const refreshAccessToken = (refreshToken: string): Promise<string> => {
  refreshInFlight ??= axios
    .post<RefreshResponse>(
      `${V2_API_BASE_URL}/api/v1/auth/refresh`,
      { refresh_token: refreshToken },
      {
        headers: { "Content-Type": "application/json" },
        timeout: REFRESH_TIMEOUT_MS,
      },
    )
    .then(({ data }) => {
      useAuthStore.setState({
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt: Date.now() + data.expires * 1000,
      });
      return data.access_token;
    })
    .finally(() => {
      refreshInFlight = null;
    });
  return refreshInFlight;
};

const isRetryable = (error: AxiosError): boolean => {
  const method = error.config?.method?.toLowerCase();
  if (method !== "get" && method !== "head" && method !== "options") {
    return false;
  }
  if (
    !error.response &&
    (error.code === "ERR_NETWORK" || error.code === "ECONNABORTED")
  ) {
    return true;
  }
  return Boolean(error.response && RETRYABLE_STATUS.has(error.response.status));
};

const delay = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

v2HttpClient.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState();
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

v2HttpClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as RetryConfig | undefined;
    if (!config) throw error;

    const retryCount = config._retryCount ?? 0;
    if (isRetryable(error) && retryCount < MAX_RETRIES) {
      config._retryCount = retryCount + 1;
      await delay(RETRY_DELAY_MS * config._retryCount);
      return v2HttpClient(config);
    }

    if (isDocumentInUseError(error)) {
      const { message, dependencies } = readDocumentDependencies(error);
      useV2DocumentDependencyStore
        .getState()
        .openModal(message ?? "", dependencies);
      throw error;
    }

    if (error.response?.status !== 401 || config._retry) throw error;

    const { refreshToken, clearAuth } = useAuthStore.getState();
    if (!refreshToken) {
      clearAuth();
      throw error;
    }

    config._retry = true;
    try {
      const accessToken = await refreshAccessToken(refreshToken);
      config.headers.Authorization = `Bearer ${accessToken}`;
      return v2HttpClient(config);
    } catch (refreshError) {
      useAuthStore.getState().clearAuth();
      throw refreshError;
    }
  },
);
