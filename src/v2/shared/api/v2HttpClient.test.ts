import axios, { AxiosError, type AxiosAdapter } from "axios";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useAuthStore } from "@/modules/auth/domain/authStore";
import { useV2DocumentDependencyStore } from "@/v2/shared/stores/useV2DocumentDependencyStore";
import { v2HttpClient } from "./v2HttpClient";

const reply = (
  config: Parameters<AxiosAdapter>[0],
  status: number,
  data: unknown = {},
) => {
  const response = { data, status, statusText: "", headers: {}, config };
  if (status >= 400) {
    return Promise.reject(
      new AxiosError("failed", undefined, config, undefined, response as never),
    );
  }
  return Promise.resolve(response);
};

describe("v2HttpClient", () => {
  beforeEach(() => {
    useAuthStore.setState({
      accessToken: "old-token",
      refreshToken: "refresh-token",
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("attaches the bearer token from the shared session", async () => {
    const adapter = vi.fn((config) => reply(config, 200, { ok: true }));
    const response = await v2HttpClient.get("/api/v1/ping", { adapter });

    expect(response.data).toEqual({ ok: true });
    expect(adapter.mock.calls[0][0].headers.Authorization).toBe(
      "Bearer old-token",
    );
  });

  it("refreshes once on 401 and retries the request with the new token", async () => {
    const refresh = vi.spyOn(axios, "post").mockResolvedValue({
      data: {
        access_token: "new-token",
        refresh_token: "new-refresh",
        expires: 3600,
      },
    });
    const adapter = vi.fn((config) =>
      config.headers.Authorization === "Bearer new-token"
        ? reply(config, 200, { retried: true })
        : reply(config, 401),
    );

    const response = await v2HttpClient.post("/api/v1/x", {}, { adapter });

    expect(response.data).toEqual({ retried: true });
    expect(refresh).toHaveBeenCalledTimes(1);
    expect(useAuthStore.getState().accessToken).toBe("new-token");
    expect(useAuthStore.getState().refreshToken).toBe("new-refresh");
  });

  it("clears the session when a 401 cannot be refreshed", async () => {
    useAuthStore.setState({ refreshToken: null });
    const clearAuth = vi.fn();
    useAuthStore.setState({ clearAuth });
    const adapter = vi.fn((config) => reply(config, 401));

    await expect(
      v2HttpClient.post("/api/v1/x", {}, { adapter }),
    ).rejects.toBeInstanceOf(AxiosError);
    expect(clearAuth).toHaveBeenCalledTimes(1);
  });
});

describe("v2HttpClient document dependency conflicts", () => {
  it("opens the dependency modal for DOCUMENT_IN_USE and keeps the error", async () => {
    useV2DocumentDependencyStore.getState().closeModal();
    const adapter = vi.fn((config) =>
      reply(config, 409, {
        code: "DOCUMENT_IN_USE",
        message: "Đối tác đang được sử dụng",
        dependencies: ["PO-001"],
      }),
    );

    await expect(
      v2HttpClient.delete("/api/v1/business-partners/p1", { adapter }),
    ).rejects.toBeInstanceOf(AxiosError);
    expect(useV2DocumentDependencyStore.getState()).toMatchObject({
      isOpen: true,
      message: "Đối tác đang được sử dụng",
      dependencies: ["PO-001"],
    });
  });
});
