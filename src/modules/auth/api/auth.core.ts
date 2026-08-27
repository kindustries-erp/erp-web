// ─────────────────────────────────────────────────────────────────────────────
// ERP CORE auth API — gọi BE local auth Postgres, không dùng Directus
// ─────────────────────────────────────────────────────────────────────────────
import axiosInstance from "@/core/api/axiosInstance";

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
    legacyDirectusUserId: string | null;
  };
  preferences?: UserPreferencesPayload;
}

export interface CoreProfileResponse {
  id: string;
  email: string;
  status: string;
  employeeId: string | null;
  legacyDirectusUserId: string | null;
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

export async function loginApi(payload: {
  email: string;
  password: string;
}): Promise<CoreLoginResponse> {
  const { data } = await axiosInstance.post<CoreLoginResponse>(
    "/api/v1/auth/login",
    payload,
    { _silentSuccess: true },
  );
  return data;
}

export async function getProfileApi(): Promise<CoreProfileResponse> {
  const { data } = await axiosInstance.get<CoreProfileResponse>(
    "/api/v1/auth/profile",
    {
      _silentError: true,
    },
  );
  return data;
}

export async function impersonateApi(
  targetUserId: string,
): Promise<CoreLoginResponse> {
  const { data } = await axiosInstance.post<CoreLoginResponse>(
    "/api/v1/auth/impersonate",
    { targetUserId },
  );
  return data;
}

export async function logoutApi(refreshToken: string): Promise<void> {
  await axiosInstance.post(
    "/api/v1/auth/logout",
    { refresh_token: refreshToken },
    { _silentSuccess: true, _silentError: true },
  );
}

export async function selfUpdateProfileApi(
  payload: CoreSelfUpdateProfileRequest,
): Promise<CoreSelfUpdateProfileData> {
  const { data } = await axiosInstance.patch<{
    message: string;
    data: CoreSelfUpdateProfileData;
  }>("/api/v1/auth/profile", payload);
  return data.data;
}

export async function changePasswordApi(
  payload: CoreChangePasswordRequest,
): Promise<{ message: string }> {
  const { data } = await axiosInstance.post<{ message: string }>(
    "/api/v1/auth/change-password",
    payload,
  );
  return data;
}
