import axios from "axios";

/** Gốc route auth V2 (module `auth-sessions` của API). */
export const AUTH_SESSIONS_PATH = "/api/v2/auth-sessions";

/** Hợp đồng chung của API V2: `{ message, data }`. */
export interface AuthSessionsEnvelope<T> {
  message: string;
  data: T;
}

export interface RefreshedSessionData {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

/** Dạng cũ (snake_case) mà `authStore` và các call site refresh đang dùng; map ở đúng một chỗ này. */
export interface RefreshedSession {
  access_token: string;
  refresh_token: string;
  expires: number;
}

/**
 * Làm mới phiên bằng axios trần (không interceptor, tránh vòng lặp 401).
 * Server cũng chấp nhận một lần refresh token của v1 để người đang đăng nhập không bị văng.
 */
export async function refreshSession(
  baseUrl: string,
  refreshToken: string,
  timeout = 15000,
): Promise<RefreshedSession> {
  const { data } = await axios.post<AuthSessionsEnvelope<RefreshedSessionData>>(
    `${baseUrl}${AUTH_SESSIONS_PATH}/refresh`,
    { refreshToken },
    { headers: { "Content-Type": "application/json" }, timeout },
  );
  const session = data.data;
  return {
    access_token: session.accessToken,
    refresh_token: session.refreshToken,
    expires: session.expiresIn,
  };
}

export interface LoginSessionData {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
  user: {
    id: string;
    email: string;
    status: string;
    employeeId: string | null;
  };
  preferences?: Record<string, unknown>;
}

/** Đăng nhập V2 bằng axios trần (chưa có phiên, không cần interceptor). Trả `data` đã bóc khỏi `{ message, data }`. */
export async function loginSession(
  baseUrl: string,
  payload: { email: string; password: string },
  timeout = 30000,
): Promise<LoginSessionData> {
  const { data } = await axios.post<AuthSessionsEnvelope<LoginSessionData>>(
    `${baseUrl}${AUTH_SESSIONS_PATH}/login`,
    payload,
    { headers: { "Content-Type": "application/json" }, timeout },
  );
  return data.data;
}
