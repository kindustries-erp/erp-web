// ─────────────────────────────────────────────────────────────────────────────
// ERP CORE auth API — gọi BE local auth Postgres, không dùng Directus
// ─────────────────────────────────────────────────────────────────────────────
import axiosInstance from "@/core/api/axiosInstance";

export interface CoreLoginResponse {
  accessToken: string;
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
  createdAt: string;
  updatedAt: string;
}

export async function loginApi(payload: {
  email: string;
  password: string;
}): Promise<CoreLoginResponse> {
  const { data } = await axiosInstance.post<CoreLoginResponse>(
    "/auth/login",
    payload,
    { _silentSuccess: true },
  );
  return data;
}

export async function getProfileApi(): Promise<CoreProfileResponse> {
  const { data } = await axiosInstance.get<CoreProfileResponse>(
    "/auth/profile",
    {
      _silentError: true,
    },
  );
  return data;
}
