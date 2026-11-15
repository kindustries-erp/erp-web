import {
  loginSession,
  type LoginSessionData,
} from "@/v2/shared/api/authSessionsApi";
import { V2_API_BASE_URL } from "@/v2/shared/api/v2HttpClient";

/** Đăng nhập V2: gọi thẳng `/api/v2/auth-sessions/login`, không đi qua code V1. */
export async function executeV2Login(payload: {
  email: string;
  password: string;
}): Promise<LoginSessionData> {
  return loginSession(V2_API_BASE_URL, payload);
}
