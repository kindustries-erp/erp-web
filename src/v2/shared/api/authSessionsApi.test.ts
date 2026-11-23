import axios from "axios";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  AUTH_SESSIONS_PATH,
  loginSession,
  refreshSession,
} from "./authSessionsApi";

describe("refreshSession", () => {
  afterEach(() => vi.restoreAllMocks());

  it("posts camelCase refreshToken to auth-sessions and maps back to the legacy shape", async () => {
    const post = vi.spyOn(axios, "post").mockResolvedValue({
      data: {
        message: "ok",
        data: {
          accessToken: "a",
          refreshToken: "r",
          expiresIn: 28800,
          tokenType: "Bearer",
        },
      },
    });

    const result = await refreshSession("http://api", "old-refresh", 5000);

    expect(post).toHaveBeenCalledWith(
      `http://api${AUTH_SESSIONS_PATH}/refresh`,
      { refreshToken: "old-refresh" },
      expect.objectContaining({ timeout: 5000 }),
    );
    expect(result).toEqual({
      access_token: "a",
      refresh_token: "r",
      expires: 28800,
    });
  });

  it("propagates the error so callers can clear the session", async () => {
    vi.spyOn(axios, "post").mockRejectedValue(new Error("401"));
    await expect(refreshSession("http://api", "x")).rejects.toThrow("401");
  });

  it("loginSession posts to /login and unwraps { message, data }", async () => {
    const post = vi.spyOn(axios, "post").mockResolvedValue({
      data: { message: "ok", data: { accessToken: "a" } },
    });
    const result = await loginSession("http://api", {
      email: "a@x.com",
      password: "p",
    });
    expect(post.mock.calls[0][0]).toBe(`http://api${AUTH_SESSIONS_PATH}/login`);
    expect(post.mock.calls[0][1]).toEqual({ email: "a@x.com", password: "p" });
    expect(result).toEqual({ accessToken: "a" });
  });
});
