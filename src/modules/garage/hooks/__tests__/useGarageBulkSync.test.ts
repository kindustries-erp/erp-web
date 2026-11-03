import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { toast } from "react-hot-toast";
import {
  GARAGE_BULK_SYNC_STATUS_KEY,
  useGarageBulkSyncStatus,
  useStartGarageBulkSync,
} from "../useGarageBulkSync";
import { garageApi } from "../../api/garageApi";

vi.mock("../../api/garageApi", () => ({
  garageApi: {
    startAllBranchesSync: vi.fn(),
    getAllBranchesSyncStatus: vi.fn(),
  },
}));

vi.mock("react-hot-toast", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const running = {
  status: "running",
  scope: "cases",
  startedAt: "2026-11-02T10:00:00.000Z",
  finishedAt: null,
  totalBranches: 2,
  completedBranches: 1,
  currentBranch: null,
  accounts: [],
  results: [],
  message: null,
};

const completed = {
  ...running,
  status: "completed",
  completedBranches: 2,
  message: "Hoàn tất đồng bộ tất cả chi nhánh.",
  results: [{ branchExternalId: "b-main", accountKey: "MAIN", ok: true }],
};

const partial = {
  ...completed,
  message: "Hoàn tất có chi nhánh lỗi, xem chi tiết từng chi nhánh.",
  results: [
    { branchExternalId: "b-main", accountKey: "MAIN", ok: true },
    {
      branchExternalId: "b-oj",
      accountKey: "OJ",
      ok: false,
      error: "HTTP 500",
    },
  ],
};

function setup() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: Infinity } },
  });
  const wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
  return { queryClient, wrapper };
}

describe("garage bulk sync", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(garageApi.getAllBranchesSyncStatus).mockResolvedValue(
      completed as any,
    );
  });

  it("stores the started job status in the cache", async () => {
    vi.mocked(garageApi.startAllBranchesSync).mockResolvedValue(running as any);
    const { queryClient, wrapper } = setup();

    const { result } = renderHook(() => useStartGarageBulkSync(), { wrapper });
    await act(async () => {
      await result.current.mutateAsync({ scope: "all" });
    });

    expect(garageApi.startAllBranchesSync).toHaveBeenCalledWith({
      scope: "all",
    });
    expect(queryClient.getQueryData(GARAGE_BULK_SYNC_STATUS_KEY)).toEqual(
      running,
    );
  });

  it("notifies success once and calls onCompleted when a running job finishes", async () => {
    const { queryClient, wrapper } = setup();
    queryClient.setQueryData(GARAGE_BULK_SYNC_STATUS_KEY, running);
    const onCompleted = vi.fn();
    renderHook(() => useGarageBulkSyncStatus(true, onCompleted), { wrapper });

    act(() => {
      queryClient.setQueryData(GARAGE_BULK_SYNC_STATUS_KEY, completed);
    });

    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith(
        "Hoàn tất đồng bộ tất cả chi nhánh.",
      ),
    );
    expect(toast.success).toHaveBeenCalledTimes(1);
    expect(onCompleted).toHaveBeenCalledTimes(1);
  });

  it("shows an error toast when a branch failed", async () => {
    const { queryClient, wrapper } = setup();
    queryClient.setQueryData(GARAGE_BULK_SYNC_STATUS_KEY, running);
    renderHook(() => useGarageBulkSyncStatus(true), { wrapper });

    act(() => {
      queryClient.setQueryData(GARAGE_BULK_SYNC_STATUS_KEY, partial);
    });

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        "Hoàn tất có chi nhánh lỗi, xem chi tiết từng chi nhánh.",
      ),
    );
    expect(toast.success).not.toHaveBeenCalled();
  });

  it("stays silent for a job that had already finished when the drawer opened", async () => {
    const { queryClient, wrapper } = setup();
    queryClient.setQueryData(GARAGE_BULK_SYNC_STATUS_KEY, completed);
    renderHook(() => useGarageBulkSyncStatus(true), { wrapper });

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(toast.success).not.toHaveBeenCalled();
    expect(toast.error).not.toHaveBeenCalled();
  });
});
