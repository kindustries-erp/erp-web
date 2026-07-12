// ─────────────────────────────────────────────────────────────────────────────
// ERP CORE auth API — gọi BE local auth Postgres, không dùng Directus
// ─────────────────────────────────────────────────────────────────────────────
import axiosInstance from "@/core/api/axiosInstance";

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
}

export interface CoreProfileResponse {
  id: string;
  email: string;
  status: string;
  employeeId: string | null;
  legacyDirectusUserId: string | null;
  permissions?: {
    resource: string;
    action: string;

    conditions?: any;
  }[];
  createdAt: string;
  updatedAt: string;
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
