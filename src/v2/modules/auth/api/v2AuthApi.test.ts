import { describe, it, expect, vi } from "vitest";
import { executeV2Login } from "./v2AuthApi";
import * as authApiModule from "@/modules/auth/api/auth";

vi.mock("@/modules/auth/api/auth", () => ({
  loginApi: vi.fn(),
}));

describe("executeV2Login", () => {
  it("should delegate login call to v1 loginApi with identical payload", async () => {
    const mockResponse = {
      message: "success",
      employee: { id: "emp-1" },
      access_token: "mock-token",
      refresh_token: "mock-refresh",
      expires: 3600,
    } as unknown as authApiModule.LoginResponse;

    vi.mocked(authApiModule.loginApi).mockResolvedValueOnce(mockResponse);

    const payload = { email: "admin@liouni.com", password: "password123" };
    const result = await executeV2Login(payload);

    expect(authApiModule.loginApi).toHaveBeenCalledWith(payload);
    expect(result).toEqual(mockResponse);
  });
});
