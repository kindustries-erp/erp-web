// ─────────────────────────────────────────────────────────────────────────────
// ERP CORE auth API — gọi BE local auth Postgres
// ─────────────────────────────────────────────────────────────────────────────
import axiosInstance from "@/core/api/axiosInstance";
import {
  AUTH_SESSIONS_PATH,
  type AuthSessionsEnvelope,
} from "@/v2/shared/api/authSessionsApi";

export interface UserPreferencesPayload {
  theme?: string;
  language?: string;
  tableConfigs?: Record<string, any>;
  uiConfigs?: Record<string, any>;
}

export interface CoreLoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // seconds
  tokenType: string;
  user: {
    id: string;
    email: string;
    status: string;
    employeeId: string | null;
  };
  preferences?: UserPreferencesPayload;
}

export interface CoreProfileResponse {
  id: string;
  email: string;
  status: string;
  employeeId: string | null;
  employee: {
    id: string;
    employeeCode: string;
    fullName: string;
    email: string | null;
    phone: string | null;
    status: string;
    userId: string | null;
    notes?: string | null;
  } | null;
  permissions?: {
    resource: string;
    action: string;
    conditions?: any;
  }[];
  preferences?: UserPreferencesPayload;
  createdAt: string;
  updatedAt: string;
}

export interface CoreSelfUpdateProfileRequest {
  email?: string;
  full_name?: string | null;
  phone?: string | null;
  notes?: string | null;
}

export interface CoreSelfUpdateProfileData {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  notes: string | null;
}

export interface CoreChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

/** Gọi auth V2 (`/api/v2/auth-sessions`); bóc `{ message, data }` về đúng kiểu cũ để `authStore` không đổi. */
export async function loginApi(payload: {
  email: string;
  password: string;
}): Promise<CoreLoginResponse> {
  const { data } = await axiosInstance.post<
    AuthSessionsEnvelope<CoreLoginResponse>
  >(`${AUTH_SESSIONS_PATH}/login`, payload, { _silentSuccess: true });
  return data.data;
}

export async function getProfileApi(): Promise<CoreProfileResponse> {
  const { data } = await axiosInstance.get<
    AuthSessionsEnvelope<CoreProfileResponse>
  >(`${AUTH_SESSIONS_PATH}/profile`, { _silentError: true });
  return data.data;
}

export async function impersonateApi(
  targetUserId: string,
): Promise<CoreLoginResponse> {
  const { data } = await axiosInstance.post<
    AuthSessionsEnvelope<CoreLoginResponse>
  >(`${AUTH_SESSIONS_PATH}/impersonate`, { targetUserId });
  return data.data;
}

/** Phải gọi V2: session V2 chỉ bị thu hồi khi đăng xuất qua V2. */
export async function logoutApi(refreshToken: string): Promise<void> {
  await axiosInstance.post(
    `${AUTH_SESSIONS_PATH}/logout`,
    { refreshToken },
    { _silentSuccess: true, _silentError: true },
  );
}

/** V2 dùng camelCase (`fullName`); giữ kiểu snake_case cũ ở đây để UI hiện có không đổi. */
export async function selfUpdateProfileApi(
  payload: CoreSelfUpdateProfileRequest,
): Promise<CoreSelfUpdateProfileData> {
  const { data } = await axiosInstance.patch<
    AuthSessionsEnvelope<{
      id: string;
      email: string;
      fullName: string | null;
      phone: string | null;
      notes: string | null;
    }>
  >(`${AUTH_SESSIONS_PATH}/profile`, {
    email: payload.email,
    fullName: payload.full_name,
    phone: payload.phone,
    notes: payload.notes,
  });
  const result = data.data;
  return {
    id: result.id,
    email: result.email,
    full_name: result.fullName,
    phone: result.phone,
    notes: result.notes,
  };
}

export async function changePasswordApi(
  payload: CoreChangePasswordRequest,
): Promise<{ message: string }> {
  const { data } = await axiosInstance.post<{ message: string }>(
    `${AUTH_SESSIONS_PATH}/change-password`,
    payload,
  );
  return data;
}
