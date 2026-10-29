import {
  loginApi,
  type LoginRequest,
  type LoginResponse,
} from "@/modules/auth/api/auth";

/**
 * Wrapper API đăng nhập V2 - Tái sử dụng 100% endpoint V1 hiện hành (/api/v1/auth/login)
 */
export async function executeV2Login(
  payload: LoginRequest,
): Promise<LoginResponse> {
  return loginApi(payload);
}
