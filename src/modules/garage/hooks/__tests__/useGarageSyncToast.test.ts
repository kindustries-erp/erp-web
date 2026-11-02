import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { toast } from "react-hot-toast";
import { useSyncGarageBranches, useSyncGarageAll } from "../useGarage";
import { garageApi } from "../../api/garageApi";

vi.mock("../../api/garageApi", () => ({
  garageApi: {
    syncBranches: vi.fn(),
    syncAll: vi.fn(),
  },
}));

vi.mock("react-hot-toast", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
}

describe("garage sync toasts reflect per-account failures", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows error when an account fails branch sync", async () => {
    vi.mocked(garageApi.syncBranches).mockResolvedValue({
      success: false,
      accounts: [{ accountKey: "OJ", ok: false, error: "HTTP 401" }],
      message: "Đồng bộ chi nhánh lỗi cho: OJ (HTTP 401)",
    } as any);

    const { result } = renderHook(() => useSyncGarageBranches(), {
      wrapper: createWrapper(),
    });
    await act(async () => {
      result.current.mutate();
    });

    await waitFor(() => expect(toast.error).toHaveBeenCalledTimes(1));
    expect(toast.error).toHaveBeenCalledWith(
      "Đồng bộ chi nhánh lỗi cho: OJ (HTTP 401)",
    );
    expect(toast.success).not.toHaveBeenCalled();
  });

  it("shows success when every account syncs branches", async () => {
    vi.mocked(garageApi.syncBranches).mockResolvedValue({
      success: true,
      accounts: [{ accountKey: "MAIN", ok: true }],
      message: "Branches synced successfully.",
    } as any);

    const { result } = renderHook(() => useSyncGarageBranches(), {
      wrapper: createWrapper(),
    });
    await act(async () => {
      result.current.mutate();
    });

    await waitFor(() => expect(toast.success).toHaveBeenCalledTimes(1));
    expect(toast.error).not.toHaveBeenCalled();
  });

  it("shows error for a partial all-branches sync", async () => {
    vi.mocked(garageApi.syncAll).mockResolvedValue({
      success: false,
      message: "Đồng bộ có lỗi: OJ/b-oj: Kgara API Error: 500",
    } as any);

    const { result } = renderHook(() => useSyncGarageAll(), {
      wrapper: createWrapper(),
    });
    await act(async () => {
      result.current.mutate({ allBranches: true });
    });

    await waitFor(() => expect(toast.error).toHaveBeenCalledTimes(1));
    expect(garageApi.syncAll).toHaveBeenCalledWith({ allBranches: true });
    expect(toast.success).not.toHaveBeenCalled();
  });
});
