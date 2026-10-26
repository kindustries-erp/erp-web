import React from "react";
import { act, renderHook } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useVinfastPartsStockExportDrawer } from "./VinfastPartsStockExportDrawer.hook";
import { vinfastStockExportApi } from "../api/vinfastStockExportApi";
import { useVinfastStockExportProgressStore } from "../stores/useVinfastStockExportProgressStore";

const mockDownloadReadyFile = vi.fn();

vi.mock("../hooks/useVinfastStockExportProgress", () => ({
  useVinfastStockExportProgress: () => ({
    downloadReadyFile: mockDownloadReadyFile,
  }),
}));

vi.mock("../api/vinfastStockExportApi", () => ({
  vinfastStockExportApi: {
    startBackgroundExport: vi.fn(),
    listBackgroundHistory: vi.fn().mockResolvedValue({ items: [], total: 0 }),
    downloadBackgroundFile: vi.fn(),
  },
}));

vi.mock("@/v2/shared/hooks/useV2Translation", () => ({
  useV2Translation: () => ({
    t: (_key: string, fallback?: any) =>
      typeof fallback === "object"
        ? fallback.defaultValue || _key
        : fallback || _key,
  }),
}));

describe("useVinfastPartsStockExportDrawer", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    vi.clearAllMocks();
    useVinfastStockExportProgressStore.getState().resetProgress();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);

  it("automatically downloads file when export result is reused", async () => {
    vi.mocked(
      vinfastStockExportApi.startBackgroundExport,
    ).mockResolvedValueOnce({
      jobId: "job-vinfast-reused",
      message: "Reused",
      reused: true,
    });

    const { result } = renderHook(
      () =>
        useVinfastPartsStockExportDrawer({
          open: true,
          buildBaseQuery: () => ({}),
        }),
      { wrapper },
    );

    await act(async () => {
      await result.current.handleStartExport();
    });

    expect(vinfastStockExportApi.startBackgroundExport).toHaveBeenCalled();
    expect(mockDownloadReadyFile).toHaveBeenCalledWith(
      "job-vinfast-reused",
      undefined,
    );
  });

  it("automatically downloads when tracked job transitions to ready via SSE", async () => {
    vi.mocked(
      vinfastStockExportApi.startBackgroundExport,
    ).mockResolvedValueOnce({
      jobId: "job-vinfast-sse",
      message: "Started",
      reused: false,
    });

    const { result } = renderHook(
      () =>
        useVinfastPartsStockExportDrawer({
          open: true,
          buildBaseQuery: () => ({}),
        }),
      { wrapper },
    );

    await act(async () => {
      await result.current.handleStartExport();
    });

    expect(mockDownloadReadyFile).not.toHaveBeenCalled();

    // Giả lập SSE chuyển sang trạng thái ready
    act(() => {
      useVinfastStockExportProgressStore.setState({
        jobId: "job-vinfast-sse",
        ready: true,
        fileName: "vinfast-stock-done.xlsx",
      });
    });

    expect(mockDownloadReadyFile).toHaveBeenCalledWith(
      "job-vinfast-sse",
      "vinfast-stock-done.xlsx",
    );
  });
});
