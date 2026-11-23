import { describe, it, expect, vi } from "vitest";
import { executeV2Login } from "./v2AuthApi";
import * as sessions from "@/v2/shared/api/authSessionsApi";

vi.mock("@/v2/shared/api/authSessionsApi", () => ({
  loginSession: vi.fn(),
}));

describe("executeV2Login", () => {
  it("calls the V2 login helper with the identical payload and returns its data", async () => {
    const mockResponse = {
      accessToken: "mock-token",
      refreshToken: "mock-refresh",
      expiresIn: 3600,
      tokenType: "Bearer",
      user: {
        id: "u1",
        email: "admin@liouni.com",
        status: "ACTIVE",
        employeeId: null,
      },
    } satisfies sessions.LoginSessionData;
    vi.mocked(sessions.loginSession).mockResolvedValueOnce(mockResponse);

    const payload = { email: "admin@liouni.com", password: "password123" };
    const result = await executeV2Login(payload);

    expect(sessions.loginSession).toHaveBeenCalledWith(
      expect.any(String),
      payload,
    );
    expect(result).toEqual(mockResponse);
  });
});
