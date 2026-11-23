import { beforeEach, describe, expect, it, vi } from "vitest";
import axiosInstance from "@/core/api/axiosInstance";
import {
  changePasswordApi,
  getProfileApi,
  impersonateApi,
  loginApi,
  logoutApi,
  selfUpdateProfileApi,
} from "./auth.core";

vi.mock("@/core/api/axiosInstance", () => ({
  default: { post: vi.fn(), get: vi.fn(), patch: vi.fn() },
}));

const http = vi.mocked(axiosInstance);
const BASE = "/api/v2/auth-sessions";

describe("auth.core (auth V2)", () => {
  beforeEach(() => vi.clearAllMocks());

  it("loginApi gọi /login và bóc data", async () => {
    http.post.mockResolvedValue({
      data: { message: "ok", data: { accessToken: "t" } },
    });
    const result = await loginApi({ email: "a@x.com", password: "p" });
    expect(http.post).toHaveBeenCalledWith(
      `${BASE}/login`,
      { email: "a@x.com", password: "p" },
      { _silentSuccess: true },
    );
    expect(result).toEqual({ accessToken: "t" });
  });

  it("getProfileApi gọi /profile và bóc data", async () => {
    http.get.mockResolvedValue({ data: { message: "OK", data: { id: "u1" } } });
    await expect(getProfileApi()).resolves.toEqual({ id: "u1" });
    expect(http.get.mock.calls[0][0]).toBe(`${BASE}/profile`);
  });

  it("logoutApi gửi refreshToken camelCase tới V2 (để thu hồi session V2)", async () => {
    http.post.mockResolvedValue({ data: {} });
    await logoutApi("rt");
    expect(http.post.mock.calls[0][0]).toBe(`${BASE}/logout`);
    expect(http.post.mock.calls[0][1]).toEqual({ refreshToken: "rt" });
  });

  it("impersonateApi gửi targetUserId", async () => {
    http.post.mockResolvedValue({ data: { data: { accessToken: "x" } } });
    await impersonateApi("u2");
    expect(http.post).toHaveBeenCalledWith(`${BASE}/impersonate`, {
      targetUserId: "u2",
    });
  });

  it("selfUpdateProfileApi đổi snake_case <-> camelCase", async () => {
    http.patch.mockResolvedValue({
      data: {
        data: {
          id: "u1",
          email: "a@x.com",
          fullName: "An",
          phone: null,
          notes: "n",
        },
      },
    });
    const result = await selfUpdateProfileApi({ full_name: "An", notes: "n" });
    expect(http.patch.mock.calls[0][1]).toMatchObject({
      fullName: "An",
      notes: "n",
    });
    expect(result).toEqual({
      id: "u1",
      email: "a@x.com",
      full_name: "An",
      phone: null,
      notes: "n",
    });
  });

  it("changePasswordApi gọi /change-password", async () => {
    http.post.mockResolvedValue({ data: { message: "done" } });
    await expect(
      changePasswordApi({ oldPassword: "o", newPassword: "n12345678" }),
    ).resolves.toEqual({ message: "done" });
    expect(http.post.mock.calls[0][0]).toBe(`${BASE}/change-password`);
  });
});
